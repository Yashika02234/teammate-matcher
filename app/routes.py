import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
import uuid
from datetime import timedelta, datetime

from app.models import (
    ProfileCreate, ProjectCreate, ProfileOut, ProjectOut, Token,
    CollaborationRequestCreate, CollaborationRequestOut,
    RoomCreate, RoomOut, MessageCreate, MessageOut,
    EnrichedMatchResult, ProjectMatchResult, MatchExplanation
)
from app.db import (
    profiles_collection, projects_collection,
    requests_collection, rooms_collection,
    messages_collection, feedback_collection
)
from app.matcher import (
    calculate_match_score, calculate_project_match_score,
    get_role_labels, WEIGHTS, ROLE_COLORS
)
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("teammate-matcher")

router = APIRouter()


@router.get("/")
def root():
    return {"message": "Teammate Matcher API running"}


@router.post("/profile")
def create_profile(profile: ProfileCreate):
    existing = profiles_collection.find_one({"user_id": profile.user_id})

    if existing:
        raise HTTPException(status_code=400, detail="Profile with this user_id already exists")

    profile_dict = profile.dict()
    profile_dict["password"] = get_password_hash(profile_dict.pop("password"))
    profiles_collection.insert_one(profile_dict)
    return {"message": "Profile created successfully"}

