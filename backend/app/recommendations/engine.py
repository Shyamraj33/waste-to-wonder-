"""Intelligent kid-tailored recommendation engine for EcoCraft AI.

Applies weighted scoring:
- Material compatibility: 40%
- Age suitability: 25%
- Difficulty suitability: 15%
- Safety suitability: 10%
- Child interests & available materials: 10%

And strictly enforces HARD SAFETY FILTERS (no hazardous waste, no unsafe crafts for younger kids without adult supervision).
"""
import json
from typing import List, Dict, Any, Optional
from app.models import Craft
from app.schemas import RecommendedCraftItem, CraftResponse, RecommendationScoreBreakdown


class RecommendationEngine:
    """Calculates compatibility scores and sorts DIY crafts for children."""

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or {
            "material": 0.40,
            "age": 0.25,
            "difficulty": 0.15,
            "safety": 0.10,
            "interests": 0.10,
        }

    def evaluate_craft(
        self,
        craft: Craft,
        target_material: Optional[str] = None,
        target_object: Optional[str] = None,
        child_age: int = 8,
        interests: Optional[List[str]] = None,
        preferred_difficulty: Optional[str] = None,
        max_time_minutes: Optional[int] = None,
    ) -> Optional[RecommendedCraftItem]:
        """Evaluate a craft against user criteria. Returns None if hard safety filter triggers."""
        interests = [i.lower() for i in (interests or [])]
        match_reasons: List[str] = []

        # ==================== HARD SAFETY FILTER ====================
        # If child is under 7, filter out crafts that require adult supervision unless explicitly flagged as kid-friendly
        # Also never allow crafts if the detected material was flagged as hazardous
        if target_material == "hazardous":
            return None

        # Parse compatible objects and materials
        try:
            compatible_objects = json.loads(craft.compatible_objects) if isinstance(craft.compatible_objects, str) else craft.compatible_objects
        except Exception:
            compatible_objects = []

        try:
            craft_materials = json.loads(craft.materials) if isinstance(craft.materials, str) else craft.materials
        except Exception:
            craft_materials = []

        try:
            craft_tools = json.loads(craft.tools) if isinstance(craft.tools, str) else craft.tools
        except Exception:
            craft_tools = []

        # ==================== 1. Material Compatibility (40%) ====================
        material_score = 0.0
        if target_material:
            if craft.primary_material.lower() == target_material.lower():
                material_score = 1.0
                match_reasons.append(f"Perfect material match for {target_material.title()}")
            elif any(target_material.lower() in m.lower() for m in craft_materials):
                material_score = 0.75
                match_reasons.append(f"Uses {target_material.title()} as a secondary material")
            else:
                material_score = 0.10
        else:
            material_score = 0.80  # General exploration mode

        # Bonus if specific object matches
        if target_object and any(target_object.lower() in obj.lower() or obj.lower() in target_object.lower() for obj in compatible_objects):
            material_score = min(1.0, material_score + 0.15)
            match_reasons.append(f"Directly uses {target_object}")

        # ==================== 2. Age Suitability (25%) ====================
        age_score = 0.0
        if craft.age_min <= child_age <= craft.age_max:
            age_score = 1.0
            match_reasons.append(f"Designed for age {child_age} (recommended {craft.age_min}–{craft.age_max})")
        elif abs(child_age - craft.age_min) == 1 or abs(child_age - craft.age_max) == 1:
            age_score = 0.65
        else:
            age_score = 0.25

        # ==================== 3. Difficulty Suitability (15%) ====================
        difficulty_score = 0.0
        diff_str = craft.difficulty.lower()
        if preferred_difficulty:
            if diff_str == preferred_difficulty.lower():
                difficulty_score = 1.0
                match_reasons.append(f"Matches preferred {craft.difficulty} level")
            elif (preferred_difficulty.lower() == "easy" and diff_str == "medium") or (preferred_difficulty.lower() == "medium" and diff_str == "easy"):
                difficulty_score = 0.60
            else:
                difficulty_score = 0.30
        else:
            # Infer appropriate difficulty from child age
            if child_age <= 7:
                difficulty_score = 1.0 if diff_str == "easy" else (0.5 if diff_str == "medium" else 0.2)
            elif child_age <= 10:
                difficulty_score = 1.0 if diff_str in ["easy", "medium"] else 0.6
            else:
                difficulty_score = 1.0 if diff_str in ["medium", "advanced"] else 0.7

        # ==================== 4. Safety Suitability (10%) ====================
        # Crafts that do not require sharp tools or heavy adult intervention score higher on child independence
        safety_score = 0.0
        if not craft.requires_adult:
            safety_score = 1.0
            match_reasons.append("100% child-safe independent crafting")
        else:
            if child_age >= 9:
                safety_score = 0.85
                match_reasons.append("Adult supervision recommended for cutting")
            else:
                safety_score = 0.60

        # ==================== 5. Interests & Duration (10%) ====================
        interests_score = 0.50  # Baseline
        if craft.category.lower() in interests:
            interests_score = 1.0
            match_reasons.append(f"Matches your interest in {craft.category}!")

        if max_time_minutes and craft.estimated_time_minutes <= max_time_minutes:
            interests_score = min(1.0, interests_score + 0.2)

        # ==================== Weighted Total ====================
        total_score = (
            material_score * self.weights["material"]
            + age_score * self.weights["age"]
            + difficulty_score * self.weights["difficulty"]
            + safety_score * self.weights["safety"]
            + interests_score * self.weights["interests"]
        )

        breakdown = RecommendationScoreBreakdown(
            material_score=round(material_score, 2),
            age_score=round(age_score, 2),
            difficulty_score=round(difficulty_score, 2),
            safety_score=round(safety_score, 2),
            interests_score=round(interests_score, 2),
            total_score=round(total_score, 3)
        )

        craft_response = CraftResponse(
            id=craft.id,
            title=craft.title,
            description=craft.description,
            category=craft.category,
            primary_material=craft.primary_material,
            compatible_objects=compatible_objects,
            age_min=craft.age_min,
            age_max=craft.age_max,
            difficulty=craft.difficulty,
            estimated_time_minutes=craft.estimated_time_minutes,
            eco_points=craft.eco_points,
            requires_adult=craft.requires_adult,
            safety_precautions=craft.safety_precautions,
            materials=craft_materials,
            tools=craft_tools,
            environmental_tip=craft.environmental_tip,
            steps_count=len(craft.steps) if craft.steps else 3,
            is_rare=getattr(craft, 'is_rare', False)
        )

        return RecommendedCraftItem(
            craft=craft_response,
            score=round(total_score, 3),
            match_reasons=match_reasons,
            score_breakdown=breakdown
        )

    def rank_crafts(
        self,
        crafts: List[Craft],
        target_material: Optional[str] = None,
        target_object: Optional[str] = None,
        child_age: int = 8,
        interests: Optional[List[str]] = None,
        preferred_difficulty: Optional[str] = None,
        max_time_minutes: Optional[int] = None,
        limit: int = 6
    ) -> List[RecommendedCraftItem]:
        """Rank and return top crafts according to weighted scores."""
        evaluated: List[RecommendedCraftItem] = []
        for craft in crafts:
            item = self.evaluate_craft(
                craft=craft,
                target_material=target_material,
                target_object=target_object,
                child_age=child_age,
                interests=interests,
                preferred_difficulty=preferred_difficulty,
                max_time_minutes=max_time_minutes
            )
            if item:
                evaluated.append(item)

        # Sort descending by total score
        evaluated.sort(key=lambda x: x.score, reverse=True)
        return evaluated[:limit]
