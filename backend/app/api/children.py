"""Child profile API endpoints for EcoCraft AI."""
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import ChildProfile, User
from app.schemas import ChildProfileCreate, ChildProfileUpdate, ChildProfileResponse
from app.security import get_current_user

router = APIRouter(prefix="/children", tags=["Child Profiles"])


@router.post("", response_model=ChildProfileResponse)
def create_child_profile(
    child_in: ChildProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new child profile."""
    # If no logged in user, associate with demo user or first user
    parent_id = current_user.id if current_user else 1

    profile = ChildProfile(
        parent_id=parent_id,
        nickname=child_in.nickname,
        age_group=child_in.age_group,
        avatar=child_in.avatar,
        interests=json.dumps(child_in.interests),
        eco_points=0,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return ChildProfileResponse(
        id=profile.id,
        nickname=profile.nickname,
        age_group=profile.age_group,
        avatar=profile.avatar,
        interests=json.loads(profile.interests),
        eco_points=profile.eco_points,
        created_at=profile.created_at,
        badges_count=0,
        completed_crafts_count=0,
    )


@router.get("", response_model=List[ChildProfileResponse])
def get_child_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all child profiles for the current parent or demo profiles."""
    query = db.query(ChildProfile)
    if current_user:
        query = query.filter(ChildProfile.parent_id == current_user.id)

    profiles = query.all()
    results = []
    for p in profiles:
        results.append(
            ChildProfileResponse(
                id=p.id,
                nickname=p.nickname,
                age_group=p.age_group,
                avatar=p.avatar,
                interests=json.loads(p.interests) if isinstance(p.interests, str) else p.interests,
                eco_points=p.eco_points,
                created_at=p.created_at,
                badges_count=len(p.earned_badges) if p.earned_badges else 0,
                completed_crafts_count=len(p.completed_crafts) if p.completed_crafts else 0,
            )
        )
    return results


@router.get("/{child_id}", response_model=ChildProfileResponse)
def get_child_profile(child_id: int, db: Session = Depends(get_db)):
    """Get single child profile by ID."""
    p = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Child profile not found")

    return ChildProfileResponse(
        id=p.id,
        nickname=p.nickname,
        age_group=p.age_group,
        avatar=p.avatar,
        interests=json.loads(p.interests) if isinstance(p.interests, str) else p.interests,
        eco_points=p.eco_points,
        created_at=p.created_at,
        badges_count=len(p.earned_badges) if p.earned_badges else 0,
        completed_crafts_count=len(p.completed_crafts) if p.completed_crafts else 0,
    )


@router.put("/{child_id}", response_model=ChildProfileResponse)
def update_child_profile(
    child_id: int,
    child_in: ChildProfileUpdate,
    db: Session = Depends(get_db),
):
    """Update child nickname, age, avatar, or interests."""
    p = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Child profile not found")

    if child_in.nickname is not None:
        p.nickname = child_in.nickname
    if child_in.age_group is not None:
        p.age_group = child_in.age_group
    if child_in.avatar is not None:
        p.avatar = child_in.avatar
    if child_in.interests is not None:
        p.interests = json.dumps(child_in.interests)

    db.commit()
    db.refresh(p)

    return ChildProfileResponse(
        id=p.id,
        nickname=p.nickname,
        age_group=p.age_group,
        avatar=p.avatar,
        interests=json.loads(p.interests) if isinstance(p.interests, str) else p.interests,
        eco_points=p.eco_points,
        created_at=p.created_at,
        badges_count=len(p.earned_badges) if p.earned_badges else 0,
        completed_crafts_count=len(p.completed_crafts) if p.completed_crafts else 0,
    )
