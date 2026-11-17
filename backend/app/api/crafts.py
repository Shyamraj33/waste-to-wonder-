"""Craft exploration and recommendation endpoints for EcoCraft AI."""
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Craft, CraftStep
from app.schemas import (
    CraftResponse, CraftDetailResponse, CraftStepResponse,
    RecommendationRequest, RecommendationResponse
)
from app.recommendations.engine import RecommendationEngine

router = APIRouter(prefix="", tags=["Crafts"])
recommender = RecommendationEngine()


def _to_craft_response(c: Craft) -> CraftResponse:
    """Format Craft model into Pydantic schema."""
    try:
        compat = json.loads(c.compatible_objects) if isinstance(c.compatible_objects, str) else c.compatible_objects
    except Exception:
        compat = []

    try:
        mats = json.loads(c.materials) if isinstance(c.materials, str) else c.materials
    except Exception:
        mats = []

    try:
        tls = json.loads(c.tools) if isinstance(c.tools, str) else c.tools
    except Exception:
        tls = []

    return CraftResponse(
        id=c.id,
        title=c.title,
        description=c.description,
        category=c.category,
        primary_material=c.primary_material,
        compatible_objects=compat,
        age_min=c.age_min,
        age_max=c.age_max,
        difficulty=c.difficulty,
        estimated_time_minutes=c.estimated_time_minutes,
        eco_points=c.eco_points,
        requires_adult=c.requires_adult,
        safety_precautions=c.safety_precautions,
        materials=mats,
        tools=tls,
        environmental_tip=c.environmental_tip,
        steps_count=len(c.steps) if c.steps else 3,
        is_rare=getattr(c, 'is_rare', False),
    )


@router.get("/crafts", response_model=List[CraftResponse])
def list_crafts(
    material: Optional[str] = Query(None, description="Filter by primary material"),
    category: Optional[str] = Query(None, description="Filter by category (Gardening, Toys, etc.)"),
    difficulty: Optional[str] = Query(None, description="Easy, Medium, Advanced"),
    age: Optional[int] = Query(None, description="Child age"),
    search: Optional[str] = Query(None, description="Search keyword"),
    db: Session = Depends(get_db),
):
    """Browse and filter all 30+ curated crafts in the catalog."""
    query = db.query(Craft)

    if material:
        query = query.filter(Craft.primary_material.ilike(material))
    if category:
        query = query.filter(Craft.category.ilike(category))
    if difficulty:
        query = query.filter(Craft.difficulty.ilike(difficulty))
    if age:
        query = query.filter(Craft.age_min <= age, Craft.age_max >= age)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Craft.title.ilike(search_fmt)) | (Craft.description.ilike(search_fmt))
        )

    crafts = query.all()
    return [_to_craft_response(c) for c in crafts]


@router.get("/crafts/{craft_id}", response_model=CraftDetailResponse)
def get_craft(craft_id: str, db: Session = Depends(get_db)):
    """Retrieve full craft details including illustrated step-by-step instructions."""
    c = db.query(Craft).filter(Craft.id == craft_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Craft not found")

    base = _to_craft_response(c)
    steps = [
        CraftStepResponse(
            step_number=s.step_number,
            heading=s.heading,
            instruction=s.instruction,
            tip=s.tip,
            illustration_url=s.illustration_url,
        )
        for s in c.steps
    ]

    return CraftDetailResponse(
        **base.model_dump(),
        steps=steps,
    )


@router.get("/crafts/{craft_id}/steps", response_model=List[CraftStepResponse])
def get_craft_steps(craft_id: str, db: Session = Depends(get_db)):
    """Retrieve individual step sequence for Craft Studio."""
    steps = db.query(CraftStep).filter(CraftStep.craft_id == craft_id).order_by(CraftStep.step_number).all()
    return [
        CraftStepResponse(
            step_number=s.step_number,
            heading=s.heading,
            instruction=s.instruction,
            tip=s.tip,
            illustration_url=s.illustration_url,
        )
        for s in steps
    ]


@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    req: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """Compute weighted recommendations with strict safety filters."""
    all_crafts = db.query(Craft).all()

    ranked = recommender.rank_crafts(
        crafts=all_crafts,
        target_material=req.material,
        target_object=req.detected_object,
        child_age=req.child_age or 8,
        interests=req.interests or [],
        preferred_difficulty=req.difficulty,
        max_time_minutes=req.max_time_minutes,
        limit=6,
    )

    return RecommendationResponse(
        query_material=req.material,
        query_object=req.detected_object,
        total_matches=len(ranked),
        recommended_crafts=ranked,
    )
