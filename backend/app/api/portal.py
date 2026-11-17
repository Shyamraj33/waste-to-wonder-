"""Parent and Teacher Portal API endpoints for EcoCraft AI."""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import User, ChildProfile, CompletedCraft, Craft, QuizAttempt
from app.security import require_current_user

router = APIRouter(prefix="/portal", tags=["Parent & Teacher Portals"])


@router.get("/parent/overview")
def get_parent_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
):
    """Retrieve parent control panel data: children's activities, safety summaries, and stats."""
    children = db.query(ChildProfile).filter(ChildProfile.parent_id == current_user.id).all()

    child_summaries = []
    total_crafts = 0
    total_points = 0
    materials_saved = set()

    for ch in children:
        c_count = len(ch.completed_crafts)
        total_crafts += c_count
        total_points += ch.eco_points

        for cc in ch.completed_crafts:
            if cc.craft:
                materials_saved.add(cc.craft.primary_material.capitalize())

        child_summaries.append({
            "id": ch.id,
            "nickname": ch.nickname,
            "age_group": ch.age_group,
            "avatar": ch.avatar,
            "eco_points": ch.eco_points,
            "completed_crafts_count": c_count,
            "badges_count": len(ch.earned_badges),
            "recent_crafts": [
                {
                    "title": cc.craft.title,
                    "material": cc.craft.primary_material,
                    "completed_at": cc.completed_at,
                    "points": cc.points_earned,
                }
                for cc in ch.completed_crafts[-3:]
            ] if ch.completed_crafts else [],
        })

    return {
        "parent_name": current_user.full_name or "Parent",
        "email": current_user.email,
        "coppa_notice": "Eco World never shares children's photos, names, or locations publicly. All accounts are parent-managed.",
        "children": child_summaries,
        "metrics": {
            "total_crafts_completed": total_crafts,
            "total_eco_points": total_points,
            "materials_diverted_from_waste": list(materials_saved) or ["Plastic", "Cardboard"],
        },
        "safety_guidance": [
            "Always supervise children when using scissors, wire cutters, or hole punchers.",
            "Wash and thoroughly dry all recycled cans and jars before crafting.",
            "Smooth cut metal or hard plastic edges with masking tape.",
        ],
    }


@router.get("/teacher/overview")
def get_teacher_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
):
    """Retrieve teacher dashboard with challenges and classroom stats."""
    total_crafts = db.query(CompletedCraft).count()
    total_quizzes = db.query(QuizAttempt).count()
    all_crafts_count = db.query(Craft).count()

    classroom_challenges = [
        {
            "id": "chal-01",
            "title": "Earth Month Cardboard Castle Challenge",
            "target_material": "cardboard",
            "suggested_craft": "Cardboard Castle Fortress",
            "points": 25,
            "description": "Have students collaborate to build miniature castles using recycled delivery boxes.",
            "duration": "1 week",
        },
        {
            "id": "chal-02",
            "title": "Ocean Guardian Bottle Planters",
            "target_material": "plastic",
            "suggested_craft": "Self-Watering Sprout Planter",
            "points": 20,
            "description": "Teach capillary action and plant biology by planting basil seeds in cut plastic bottles.",
            "duration": "2 weeks",
        },
        {
            "id": "chal-03",
            "title": "Zero-Waste Rhythm Band",
            "target_material": "metal",
            "suggested_craft": "Tin Can Bongo Drum Set",
            "points": 15,
            "description": "Explore sound acoustics and percussion by creating recycled drums and shakers.",
            "duration": "3 days",
        },
    ]

    return {
        "teacher_name": current_user.full_name or "Educator",
        "role": current_user.role,
        "curriculum_crafts_available": all_crafts_count,
        "total_school_completions": total_crafts,
        "quizzes_taken": total_quizzes,
        "active_challenges": classroom_challenges,
        "printable_worksheets": [
            {"title": "Ocean Food Chain Coloring Sheet", "type": "PDF"},
            {"title": "Paper Recycling Flowchart Guide", "type": "PDF"},
            {"title": "My Waste Audit Journal for Kids", "type": "PDF"},
        ],
    }
