"""Pydantic schemas for request validation and response serialization."""
from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

try:
    from pydantic import EmailStr
except ImportError:
    EmailStr = str  # fallback


# ==================== Auth Schemas ====================
class UserRegister(BaseModel):
    email: str = Field(min_length=5)
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    role: str = "parent"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== Child Profile Schemas ====================
class ChildProfileCreate(BaseModel):
    nickname: str = Field(min_length=2, max_length=50)
    age_group: str = "8-10"  # 5-7, 8-10, 11-12
    avatar: str = "fox"
    interests: List[str] = []


class ChildProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    age_group: Optional[str] = None
    avatar: Optional[str] = None
    interests: Optional[List[str]] = None


class ChildProfileResponse(BaseModel):
    id: int
    nickname: str
    age_group: str
    avatar: str
    interests: List[str]
    eco_points: int
    created_at: datetime
    badges_count: int = 0
    completed_crafts_count: int = 0

    class Config:
        from_attributes = True


# ==================== Craft Schemas ====================
class CraftStepResponse(BaseModel):
    step_number: int
    heading: str
    instruction: str
    tip: Optional[str] = None
    illustration_url: Optional[str] = None

    class Config:
        from_attributes = True


class CraftResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    primary_material: str
    compatible_objects: List[str] = []
    age_min: int
    age_max: int
    difficulty: str
    estimated_time_minutes: int
    eco_points: int
    requires_adult: bool
    safety_precautions: Optional[str] = None
    materials: List[str] = []
    tools: List[str] = []
    environmental_tip: Optional[str] = None
    steps_count: int = 0
    is_rare: bool = False

    class Config:
        from_attributes = True


class CraftDetailResponse(CraftResponse):
    steps: List[CraftStepResponse] = []


# ==================== Recommendation Schemas ====================
class RecommendationRequest(BaseModel):
    detected_object: Optional[str] = None
    material: Optional[str] = None
    child_age: Optional[int] = 8
    interests: Optional[List[str]] = []
    difficulty: Optional[str] = None
    max_time_minutes: Optional[int] = None


class RecommendationScoreBreakdown(BaseModel):
    material_score: float
    age_score: float
    difficulty_score: float
    safety_score: float
    interests_score: float
    total_score: float


class RecommendedCraftItem(BaseModel):
    craft: CraftResponse
    score: float
    match_reasons: List[str]
    score_breakdown: Optional[RecommendationScoreBreakdown] = None


class RecommendationResponse(BaseModel):
    query_material: Optional[str]
    query_object: Optional[str]
    total_matches: int
    recommended_crafts: List[RecommendedCraftItem]


# ==================== Computer Vision / Scanner Schemas ====================
class ScanResult(BaseModel):
    scan_id: Optional[int] = None
    detected_object: str
    confidence: float
    estimated_material: str
    alternate_classes: List[dict] = []
    recommended_crafts: List[CraftResponse] = []
    rare_crafts: List[CraftResponse] = []
    suggested_opportunities: List[str] = []
    image_url: Optional[str] = None
    is_safe_material: bool = True
    safety_notice: Optional[str] = None


class ScanConfirmRequest(BaseModel):
    scan_id: Optional[int] = None
    corrected_material: str
    corrected_object: Optional[str] = None
    child_id: Optional[int] = None


# ==================== Progress & Gamification ====================
class CraftCompleteRequest(BaseModel):
    child_id: int
    craft_id: str
    photo_url: Optional[str] = None


class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color: str
    is_unlocked: bool = False
    awarded_at: Optional[datetime] = None


class ProgressResponse(BaseModel):
    child_id: int
    nickname: str
    eco_points: int
    level_title: str
    completed_crafts: List[dict] = []
    earned_badges: List[BadgeResponse] = []
    all_badges: List[BadgeResponse] = []
    materials_recycled_count: int = 0
    total_time_spent_minutes: int = 0


# ==================== Learning Center Schemas ====================
class QuizQuestionModel(BaseModel):
    question: str
    options: List[str]
    explanation: Optional[str] = None


class EcoLessonResponse(BaseModel):
    id: str
    title: str
    category: str
    icon: str
    summary: str
    read_time_minutes: int
    eco_points: int
    fun_fact: Optional[str] = None
    sections: List[dict]
    questions_count: int


class QuizSubmitRequest(BaseModel):
    child_id: int
    lesson_id: str
    answers: List[int]  # list of selected option indices (0-based)


class QuizSubmitResponse(BaseModel):
    score: int
    total_questions: int
    perfect_score: bool
    points_awarded: int
    new_total_points: int
    new_badges_awarded: List[BadgeResponse] = []
    feedback: List[dict] = []
