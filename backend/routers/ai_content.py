import json
import os

from fastapi import APIRouter
from pydantic import BaseModel

from state_store import course_recommendations, get_default_user_id, save_flashcards, save_note, weak_topics

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None


router = APIRouter(prefix="/ai-content", tags=["AI Content Generation & Personalized Learning"])


class ContentRequest(BaseModel):
    topic: str
    language: str = "en"
    user_id: str | None = None


class WeakTopicsRequest(BaseModel):
    user_id: str | None = None


def get_gemini_client():
    key = os.environ.get("GEMINI_API_KEY")
    if key and key != "MY_GEMINI_API_KEY" and genai:
        return genai.Client(api_key=key)
    return None


@router.post("/notes")
async def generate_notes(req: ContentRequest):
    topic = req.topic.strip() or "AI Models"
    notes = ""
    client = get_gemini_client()
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f'Generate concise, structured study notes on "{topic}" in {req.language}.',
            )
            notes = (response.text or "").strip()
        except Exception:
            notes = ""

    if not notes:
        notes = (
            f"# {topic}\n\n"
            "## Overview\n"
            f"{topic} combines theory and practical application.\n\n"
            "## Key Concepts\n"
            "- Core definitions\n"
            "- Practical use cases\n"
            "- Common mistakes and revision checklist\n"
        )

    save_note(req.user_id or get_default_user_id("student"), topic, notes)
    return {"notes": notes}


@router.post("/flashcards")
async def generate_flashcards(req: ContentRequest):
    topic = req.topic.strip() or "AI Models"
    cards = []

    client = get_gemini_client()
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=(
                    f'Generate 5 study flashcards for "{topic}". '
                    'Return JSON array of objects with "front" and "back".'
                ),
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            cards = json.loads(response.text)
        except Exception:
            cards = []

    if not cards:
        cards = [
            {"front": f"What is {topic}?", "back": f"{topic} is a key concept used to solve structured learning tasks."},
            {"front": "Why is it important?", "back": "It improves understanding, retention, and real-world application."},
            {"front": "What is one limitation?", "back": "It can be misapplied without strong fundamentals."},
            {"front": "How to practice it?", "back": "Use examples, solve questions, and review mistakes weekly."},
            {"front": "How to evaluate mastery?", "back": "Teach the concept clearly and solve unseen problems."},
        ]

    save_flashcards(req.user_id or get_default_user_id("student"), topic, cards)
    return {"flashcards": cards}


@router.post("/mindmaps")
async def generate_mindmaps(req: ContentRequest):
    topic = req.topic.strip() or "Machine Learning"
    return {
        "mindmap": {
            "central": topic,
            "branches": [
                {"label": "Fundamentals", "children": ["Definitions", "Core Principles"]},
                {"label": "Applications", "children": ["Projects", "Case Studies"]},
                {"label": "Evaluation", "children": ["Metrics", "Common Errors"]},
                {"label": "Advanced", "children": ["Optimization", "Scaling"]},
            ],
        }
    }


@router.post("/learning-path")
async def generate_learning_path(req: ContentRequest):
    topic = req.topic.strip() or "Core Topic"
    return {
        "path": [
            {"step": 1, "title": f"Understand {topic} basics", "status": "completed"},
            {"step": 2, "title": f"Practice {topic} problems", "status": "active"},
            {"step": 3, "title": f"Build a mini project on {topic}", "status": "locked"},
            {"step": 4, "title": f"Take final assessment on {topic}", "status": "locked"},
        ]
    }


def _weak_topics_payload(user_id: str):
    rows = weak_topics(user_id)
    return {
        "weak_topics": rows,
        "weakTopics": rows,
    }


@router.post("/weak-topics")
async def detect_weak_topics(req: WeakTopicsRequest):
    return _weak_topics_payload(req.user_id or get_default_user_id("student"))


@router.get("/weak-topics")
async def detect_weak_topics_get(user_id: str | None = None):
    return _weak_topics_payload(user_id or get_default_user_id("student"))


@router.get("/course-recommendations")
async def get_course_recommendations(user_id: str | None = None):
    resolved_user_id = user_id or get_default_user_id("student")
    return {"recommended_courses": course_recommendations(resolved_user_id), "user_id": resolved_user_id}


@router.get("/revision-recommendations")
async def get_revision_recommendations(user_id: str | None = None):
    resolved_user_id = user_id or get_default_user_id("student")
    topics = weak_topics(resolved_user_id)
    return {
        "revision_recommendations": [
            {
                "id": f"rev-{index + 1}",
                "topic": row["topic"],
                "priority": "high" if row["confidence"] < 55 else "medium",
                "nextReview": f"Day {index + 1}",
                "reason": f"Current confidence is {row['confidence']}%",
            }
            for index, row in enumerate(topics)
        ],
        "user_id": resolved_user_id,
    }
