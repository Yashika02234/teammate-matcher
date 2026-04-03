// ─── Profile Types ────────────────────────────────────────────────

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type SkillName =
  | 'react'
  | 'node'
  | 'python'
  | 'ml'
  | 'mongodb'
  | 'uiux'
  | 'java'
  | 'cpp';

export type Interest = 'hackathon' | 'placement' | 'startup' | 'research';

export type Availability =
  | 'weekdays'
  | 'weekends'
  | 'full-time'
  | 'part-time'
  | 'flexible';

export type WorkStyle = 'remote' | 'in-person' | 'hybrid';

export interface ProfileCreate {
  user_id: string;
  name: string;
  password: string;
  skills: string[];
  skill_levels: Record<string, number>;
  interests: string[];
  availability: string;
  work_style: string;
  bio?: string;
}

export interface ProfileOut {
  user_id: string;
  name: string;
  skills: string[];
  skill_levels: Record<string, number>;
  interests: string[];
  availability: string;
  work_style: string;
  bio?: string;
}

// ─── Project Types ────────────────────────────────────────────────

export interface ProjectCreate {
  project_id: string;
  owner_id: string;
  title: string;
  required_skills: string[];
  interests: string[];
  availability: string;
  work_style: string;
  description?: string;
  domain?: string;
}

export interface ProjectOut extends ProjectCreate {}

// ─── Match Types ──────────────────────────────────────────────────

export interface MatchExplanation {
  reasons: string[];
  matched_skills: string[];
  missing_skills: string[];
  roles: string[];
  skill_match_pct: number;   // 0.0 – 1.0
  score_breakdown: {
    cosine:   number;
    role:     number;
    style:    number;
    ml_model: number;
  };
}

export interface MatchResult {
  user_id: string;
  name: string;
  score: number;              // 0 – 100 (already a percentage from backend)
  explanation: MatchExplanation;
}

export interface MatchResponse {
  user_id: string;
  matches: MatchResult[];
}

export interface ProjectMatchResult {
  user_id: string;
  name: string;
  score: number;
  matched_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  roles: string[];
  reasons: string[];
  explanation?: MatchExplanation; // Optional for backward compatibility in components
}

export interface ProjectMatchResponse {
  project_id: string;
  matches: ProjectMatchResult[];
}

// ─── Auth Types ───────────────────────────────────────────────────

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ─── API Error ────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}
