"""SQLAlchemy ORM models for EcoCraft AI."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database.session import Base


class User(Base):
    """Parent, Educator, or Admin account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="parent", nullable=False)  # parent, educator, admin
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    children = relationship("ChildProfile", back_populates="parent", cascade="all, delete-orphan")


class ChildProfile(Base):
    """Child profile managed by a parent. Uses nickname for COPPA compliance."""
    __tablename__ = "child_profiles"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    nickname = Column(String(100), nullable=False)
    age_group = Column(String(20), default="8-10", nullable=False)  # 5-7, 8-10, 11-12
    avatar = Column(String(50), default="fox", nullable=False)  # fox, owl, turtle, panda, frog, bunny
    interests = Column(Text, default="[]", nullable=False)  # JSON-encoded array
    eco_points = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    parent = relationship("User", back_populates="children")
    completed_crafts = relationship("CompletedCraft", back_populates="child", cascade="all, delete-orphan")
    earned_badges = relationship("ChildBadge", back_populates="child", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="child", cascade="all, delete-orphan")
    favorites = relationship("FavoriteCraft", back_populates="child", cascade="all, delete-orphan")


class Craft(Base):
    """Curated kid-safe DIY crafts."""
    __tablename__ = "crafts"

    id = Column(String(50), primary_key=True, index=True)  # e.g. craft-pb-01
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Gardening, Toys, Art, Decorations, Science
    primary_material = Column(String(50), nullable=False, index=True)  # plastic, cardboard, paper, metal, glass, fabric
    compatible_objects = Column(Text, default="[]", nullable=False)  # JSON array
    age_min = Column(Integer, default=5, nullable=False)
    age_max = Column(Integer, default=12, nullable=False)
    difficulty = Column(String(50), default="Easy", nullable=False)  # Easy, Medium, Advanced
    estimated_time_minutes = Column(Integer, default=20, nullable=False)
    eco_points = Column(Integer, default=15, nullable=False)
    requires_adult = Column(Boolean, default=False, nullable=False)
    safety_precautions = Column(Text, nullable=True)
    materials = Column(Text, default="[]", nullable=False)  # JSON array
    tools = Column(Text, default="[]", nullable=False)  # JSON array
    environmental_tip = Column(Text, nullable=True)
    is_rare = Column(Boolean, default=False, nullable=False)

    steps = relationship("CraftStep", back_populates="craft", cascade="all, delete-orphan", order_by="CraftStep.step_number")


class CraftStep(Base):
    """Individual step within a craft."""
    __tablename__ = "craft_steps"

    id = Column(Integer, primary_key=True, index=True)
    craft_id = Column(String(50), ForeignKey("crafts.id"), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    heading = Column(String(255), nullable=False)
    instruction = Column(Text, nullable=False)
    tip = Column(Text, nullable=True)
    illustration_url = Column(String(500), nullable=True)

    craft = relationship("Craft", back_populates="steps")


class CompletedCraft(Base):
    """Record of a craft completed by a child."""
    __tablename__ = "completed_crafts"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_profiles.id"), nullable=False, index=True)
    craft_id = Column(String(50), ForeignKey("crafts.id"), nullable=False, index=True)
    photo_url = Column(String(500), nullable=True)
    points_earned = Column(Integer, default=15, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    child = relationship("ChildProfile", back_populates="completed_crafts")
    craft = relationship("Craft")


class Badge(Base):
    """Gamification badge definition."""
    __tablename__ = "badges"

    id = Column(String(50), primary_key=True, index=True)  # e.g. badge-eco-explorer
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)
    required_type = Column(String(50), nullable=False)  # craft_count, material_craft, unique_materials, perfect_quiz, eco_points
    target_material = Column(String(50), nullable=True)
    threshold = Column(Integer, default=1, nullable=False)
    color = Column(String(50), default="#22c55e", nullable=False)

    child_badges = relationship("ChildBadge", back_populates="badge", cascade="all, delete-orphan")


class ChildBadge(Base):
    """Badge unlocked by a child."""
    __tablename__ = "child_badges"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_profiles.id"), nullable=False, index=True)
    badge_id = Column(String(50), ForeignKey("badges.id"), nullable=False, index=True)
    awarded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    child = relationship("ChildProfile", back_populates="earned_badges")
    badge = relationship("Badge", back_populates="child_badges")


class EcoLesson(Base):
    """Educational lesson about ecology, recycling, and climate."""
    __tablename__ = "eco_lessons"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    icon = Column(String(50), default="🌱", nullable=False)
    summary = Column(Text, nullable=False)
    read_time_minutes = Column(Integer, default=3, nullable=False)
    eco_points = Column(Integer, default=10, nullable=False)
    fun_fact = Column(Text, nullable=True)
    content_json = Column(Text, nullable=False)  # JSON array of sections
    quiz_json = Column(Text, nullable=False)  # JSON array of questions


class QuizAttempt(Base):
    """Records a child's quiz attempt and score."""
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_profiles.id"), nullable=False, index=True)
    lesson_id = Column(String(50), ForeignKey("eco_lessons.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    points_awarded = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    child = relationship("ChildProfile", back_populates="quiz_attempts")
    lesson = relationship("EcoLesson")


class FavoriteCraft(Base):
    """Bookmarked craft for a child."""
    __tablename__ = "favorite_crafts"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_profiles.id"), nullable=False, index=True)
    craft_id = Column(String(50), ForeignKey("crafts.id"), nullable=False, index=True)
    saved_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    child = relationship("ChildProfile", back_populates="favorites")
    craft = relationship("Craft")


class ScannedItem(Base):
    """Record of an uploaded/scanned image and classification outcome."""
    __tablename__ = "scanned_items"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(255), nullable=False)
    detected_object = Column(String(100), nullable=False)
    estimated_material = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    user_corrected_material = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
