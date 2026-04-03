import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from dataclasses import dataclass, field, asdict
from collections import defaultdict
from typing import List, Dict, Tuple, Optional

# ---------------------------------------------------------
# CONSTANTS: Role Ontology & Skill Universe
# ---------------------------------------------------------

ROLE_MAPPING = {
    'Frontend':  {'javascript', 'typescript', 'react', 'vue', 'angular'},
    'Backend':   {'python', 'node.js', 'fastapi', 'django', 'flask', 'go', 'rust', 'ruby', 'java', 'c++', 'c#', 'node', 'cpp'},
    'Database':  {'sql', 'mongodb', 'postgresql', 'redis'},
    'DevOps':    {'docker', 'kubernetes', 'aws', 'gcp', 'azure'},
    'Design':    {'figma', 'ui/ux', 'uiux'},
    'ML/Data':   {'machine learning', 'data science', 'pytorch', 'tensorflow', 'ml'},
}

ALL_KNOWN_SKILLS = set(skill for skills_set in ROLE_MAPPING.values() for skill in skills_set)

ROLE_COLORS = {
    'Frontend': '#00F0FF',
    'Backend':  '#8A2BE2',
    'Database': '#FF9F0A',
    'DevOps':   '#2B6AFF',
    'Design':   '#FF007F',
    'ML/Data':  '#00FF87',
}

# ---------------------------------------------------------
# ADAPTIVE WEIGHTS (Global, Feedback-Driven)
# ---------------------------------------------------------

class AdaptiveWeights:
    """Mutable global scoring weights. Adjusted via feedback signals over time."""

    def __init__(self):
        self.W_COSINE = 0.30
        self.W_ROLE   = 0.45
        self.W_STYLE  = 0.15
        self.W_ML     = 0.10

    def _normalize(self):
        total = self.W_COSINE + self.W_ROLE + self.W_STYLE + self.W_ML
        if total > 0:
            self.W_COSINE /= total
            self.W_ROLE   /= total
            self.W_STYLE  /= total
            self.W_ML     /= total

    def update_from_feedback(self, feedback_collection) -> None:
        """
        Nudge global weights based on aggregate accept/reject signals.
        Called on every match request to stay fresh with new data.
        Requires at least 5 signals before adjusting.
        """
        try:
            accepted = list(feedback_collection.find({"outcome": "accept"}, {"_id": 0}))
            rejected = list(feedback_collection.find({"outcome": "reject"}, {"_id": 0}))
        except Exception:
            return

        if len(accepted) + len(rejected) < 5:
            return

        lr = 0.015  # Small conservative learning rate

        for sample in accepted:
            feats = sample.get("features", {})
            if feats.get("cosine_sim", 0) > 0.55:
                self.W_COSINE += lr
            if feats.get("comp_roles", 0) > 0:
                self.W_ROLE += lr
            if feats.get("style_match", 0) == 1.0:
                self.W_STYLE += lr

        for sample in rejected:
            feats = sample.get("features", {})
            if feats.get("cosine_sim", 0) > 0.55:
                self.W_COSINE = max(0.10, self.W_COSINE - lr * 0.5)
            if feats.get("comp_roles", 0) > 0:
                self.W_ROLE = max(0.15, self.W_ROLE - lr * 0.5)

        self._normalize()

    def as_dict(self) -> Dict[str, float]:
        return {
            "W_COSINE": round(self.W_COSINE, 4),
            "W_ROLE":   round(self.W_ROLE, 4),
            "W_STYLE":  round(self.W_STYLE, 4),
            "W_ML":     round(self.W_ML, 4),
        }


# Module-level singleton weights, shared across all requests
WEIGHTS = AdaptiveWeights()


# ---------------------------------------------------------
# MATCH EXPLANATION (Structured Output Object)
# ---------------------------------------------------------

@dataclass
class MatchExplanation:
    reasons: List[str] = field(default_factory=list)
    matched_skills: List[str] = field(default_factory=list)
    missing_skills: List[str] = field(default_factory=list)
    roles: List[str] = field(default_factory=list)
    skill_match_pct: float = 0.0
    score_breakdown: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------
# SKLEARN LOGISTIC REGRESSION CLASSIFIER (Warm-start)
# ---------------------------------------------------------

