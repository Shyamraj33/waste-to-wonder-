"""Smart Waste Scanner AI API endpoint for EcoCraft AI."""
import os
import uuid
import json
from typing import Optional, Any
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import ScannedItem, Craft
from app.schemas import ScanResult, ScanConfirmRequest, CraftResponse
from app.ai.classifier import classify_waste_image
from app.ai.material_mapping import map_prediction_to_material
from app.recommendations.engine import RecommendationEngine

router = APIRouter(prefix="/scan", tags=["AI Scanner"])
recommender = RecommendationEngine()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _format_craft(c: Any) -> CraftResponse:
    if isinstance(c, CraftResponse):
        return c
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

    steps_cnt = len(c.steps) if (hasattr(c, "steps") and c.steps) else getattr(c, "steps_count", 3)

    return CraftResponse(
        id=c.id,
        title=c.title,
        description=c.description,
        category=c.category,
        primary_material=c.primary_material,
        compatible_objects=compat or [],
        age_min=c.age_min,
        age_max=c.age_max,
        difficulty=c.difficulty,
        estimated_time_minutes=c.estimated_time_minutes,
        eco_points=c.eco_points,
        requires_adult=c.requires_adult,
        safety_precautions=c.safety_precautions,
        materials=mats or [],
        tools=tls or [],
        environmental_tip=c.environmental_tip,
        steps_count=steps_cnt,
        is_rare=bool(getattr(c, "is_rare", False)),
    )


@router.post("", response_model=ScanResult)
async def scan_waste_item(
    file: UploadFile = File(...),
    child_age: Optional[int] = Form(8),
    db: Session = Depends(get_db),
):
    """Scan and analyze an uploaded waste item image using Computer Vision."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Save to uploads directory
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        file_ext = ".jpg"

    saved_filename = f"scan_{uuid.uuid4().hex[:12]}{file_ext}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)
    with open(saved_path, "wb") as f:
        f.write(contents)

    # Run Computer Vision inference
    try:
        classification = classify_waste_image(contents)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image processing error: {exc}")

    # Record scan in database
    scanned_item = ScannedItem(
        image_filename=saved_filename,
        detected_object=classification["detected_object"],
        estimated_material=classification["estimated_material"],
        confidence=classification["confidence"],
    )
    db.add(scanned_item)
    db.commit()
    db.refresh(scanned_item)

    # Rank recommended crafts based on detected material
    all_crafts = db.query(Craft).all()
    ranked = recommender.rank_crafts(
        crafts=all_crafts,
        target_material=classification["estimated_material"],
        target_object=classification["detected_object"],
        child_age=child_age or 8,
        limit=8,
    )
    recommended_crafts = [_format_craft(r.craft) for r in ranked]

    # Find rare and unique craft inventions
    rare_crafts_pool = [c for c in all_crafts if getattr(c, "is_rare", False)]
    rare_matches = [c for c in rare_crafts_pool if c.primary_material.lower() == classification["estimated_material"].lower()]
    other_rares = [c for c in rare_crafts_pool if c not in rare_matches]
    ordered_rares = rare_matches + other_rares
    formatted_rare_crafts = [_format_craft(c) for c in ordered_rares[:6]]

    return ScanResult(
        scan_id=scanned_item.id,
        detected_object=classification["detected_object"],
        confidence=classification["confidence"],
        estimated_material=classification["estimated_material"],
        alternate_classes=classification.get("alternate_classes", []),
        recommended_crafts=recommended_crafts,
        rare_crafts=formatted_rare_crafts,
        suggested_opportunities=classification.get("suggested_opportunities", []),
        image_url=f"/uploads/{saved_filename}",
        is_safe_material=classification["is_safe_material"],
        safety_notice=classification["safety_notice"],
    )


@router.post("/confirm", response_model=ScanResult)
def confirm_or_correct_scan(
    req: ScanConfirmRequest,
    db: Session = Depends(get_db),
):
    """Allow user to manually correct the predicted material or object."""
    material_info = map_prediction_to_material(req.corrected_material)

    display_obj = req.corrected_object or material_info["display_name"]
    final_material = material_info["material"]

    if req.scan_id:
        scanned_item = db.query(ScannedItem).filter(ScannedItem.id == req.scan_id).first()
        if scanned_item:
            scanned_item.user_corrected_material = final_material
            db.commit()

    all_crafts = db.query(Craft).all()
    ranked = recommender.rank_crafts(
        crafts=all_crafts,
        target_material=final_material,
        target_object=display_obj,
        child_age=8,
        limit=8,
    )
    recommended_crafts = [_format_craft(r.craft) for r in ranked]

    rare_crafts_pool = [c for c in all_crafts if getattr(c, "is_rare", False)]
    rare_matches = [c for c in rare_crafts_pool if c.primary_material.lower() == final_material.lower()]
    other_rares = [c for c in rare_crafts_pool if c not in rare_matches]
    ordered_rares = rare_matches + other_rares
    formatted_rare_crafts = [_format_craft(c) for c in ordered_rares[:6]]

    return ScanResult(
        scan_id=req.scan_id,
        detected_object=display_obj,
        confidence=100.0,  # User confirmed
        estimated_material=final_material,
        alternate_classes=[],
        recommended_crafts=recommended_crafts,
        rare_crafts=formatted_rare_crafts,
        suggested_opportunities=material_info.get("suggested_opportunities", []),
        is_safe_material=material_info.get("is_safe", True),
        safety_notice=material_info.get("safety_notice"),
    )
