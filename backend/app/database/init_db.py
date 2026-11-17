"""Database initialization and seeding script for EcoCraft AI.

Creates all tables, populates 30+ curated kid crafts, eco-lessons,
badges, and a default child profile.
"""
import os
import json
import logging
from app.database.session import engine, SessionLocal, Base
from app.models import (
    User, ChildProfile, Craft, CraftStep, Badge, ChildBadge, EcoLesson, CompletedCraft
)
from app.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecocraft.init_db")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def init_database():
    """Create all tables and seed data if not already present."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Badges
        badges_file = os.path.join(DATA_DIR, "badges_data.json")
        if os.path.exists(badges_file) and db.query(Badge).count() == 0:
            logger.info("Seeding gamification badges...")
            with open(badges_file, "r", encoding="utf-8") as f:
                badges_data = json.load(f)
                for b_item in badges_data:
                    badge = Badge(
                        id=b_item["id"],
                        name=b_item["name"],
                        description=b_item["description"],
                        icon=b_item["icon"],
                        required_type=b_item["required_type"],
                        target_material=b_item.get("target_material"),
                        threshold=b_item.get("threshold", 1),
                        color=b_item.get("color", "#22c55e"),
                    )
                    db.add(badge)
            db.commit()

        # 2. Seed Eco Lessons
        lessons_file = os.path.join(DATA_DIR, "lessons_data.json")
        if os.path.exists(lessons_file) and db.query(EcoLesson).count() == 0:
            logger.info("Seeding eco lessons...")
            with open(lessons_file, "r", encoding="utf-8") as f:
                lessons_data = json.load(f)
                for l_item in lessons_data:
                    lesson = EcoLesson(
                        id=l_item["id"],
                        title=l_item["title"],
                        category=l_item["category"],
                        icon=l_item["icon"],
                        summary=l_item["summary"],
                        read_time_minutes=l_item["read_time_minutes"],
                        eco_points=l_item["eco_points"],
                        fun_fact=l_item.get("fun_fact"),
                        content_json=json.dumps(l_item.get("sections", [])),
                        quiz_json=json.dumps(l_item.get("quiz", [])),
                    )
                    db.add(lesson)
            db.commit()

        # 3. Seed Crafts Catalog
        crafts_file = os.path.join(DATA_DIR, "crafts_catalog.json")
        if os.path.exists(crafts_file):
            existing_ids = {c[0] for c in db.query(Craft.id).all()}
            logger.info(f"Syncing crafts catalog ({len(existing_ids)} currently in DB)...")
            with open(crafts_file, "r", encoding="utf-8") as f:
                crafts_data = json.load(f)
                new_added = 0
                for c_item in crafts_data:
                    if c_item["id"] in existing_ids:
                        craft_obj = db.query(Craft).filter(Craft.id == c_item["id"]).first()
                        if craft_obj:
                            craft_obj.is_rare = c_item.get("is_rare", False)
                        continue
                    craft = Craft(
                        id=c_item["id"],
                        title=c_item["title"],
                        description=c_item["description"],
                        category=c_item["category"],
                        primary_material=c_item["primary_material"],
                        compatible_objects=json.dumps(c_item.get("compatible_objects", [])),
                        age_min=c_item.get("age_min", 5),
                        age_max=c_item.get("age_max", 12),
                        difficulty=c_item.get("difficulty", "Easy"),
                        estimated_time_minutes=c_item.get("estimated_time_minutes", 20),
                        eco_points=c_item.get("eco_points", 15),
                        requires_adult=c_item.get("requires_adult", False),
                        safety_precautions=c_item.get("safety_precautions"),
                        materials=json.dumps(c_item.get("materials", [])),
                        tools=json.dumps(c_item.get("tools", [])),
                        environmental_tip=c_item.get("environmental_tip"),
                        is_rare=c_item.get("is_rare", False),
                    )
                    db.add(craft)
                    db.flush()

                    # Add steps
                    for step_dict in c_item.get("steps", []):
                        step = CraftStep(
                            craft_id=craft.id,
                            step_number=step_dict["step_number"],
                            heading=step_dict["heading"],
                            instruction=step_dict["instruction"],
                            tip=step_dict.get("tip"),
                            illustration_url=step_dict.get("illustration_url"),
                        )
                        db.add(step)
                    new_added += 1
                if new_added > 0:
                    logger.info(f"Added {new_added} new rare crafts to database.")
            db.commit()

        # 4. Seed Demo User & Child Profile if not present
        if db.query(User).count() == 0:
            logger.info("Seeding demo parent and child profile...")
            demo_user = User(
                email="parent@ecocraft.ai",
                hashed_password=hash_password("ecocraft123"),
                role="parent",
                full_name="Sarah Miller",
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            demo_child = ChildProfile(
                parent_id=demo_user.id,
                nickname="EcoSam",
                age_group="8-10",
                avatar="fox",
                interests=json.dumps(["Animals", "Art", "Gardening"]),
                eco_points=45,
            )
            db.add(demo_child)
            db.commit()
            db.refresh(demo_child)

            # Award initial badge
            starter_badge = db.query(Badge).filter(Badge.id == "badge-eco-explorer").first()
            if starter_badge:
                db.add(ChildBadge(child_id=demo_child.id, badge_id=starter_badge.id))

            # Record a completed starter craft
            first_craft = db.query(Craft).first()
            if first_craft:
                db.add(CompletedCraft(
                    child_id=demo_child.id,
                    craft_id=first_craft.id,
                    points_earned=15,
                ))
            db.commit()

        logger.info("Database initialized and seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
