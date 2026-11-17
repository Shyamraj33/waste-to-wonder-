"""Progress, eco-points, and gamification rewards API router for EcoCraft AI."""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import (
    ChildProfile, Craft, CompletedCraft, Badge, ChildBadge
)
from app.schemas import (
    CraftCompleteRequest, ProgressResponse, BadgeResponse
)

router = APIRouter(prefix="", tags=["Progress & Rewards"])


def _check_and_award_badges(child: ChildProfile, db: Session) -> List[Badge]:
    """Inspect completed crafts and point totals to unlock new badges."""
    awarded_new = []
    earned_badge_ids = {cb.badge_id for cb in child.earned_badges}

    all_badges = db.query(Badge).all()
    completed_crafts = child.completed_crafts

    # Completed count
    craft_count = len(completed_crafts)
    # Materials used
    materials_used = set()
    for cc in completed_crafts:
        if cc.craft:
            materials_used.add(cc.craft.primary_material.lower())

    for b in all_badges:
        if b.id in earned_badge_ids:
            continue

        unlock = False
        if b.required_type == "craft_count" and craft_count >= b.threshold:
            unlock = True
        elif b.required_type == "material_craft":
            if b.target_material and b.target_material.lower() in materials_used:
                unlock = True
        elif b.required_type == "unique_materials" and len(materials_used) >= b.threshold:
            unlock = True
        elif b.required_type == "eco_points" and child.eco_points >= b.threshold:
            unlock = True

        if unlock:
            child_badge = ChildBadge(
                child_id=child.id,
                badge_id=b.id,
                awarded_at=datetime.utcnow(),
            )
            db.add(child_badge)
            awarded_new.append(b)

    if awarded_new:
        db.commit()

    return awarded_new


@router.post("/progress/complete")
def complete_craft(req: CraftCompleteRequest, db: Session = Depends(get_db)):
    """Mark a craft as completed, award eco points, and check for new badges."""
    child = db.query(ChildProfile).filter(ChildProfile.id == req.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    craft = db.query(Craft).filter(Craft.id == req.craft_id).first()
    if not craft:
        raise HTTPException(status_code=404, detail="Craft not found")

    # Record completion
    completed = CompletedCraft(
        child_id=child.id,
        craft_id=craft.id,
        points_earned=craft.eco_points,
        photo_url=req.photo_url,
    )
    db.add(completed)

    # Award points
    child.eco_points += craft.eco_points
    db.commit()
    db.refresh(child)

    new_badges = _check_and_award_badges(child, db)

    return {
        "success": True,
        "points_earned": craft.eco_points,
        "new_total_points": child.eco_points,
        "craft_title": craft.title,
        "new_badges_awarded": [
            {
                "id": b.id,
                "name": b.name,
                "icon": b.icon,
                "description": b.description,
                "color": b.color,
            }
            for b in new_badges
        ]
    }


@router.get("/progress/{child_id}", response_model=ProgressResponse)
def get_child_progress(child_id: int, db: Session = Depends(get_db)):
    """Retrieve child gamification progress, rank, badges, and history."""
    child = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    # Determine rank title based on eco points
    pts = child.eco_points
    if pts < 30:
        level_title = "🌱 Eco Sprout"
    elif pts < 60:
        level_title = "🌿 Green Explorer"
    elif pts < 100:
        level_title = "🌟 Recycling Champion"
    elif pts < 150:
        level_title = "🛡️ Earth Defender"
    else:
        level_title = "👑 Planet Master"

    # Completed crafts summary
    completed_list = []
    materials_count = set()
    total_time = 0
    for cc in child.completed_crafts:
        if cc.craft:
            materials_count.add(cc.craft.primary_material.lower())
            total_time += cc.craft.estimated_time_minutes
            completed_list.append({
                "id": cc.craft.id,
                "title": cc.craft.title,
                "primary_material": cc.craft.primary_material,
                "category": cc.craft.category,
                "completed_at": cc.completed_at,
                "points_earned": cc.points_earned,
            })

    # Badges list
    earned_map = {cb.badge_id: cb.awarded_at for cb in child.earned_badges}
    all_badges = db.query(Badge).all()
    badge_responses = []
    for b in all_badges:
        is_unlocked = b.id in earned_map
        badge_responses.append(BadgeResponse(
            id=b.id,
            name=b.name,
            description=b.description,
            icon=b.icon,
            color=b.color,
            is_unlocked=is_unlocked,
            awarded_at=earned_map.get(b.id),
        ))

    earned_badges = [b for b in badge_responses if b.is_unlocked]

    return ProgressResponse(
        child_id=child.id,
        nickname=child.nickname,
        eco_points=child.eco_points,
        level_title=level_title,
        completed_crafts=completed_list,
        earned_badges=earned_badges,
        all_badges=badge_responses,
        materials_recycled_count=len(materials_count),
        total_time_spent_minutes=total_time,
    )


@router.get("/badges/{child_id}", response_model=List[BadgeResponse])
def get_child_badges(child_id: int, db: Session = Depends(get_db)):
    """Retrieve full badges list with unlocked status for a child."""
    child = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    earned_map = {cb.badge_id: cb.awarded_at for cb in child.earned_badges}
    all_badges = db.query(Badge).all()
    results = []
    for b in all_badges:
        results.append(BadgeResponse(
            id=b.id,
            name=b.name,
            description=b.description,
            icon=b.icon,
            color=b.color,
            is_unlocked=b.id in earned_map,
            awarded_at=earned_map.get(b.id),
        ))
    return results


@router.get("/rewards/{child_id}")
def get_rewards_certificate_data(child_id: int, db: Session = Depends(get_db)):
    """Return certificate of achievement data for printing."""
    child = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    return {
        "child_nickname": child.nickname,
        "avatar": child.avatar,
        "eco_points": child.eco_points,
        "crafts_completed": len(child.completed_crafts),
        "badges_unlocked": len(child.earned_badges),
        "issue_date": datetime.utcnow().strftime("%B %d, %Y"),
        "honorary_title": "Official Eco World Planet Guardian",
    }