def _generate_synthetic_training_data() -> Tuple[np.ndarray, np.ndarray]:
    """
    Synthetic feature dataset to warm-start the LR classifier before
    real feedback data accumulates. Reflects known compatibility patterns.
    Feature order: [cosine_sim, comp_roles, style_match, avail_mult, interest_sim, knn_score]
    """
    np.random.seed(42)
    n = 300

    # Positive class: high-compatibility profiles
    X_pos = np.column_stack([
        np.random.uniform(0.5, 1.0, n // 2),    # cosine_sim
        np.random.randint(1, 4, n // 2).astype(float),  # comp_roles
        np.random.choice([1, 0], n // 2, p=[0.75, 0.25]).astype(float),  # style_match
        np.random.uniform(0.9, 1.15, n // 2),   # avail_mult
        np.random.uniform(0.4, 1.0, n // 2),    # interest_sim
        np.random.uniform(0.6, 1.0, n // 2),    # knn_score
    ])
    y_pos = np.ones(n // 2)

    # Negative class: mismatched profiles
    X_neg = np.column_stack([
        np.random.uniform(0.0, 0.3, n // 2),    # cosine_sim
        np.zeros(n // 2),                        # comp_roles
        np.random.choice([1, 0], n // 2, p=[0.15, 0.85]).astype(float),  # style_match
        np.random.uniform(0.3, 0.5, n // 2),    # avail_mult
        np.random.uniform(0.0, 0.25, n // 2),   # interest_sim
        np.random.uniform(0.0, 0.35, n // 2),   # knn_score
    ])
    y_neg = np.zeros(n // 2)

    X = np.vstack([X_pos, X_neg])
    y = np.concatenate([y_pos, y_neg])
    return X, y


_scaler = StandardScaler()
_classifier = LogisticRegression(max_iter=1000, C=1.0, random_state=42)


def _train_classifier() -> None:
    X, y = _generate_synthetic_training_data()
    _scaler.fit(X)
    _classifier.fit(_scaler.transform(X), y)


# Train once at module import
_train_classifier()


def predict_compatibility(features: Dict[str, float]) -> float:
    """Returns P(compatible) via the LR classifier. Falls back to 0.5 on error."""
    vec = np.array([[
        features.get("cosine_sim", 0.0),
        features.get("comp_roles", 0.0),
        features.get("style_match", 0.0),
        features.get("avail_mult", 1.0),
        features.get("interest_sim", 0.0),
        features.get("knn_score", 0.5),
    ]])
    try:
        return float(_classifier.predict_proba(_scaler.transform(vec))[0][1])
    except Exception:
        return 0.5


# ---------------------------------------------------------
# FEATURE ENGINEERING
# ---------------------------------------------------------

def infer_roles(profile: dict) -> Dict[str, float]:
    """Calculate normalized strength for each role (0.0–1.0)."""
    role_scores: Dict[str, float] = defaultdict(float)
    levels = profile.get("skill_levels", {})

    for skill, level in levels.items():
        s_lower = str(skill).lower()
        score = min(float(level), 5.0)
        for role, skills in ROLE_MAPPING.items():
            if s_lower in skills:
                role_scores[role] += score

    max_score = max(role_scores.values()) if role_scores else 0
    if max_score > 0:
        return {k: v / max_score for k, v in role_scores.items()}
    return {}


def extract_primary_roles(inferred_roles: Dict[str, float], threshold: float = 0.5) -> set:
    return {role for role, score in inferred_roles.items() if score >= threshold}


def get_role_labels(profile: dict, threshold: float = 0.5) -> List[str]:
    """Returns sorted list of human-readable role labels for a profile."""
    roles = infer_roles(profile)
    primary = extract_primary_roles(roles, threshold)
    return sorted(primary)


def build_skill_vector(profile: dict) -> np.ndarray:
    """Fixed-size L2-normalized skill vector."""
    ordered = sorted(list(ALL_KNOWN_SKILLS))
    levels = {str(k).lower(): float(v) for k, v in profile.get("skill_levels", {}).items()}
    raw = np.array([levels.get(sk, 0.0) for sk in ordered], dtype=float)
    norm = np.linalg.norm(raw)
    return raw / norm if norm > 0 else raw


def build_interest_vector(profile: dict, all_known_interests: set) -> np.ndarray:
    if not all_known_interests:
        return np.array([])
    ordered = sorted(list(all_known_interests))
    user_i = {str(i).lower() for i in profile.get("interests", [])}
    raw = np.array([1.0 if i in user_i else 0.0 for i in ordered], dtype=float)
    norm = np.linalg.norm(raw)
    return raw / norm if norm > 0 else raw


# ---------------------------------------------------------
# KNN NEAREST-NEIGHBOR RANKER
# ---------------------------------------------------------

def get_knn_score(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Cosine similarity between two skill vectors as the KNN signal (0–1)."""
    if not np.any(vec_a) or not np.any(vec_b):
        return 0.5
    return float(cosine_similarity([vec_a], [vec_b])[0][0])


def build_knn_index(all_profiles: List[dict]):
    """
    Builds a NearestNeighbors index over all user skill vectors.
    Returns (knn_model, ordered_ids, matrix) or None if insufficient data.
    """
    vectors, ids = [], []
    for p in all_profiles:
        v = build_skill_vector(p)
        if np.any(v):
            vectors.append(v)
            ids.append(p.get("user_id", ""))

    if len(vectors) < 2:
        return None, ids, None

    matrix = np.array(vectors)
    knn = NearestNeighbors(n_neighbors=min(len(vectors), 10), metric="cosine", algorithm="brute")
    knn.fit(matrix)
    return knn, ids, matrix


# ---------------------------------------------------------
# SCORING ALGORITHMS
# ---------------------------------------------------------

def calculate_match_score(
    profile_a: dict,
    profile_b: dict,
    knn_score: Optional[float] = None
) -> Tuple[float, MatchExplanation]:
    """
    Full ML-enhanced user-to-user compatibility scoring.

    Returns:
        (score_0_to_100, MatchExplanation)
    """
    exp = MatchExplanation()

    # ── 1. Skill Analysis ───────────────────────────────
    skills_a = {str(s).lower() for s in profile_a.get("skills", [])}
    skills_b = {str(s).lower() for s in profile_b.get("skills", [])}
    matched_skills = sorted(skills_a & skills_b)
    missing_from_a = sorted(skills_b - skills_a)  # what B has that A lacks

    exp.matched_skills = matched_skills
    exp.missing_skills = missing_from_a[:5]
    exp.skill_match_pct = round(len(matched_skills) / max(len(skills_b), 1), 3)

    if matched_skills:
        exp.reasons.append(f"{len(matched_skills)} shared technical skills: {', '.join(s.title() for s in matched_skills[:3])}")
    if missing_from_a:
        exp.reasons.append(f"Could complement your stack: {', '.join(s.title() for s in missing_from_a[:3])}")

    # ── 2. Cosine Similarity ───────────────────────────
    all_interests = {str(i).lower() for i in profile_a.get("interests", []) + profile_b.get("interests", [])}
    sk_vec_a = build_skill_vector(profile_a)
    sk_vec_b = build_skill_vector(profile_b)
    in_vec_a = build_interest_vector(profile_a, all_interests)
    in_vec_b = build_interest_vector(profile_b, all_interests)

    vec_a = np.concatenate([sk_vec_a, in_vec_a])
    vec_b = np.concatenate([sk_vec_b, in_vec_b])

    cosine_sim = 0.0
    if np.any(vec_a) and np.any(vec_b):
        cosine_sim = float(cosine_similarity([vec_a], [vec_b])[0][0])

    if cosine_sim > 0.65:
        exp.reasons.append("Highly similar technical + interest profile")

    interest_sim = float(cosine_similarity([in_vec_a], [in_vec_b])[0][0]) if (np.any(in_vec_a) and np.any(in_vec_b)) else 0.0

    # ── 3. Role Complementarity ────────────────────────
    roles_a = infer_roles(profile_a)
    roles_b = infer_roles(profile_b)
    prim_a  = extract_primary_roles(roles_a)
    prim_b  = extract_primary_roles(roles_b)

    exp.roles = sorted(prim_b)  # Candidate B's role labels (shown in UI)

    complementary_roles = prim_b - prim_a
    overlap_roles       = prim_a & prim_b

    role_score = 0.0
    if complementary_roles:
        role_score = min(1.0, len(complementary_roles) * 0.4)
        exp.reasons.append(f"Brings complementary expertise: {', '.join(sorted(complementary_roles))}")
    elif overlap_roles:
        role_score = min(1.0, len(overlap_roles) * 0.2)
        exp.reasons.append(f"Shares your core domain: {', '.join(sorted(overlap_roles))}")

    # ── 4. Work Style ──────────────────────────────────
    style_a = str(profile_a.get("work_style", "")).lower()
    style_b = str(profile_b.get("work_style", "")).lower()
    style_match = 1.0 if style_a and style_a == style_b else 0.0
    if style_match:
        exp.reasons.append("Aligned work style preference")

    # ── 5. Availability ────────────────────────────────
    avail_a = str(profile_a.get("availability", "")).lower()
    avail_b = str(profile_b.get("availability", "")).lower()
    avail_mult = 1.0

    if avail_a and avail_b and avail_a != "flexible" and avail_b != "flexible" and avail_a != avail_b:
        avail_mult = 0.40
        exp.reasons.insert(0, "⚠ Availability schedules may conflict")
    elif avail_a == avail_b and avail_a:
        avail_mult = 1.15
        exp.reasons.append("Matching availability windows")

    # ── 6. KNN + LR Blend ─────────────────────────────
    knn_sig = knn_score if knn_score is not None else get_knn_score(sk_vec_a, sk_vec_b)

    features = {
        "cosine_sim":   cosine_sim,
        "comp_roles":   role_score,
        "style_match":  style_match,
        "avail_mult":   avail_mult,
        "interest_sim": interest_sim,
        "knn_score":    knn_sig,
    }

    ml_prob = predict_compatibility(features)

    # ── 7. Final Weighted Score ────────────────────────
    base = (
        WEIGHTS.W_COSINE * cosine_sim +
        WEIGHTS.W_ROLE   * role_score +
        WEIGHTS.W_STYLE  * style_match +
        WEIGHTS.W_ML     * ml_prob
    )
    final_score = min(1.0, max(0.0, base * avail_mult))

    exp.score_breakdown = {
        "cosine":   round(WEIGHTS.W_COSINE * cosine_sim * 100, 1),
        "role":     round(WEIGHTS.W_ROLE   * role_score * 100, 1),
        "style":    round(WEIGHTS.W_STYLE  * style_match * 100, 1),
        "ml_model": round(WEIGHTS.W_ML     * ml_prob * 100, 1),
    }

    if not exp.reasons:
        exp.reasons.append("Potentially compatible teammate")

    # Deduplicate reasons preserving order
    seen, unique = set(), []
    for r in exp.reasons:
        if r not in seen:
            seen.add(r)
            unique.append(r)
    exp.reasons = unique

    return round(final_score * 100, 2), exp


def calculate_project_match_score(project: dict, profile: dict) -> Tuple[float, dict]:
    """
    Scores a candidate's project suitability.

    Returns:
        (score_0_to_100, enriched_dict)
    """
    reasons = []

    profile_skills  = {str(s).lower() for s in profile.get("skills", [])}
    required_skills = {str(s).lower() for s in project.get("required_skills", [])}

    matched = sorted(required_skills & profile_skills)
    missing = sorted(required_skills - profile_skills)

    skill_score = 0.0
    matched_pct = 0.0

    if not required_skills:
        skill_score = 0.8
        matched_pct = 100.0
    else:
        matched_pct  = round(len(matched) / len(required_skills) * 100, 1)
        skill_score  = len(matched) / len(required_skills)
        if not missing:
            reasons.append(f"Has all {len(required_skills)} required skills")
        elif matched:
            reasons.append(f"Covers {len(matched)}/{len(required_skills)} required skills")

    # Role-based partial credit for skill gaps
    roles      = extract_primary_roles(infer_roles(profile), 0.3)
    role_labels = sorted(roles)
    role_bonus  = 0.0

    if missing:
        bridgeable_roles = set()
        for m in missing:
            for role, skill_set in ROLE_MAPPING.items():
                if m in skill_set:
                    bridgeable_roles.add(role)
        intersect = roles & bridgeable_roles
        if intersect:
            role_bonus = min(0.35, 0.15 * len(intersect))
            reasons.append(f"Domain expertise ({', '.join(sorted(intersect))}) bridges skill gaps")

    total_skill_score = min(1.0, skill_score + role_bonus)

    # Interest / domain alignment
    proj_interests = {str(i).lower() for i in project.get("interests", [])}
    prof_interests = {str(i).lower() for i in profile.get("interests", [])}
    interest_score = 0.0
    if proj_interests:
        common = proj_interests & prof_interests
        interest_score = len(common) / len(proj_interests)
        if interest_score > 0.5:
            reasons.append("Strong alignment with project domain/interests")
    else:
        interest_score = 0.5

    # Availability constraint
    avail_user = str(profile.get("availability", "")).lower()
    avail_proj = str(project.get("availability", "")).lower()
    avail_mult = 1.0
    if avail_user and avail_proj and avail_user != "flexible" and avail_proj != "flexible" and avail_user != avail_proj:
        avail_mult = 0.30
        reasons.insert(0, "⚠ Availability conflict with project schedule")
    elif avail_user == avail_proj and avail_user:
        avail_mult = 1.10
        reasons.append("Availability matches project schedule")

    base  = (0.75 * total_skill_score) + (0.25 * interest_score)
    final = round(min(1.0, max(0.0, base * avail_mult)) * 100, 2)

    if not reasons:
        reasons.append("Good overall project fit")

    seen, unique = set(), []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            unique.append(r)

    return final, {
        "matched_pct":    matched_pct,
        "matched_skills": matched,
        "missing_skills": missing[:5],
        "roles":          role_labels,
        "reasons":        unique,
    }