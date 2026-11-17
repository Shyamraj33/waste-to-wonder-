"""Eco Learning Center and Interactive Quizzes API router."""
import json
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import EcoLesson, QuizAttempt, ChildProfile, Badge, ChildBadge
from app.schemas import (
    EcoLessonResponse, QuizSubmitRequest, QuizSubmitResponse, BadgeResponse
)

router = APIRouter(prefix="", tags=["Eco Learning"])


@router.get("/lessons", response_model=List[EcoLessonResponse])
def get_lessons(db: Session = Depends(get_db)):
    """List all interactive environmental lessons."""
    lessons = db.query(EcoLesson).all()
    results = []
    for l in lessons:
        try:
            sections = json.loads(l.content_json)
        except Exception:
            sections = []
        try:
            quiz = json.loads(l.quiz_json)
        except Exception:
            quiz = []

        results.append(
            EcoLessonResponse(
                id=l.id,
                title=l.title,
                category=l.category,
                icon=l.icon,
                summary=l.summary,
                read_time_minutes=l.read_time_minutes,
                eco_points=l.eco_points,
                fun_fact=l.fun_fact,
                sections=sections,
                questions_count=len(quiz),
            )
        )
    return results


@router.get("/lessons/{lesson_id}")
def get_lesson_detail(lesson_id: str, db: Session = Depends(get_db)):
    """Get single lesson full content including quiz questions."""
    l = db.query(EcoLesson).filter(EcoLesson.id == lesson_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lesson not found")

    sections = json.loads(l.content_json) if isinstance(l.content_json, str) else l.content_json
    quiz = json.loads(l.quiz_json) if isinstance(l.quiz_json, str) else l.quiz_json

    # Hide answers in initial fetch for fairness
    client_quiz = []
    for q in quiz:
        client_quiz.append({
            "question": q["question"],
            "options": q["options"],
        })

    return {
        "id": l.id,
        "title": l.title,
        "category": l.category,
        "icon": l.icon,
        "summary": l.summary,
        "read_time_minutes": l.read_time_minutes,
        "eco_points": l.eco_points,
        "fun_fact": l.fun_fact,
        "sections": sections,
        "quiz": client_quiz,
    }


@router.get("/quizzes/{lesson_id}")
def get_lesson_quiz(lesson_id: str, db: Session = Depends(get_db)):
    """Retrieve quiz questions for an eco-lesson."""
    l = db.query(EcoLesson).filter(EcoLesson.id == lesson_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lesson not found")

    quiz = json.loads(l.quiz_json) if isinstance(l.quiz_json, str) else l.quiz_json
    client_quiz = [{"question": q["question"], "options": q["options"]} for q in quiz]
    return {"lesson_id": l.id, "lesson_title": l.title, "questions": client_quiz}


@router.post("/quizzes/submit", response_model=QuizSubmitResponse)
def submit_quiz_attempt(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    """Grade quiz answers, award eco points, and unlock badges."""
    child = db.query(ChildProfile).filter(ChildProfile.id == req.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    lesson = db.query(EcoLesson).filter(EcoLesson.id == req.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    quiz = json.loads(lesson.quiz_json) if isinstance(lesson.quiz_json, str) else lesson.quiz_json

    score = 0
    feedback = []
    for i, q in enumerate(quiz):
        correct_idx = q["answer_index"]
        selected_idx = req.answers[i] if i < len(req.answers) else -1
        is_correct = (selected_idx == correct_idx)
        if is_correct:
            score += 1
        feedback.append({
            "question": q["question"],
            "selected_index": selected_idx,
            "correct_index": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation"),
        })

    total = len(quiz)
    perfect_score = (score == total)
    points_to_award = lesson.eco_points if score >= (total / 2) else 5

    # Record attempt
    attempt = QuizAttempt(
        child_id=child.id,
        lesson_id=lesson.id,
        score=score,
        total_questions=total,
        points_awarded=points_to_award,
    )
    db.add(attempt)
    child.eco_points += points_to_award
    db.commit()

    # Check for Nature Guardian badge if perfect score
    new_badges = []
    if perfect_score:
        guardian_badge = db.query(Badge).filter(Badge.id == "badge-nature-guardian").first()
        if guardian_badge:
            has_badge = db.query(ChildBadge).filter(
                ChildBadge.child_id == child.id,
                ChildBadge.badge_id == guardian_badge.id,
            ).first()
            if not has_badge:
                db.add(ChildBadge(
                    child_id=child.id,
                    badge_id=guardian_badge.id,
                    awarded_at=datetime.utcnow(),
                ))
                db.commit()
                new_badges.append(BadgeResponse(
                    id=guardian_badge.id,
                    name=guardian_badge.name,
                    description=guardian_badge.description,
                    icon=guardian_badge.icon,
                    color=guardian_badge.color,
                    is_unlocked=True,
                    awarded_at=datetime.utcnow(),
                ))

    return QuizSubmitResponse(
        score=score,
        total_questions=total,
        perfect_score=perfect_score,
        points_awarded=points_to_award,
        new_total_points=child.eco_points,
        new_badges_awarded=new_badges,
        feedback=feedback,
    )