@router.put("/profile")
def update_profile(profile_update: dict, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    existing = profiles_collection.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    update_data = {k: v for k, v in profile_update.items() if v is not None}
    if update_data:
        profiles_collection.update_one({"user_id": user_id}, {"$set": update_data})
        
    return {"message": "Profile updated successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = profiles_collection.find_one({"user_id": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["user_id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
@router.get("/profiles")
def get_profiles(skip: int = 0, limit: int = 10):
    profiles = list(profiles_collection.find({}, {"_id": 0}))
    return profiles[skip : skip + limit]

@router.get("/match/{user_id}")
def get_matches(user_id: str, skip: int = 0, limit: int = 5, current_user = Depends(get_current_user)):
    try:
        # Refresh global weights from accumulated feedback
        WEIGHTS.update_from_feedback(feedback_collection)

        target = profiles_collection.find_one({"user_id": user_id}, {"_id": 0})
        if not target:
            raise HTTPException(status_code=404, detail="User profile not found")

        target_parsed = ProfileOut(**target).dict()
        others = list(profiles_collection.find({"user_id": {"$ne": user_id}}, {"_id": 0}))

        matches = []
        for other in others:
            if "user_id" not in other:
                continue
            other_parsed = ProfileOut(**other).dict()
            score, explanation = calculate_match_score(target_parsed, other_parsed)
            matches.append({
                "user_id": other_parsed["user_id"],
                "name":    other_parsed["name"],
                "score":   score,
                "explanation": explanation.to_dict(),
            })

        matches.sort(key=lambda x: x["score"], reverse=True)
        logger.info(f"Generated {len(matches)} enriched matches for user_id: {user_id}")
        return {"user_id": user_id, "matches": matches[skip: skip + limit]}

    except Exception as e:
        logger.error(f"Error in get_matches for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/my-roles")
def get_my_roles(current_user = Depends(get_current_user)):
    """Returns the calling user's inferred ML role tags with associated colors."""
    user_id = current_user.user_id
    profile = profiles_collection.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    roles = get_role_labels(profile)
    return {
        "user_id": user_id,
        "roles": roles,
        "role_colors": {r: ROLE_COLORS.get(r, "#FFFFFF") for r in roles},
    }

@router.post("/project")
def create_project(project: ProjectCreate):
    existing = projects_collection.find_one({"project_id": project.project_id})

    if existing:
        raise HTTPException(status_code=400, detail="Project with this project_id already exists")

    projects_collection.insert_one(project.dict())
    return {"message": "Project created successfully"}


@router.get("/project-match/{project_id}")
def get_project_matches(project_id: str, skip: int = 0, limit: int = 5, current_user = Depends(get_current_user)):
    try:
        project = projects_collection.find_one({"project_id": project_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        project_parsed = ProjectOut(**project).dict()
        candidates = list(profiles_collection.find(
            {"user_id": {"$ne": project_parsed["owner_id"]}}, {"_id": 0}
        ))

        matches = []
        for profile in candidates:
            if "user_id" not in profile:
                continue
            profile_parsed = ProfileOut(**profile).dict()
            score, enriched = calculate_project_match_score(project_parsed, profile_parsed)
            matches.append({
                "user_id":       profile_parsed.get("user_id"),
                "name":          profile_parsed.get("name", "Unknown"),
                "score":         score,
                "matched_pct":   enriched["matched_pct"],
                "matched_skills":enriched["matched_skills"],
                "missing_skills":enriched["missing_skills"],
                "roles":         enriched["roles"],
                "reasons":       enriched["reasons"],
            })

        matches.sort(key=lambda x: x["score"], reverse=True)
        logger.info(f"Generated {len(matches)} enriched project matches for {project_id}")
        return {"project_id": project_id, "matches": matches[skip: skip + limit]}

    except Exception as e:
        logger.error(f"Error in get_project_matches for {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
@router.get("/projects")
def get_projects(skip: int = 0, limit: int = 10):
    projects = list(projects_collection.find({}, {"_id": 0}))
    return projects[skip : skip + limit]

@router.delete("/reset-profiles")
def reset_profiles():
    profiles_collection.delete_many({})
    return {"message": "All profiles deleted"}

@router.delete("/reset-projects")
def reset_projects():
    projects_collection.delete_many({})
    return {"message": "All projects deleted"}

@router.get("/health")
def health_check():
    return {"status": "ok"}

# ---------------------------------------------------------
# COMPONENT: REQUESTS
# ---------------------------------------------------------

@router.post("/requests", response_model=CollaborationRequestOut)
def create_request(req: CollaborationRequestCreate, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if request already exists
    existing = requests_collection.find_one({
        "sender_id": user_id, 
        "receiver_id": req.receiver_id,
        "request_type": req.request_type,
        "project_id": req.project_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Request already sent")
        
    req_data = req.dict()
    req_data["request_id"] = str(uuid.uuid4())
    req_data["sender_id"] = user_id
    req_data["status"] = "pending"
    req_data["created_at"] = datetime.utcnow()
    
    requests_collection.insert_one(req_data)
    del req_data["_id"]
    return req_data

@router.get("/requests/incoming", response_model=List[CollaborationRequestOut])
def get_incoming_requests(current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    requests = list(requests_collection.find({"receiver_id": user_id}, {"_id": 0}))
    return requests

@router.get("/requests/sent", response_model=List[CollaborationRequestOut])
def get_sent_requests(current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    requests = list(requests_collection.find({"sender_id": user_id}, {"_id": 0}))
    return requests

@router.patch("/requests/{request_id}/accept")
def accept_request(request_id: str, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    req = requests_collection.find_one({"request_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req["receiver_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this request")
    if req["status"] != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")

    requests_collection.update_one({"request_id": request_id}, {"$set": {"status": "accepted"}})

    # ── Write positive feedback signal ──────────────────────────────
    sender_profile   = profiles_collection.find_one({"user_id": req["sender_id"]},   {"_id": 0}) or {}
    receiver_profile = profiles_collection.find_one({"user_id": req["receiver_id"]}, {"_id": 0}) or {}
    _, exp = calculate_match_score(sender_profile, receiver_profile)
    feedback_collection.insert_one({
        "outcome":    "accept",
        "request_id": request_id,
        "features":   exp.score_breakdown,
        "timestamp":  datetime.utcnow()
    })

    # ── Create room if not exists ────────────────────────────────────
    members = sorted([req["sender_id"], req["receiver_id"]])
    existing_room = rooms_collection.find_one({"members": members, "project_id": req.get("project_id")})
    room_id = existing_room["room_id"] if existing_room else str(uuid.uuid4())
    if not existing_room:
        rooms_collection.insert_one({
            "room_id":    room_id,
            "members":    members,
            "project_id": req.get("project_id"),
            "created_at": datetime.utcnow()
        })
    return {"message": "Request accepted", "room_id": room_id}

@router.patch("/requests/{request_id}/reject")
def reject_request(request_id: str, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    req = requests_collection.find_one({"request_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req["receiver_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    requests_collection.update_one({"request_id": request_id}, {"$set": {"status": "rejected"}})

    # ── Write negative feedback signal ──────────────────────────────
    sender_profile   = profiles_collection.find_one({"user_id": req["sender_id"]},   {"_id": 0}) or {}
    receiver_profile = profiles_collection.find_one({"user_id": req["receiver_id"]}, {"_id": 0}) or {}
    _, exp = calculate_match_score(sender_profile, receiver_profile)
    feedback_collection.insert_one({
        "outcome":    "reject",
        "request_id": request_id,
        "features":   exp.score_breakdown,
        "timestamp":  datetime.utcnow()
    })
    return {"message": "Request rejected"}

# ---------------------------------------------------------
# COMPONENT: ROOMS
# ---------------------------------------------------------

@router.get("/rooms", response_model=List[RoomOut])
def get_user_rooms(current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    rooms = list(rooms_collection.find({"members": user_id}, {"_id": 0}))
    return rooms
    
@router.get("/rooms/{room_id}", response_model=RoomOut)
def get_room_details(room_id: str, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    room = rooms_collection.find_one({"room_id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user_id not in room["members"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this room")
    return room

# ---------------------------------------------------------
# COMPONENT: MESSAGES
# ---------------------------------------------------------

@router.get("/rooms/{room_id}/messages", response_model=List[MessageOut])
def get_messages(room_id: str, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    room = rooms_collection.find_one({"room_id": room_id})
    if not room or user_id not in room["members"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    messages = list(messages_collection.find({"room_id": room_id}, {"_id": 0}).sort("timestamp", 1))
    return messages
    
@router.post("/rooms/{room_id}/messages", response_model=MessageOut)
def send_message(room_id: str, msg: MessageCreate, current_user = Depends(get_current_user)):
    user_id = current_user.user_id
    room = rooms_collection.find_one({"room_id": room_id})
    if not room or user_id not in room["members"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    msg_data = {
        "message_id": str(uuid.uuid4()),
        "room_id": room_id,
        "sender_id": user_id,
        "text": msg.text,
        "timestamp": datetime.utcnow()
    }
    messages_collection.insert_one(msg_data)
    del msg_data["_id"]
    return msg_data