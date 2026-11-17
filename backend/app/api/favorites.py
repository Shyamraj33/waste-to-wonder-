"""Child favorite crafts API router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import FavoriteCraft, Craft, ChildProfile
from app.schemas import CraftResponse
from app.api.crafts import _to_craft_response

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("")
def toggle_favorite(child_id: int, craft_id: str, db: Session = Depends(get_db)):
    """Toggle bookmark for a craft."""
    existing = db.query(FavoriteCraft).filter(
        FavoriteCraft.child_id == child_id,
        FavoriteCraft.craft_id == craft_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False, "message": "Removed from favorites"}

    fav = FavoriteCraft(child_id=child_id, craft_id=craft_id)
    db.add(fav)
    db.commit()
    return {"favorited": True, "message": "Saved to favorites!"}


@router.get("/{child_id}", response_model=List[CraftResponse])
def get_favorites(child_id: int, db: Session = Depends(get_db)):
    """List all favorited crafts for a child."""
    favs = db.query(FavoriteCraft).filter(FavoriteCraft.child_id == child_id).all()
    results = []
    for f in favs:
        if f.craft:
            results.append(_to_craft_response(f.craft))
    return results


@router.delete("/{favorite_id}")
def delete_favorite(favorite_id: int, db: Session = Depends(get_db)):
    """Delete favorite entry by ID."""
    fav = db.query(FavoriteCraft).filter(FavoriteCraft.id == favorite_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"success": True}
