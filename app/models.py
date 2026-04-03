from pydantic import BaseModel
from typing import List, Dict, Optional, Literal
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class ProfileCreate(BaseModel):
    user_id: str
    password: str = "default_password"
    name: str = "Unknown"
    skills: List[str] = []
    skill_levels: Dict[str, int] = {}
    interests: List[str] = []
    availability: str = ""
    work_style: str = ""

class ProfileOut(ProfileCreate):
    pass

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    skill_levels: Optional[Dict[str, int]] = None
    interests: Optional[List[str]] = None
    availability: Optional[str] = None
    work_style: Optional[str] = None

class ProjectCreate(BaseModel):
    project_id: str
    owner_id: str
    title: str = "Untitled Project"
    required_skills: List[str] = []
    interests: List[str] = []
    availability: str = ""
    work_style: str = ""

class ProjectOut(ProjectCreate):
    pass

class CollaborationRequestCreate(BaseModel):
    request_type: Literal["teammate", "project_join"]
    receiver_id: str
    project_id: Optional[str] = None
    message: Optional[str] = None

class CollaborationRequestOut(CollaborationRequestCreate):
    request_id: str
    sender_id: str
    status: Literal["pending", "accepted", "rejected"]
    created_at: datetime
    
class RoomCreate(BaseModel):
    members: List[str]
    project_id: Optional[str] = None

class RoomOut(RoomCreate):
    room_id: str
    created_at: datetime

class MessageCreate(BaseModel):
    text: str

class MessageOut(MessageCreate):
    message_id: str
    room_id: str
    sender_id: str
    timestamp: datetime

# ---------------------------------------------------------
# ENRICHED ML OUTPUT SCHEMAS
# ---------------------------------------------------------

class MatchExplanation(BaseModel):
    reasons: List[str] = []
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    roles: List[str] = []
    skill_match_pct: float = 0.0
    score_breakdown: Dict[str, float] = {}

class EnrichedMatchResult(BaseModel):
    user_id: str
    name: str
    score: float
    explanation: MatchExplanation

class ProjectMatchResult(BaseModel):
    user_id: str
    name: str
    score: float
    matched_pct: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    roles: List[str] = []
    reasons: List[str] = []
