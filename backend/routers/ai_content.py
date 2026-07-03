import json
import os

from fastapi import APIRouter
from pydantic import BaseModel

from state_store import course_recommendations, get_default_user_id, save_flashcards, save_note, weak_topics, get_course

try:
    import openai
except ImportError:
    openai = None


router = APIRouter(prefix="/ai-content", tags=["AI Content Generation & Personalized Learning"])


class ContentRequest(BaseModel):
    topic: str
    language: str = "en"
    user_id: str | None = None

class QuizGenerationRequest(BaseModel):
    course_id: str
    user_id: str | None = None

class WhiteboardRequest(BaseModel):
    prompt: str

class WeakTopicsRequest(BaseModel):
    user_id: str | None = None


def get_openai_client():
    key = os.environ.get("OPENAI_API_KEY")
    if key and key != "MY_OPENAI_API_KEY" and openai:
        return openai.OpenAI(api_key=key)
    return None

@router.post("/whiteboard-assist")
async def whiteboard_assist(req: WhiteboardRequest):
    prompt = req.prompt.strip()
    client = get_openai_client()
    suggestion = ""
    
    if client and prompt:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f'Act as an expert instructor. Provide a brief, structural whiteboard design suggestion for the following prompt: "{prompt}". Keep it under 3 sentences.'}]
            )
            suggestion = (response.choices[0].message.content or "").strip()
        except Exception:
            suggestion = ""
            
    if not suggestion:
        suggestion = f"Here is a suggestion based on \"{prompt}\": Consider structuring your diagram with a central hub branching outwards, using high-contrast colors for primary nodes."
        
    return {"suggestion": suggestion}

@router.post("/generate-quiz")
async def generate_quiz(req: QuizGenerationRequest):
    course = get_course(req.course_id)
    topic = course.get("title", "General Knowledge") if course else "General Knowledge"
    
    client = get_openai_client()
    quiz = []
    
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f'Generate a 5-question multiple choice quiz on the topic of "{topic}". Return ONLY a JSON object with a single key "questions" mapped to an array of objects. Each object must have: "id" (string), "text" (string question), "options" (array of 4 string options), and "correctAnswer" (integer index 0-3 of the correct option).'}],
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content)
            quiz = parsed.get("questions", [])
        except Exception:
            quiz = []
            
    if not quiz:
        # Fallback mock quiz
        quiz = [
            {
                "id": "q1",
                "text": f"What is the primary concept behind {topic}?",
                "options": ["A core fundamental", "A side effect", "An obsolete idea", "None of the above"],
                "correctAnswer": 0
            },
            {
                "id": "q2",
                "text": "Which of these is a common application?",
                "options": ["Web Development", "AI and Data Science", "Both A and B", "None"],
                "correctAnswer": 2
            },
            {
                "id": "q3",
                "text": "How do you evaluate mastery of this topic?",
                "options": ["Memorization", "Practical application", "Reading", "Sleeping"],
                "correctAnswer": 1
            },
            {
                "id": "q4",
                "text": "What is a major limitation?",
                "options": ["Cost", "Complexity without fundamentals", "Speed", "Size"],
                "correctAnswer": 1
            },
            {
                "id": "q5",
                "text": "Is continuous practice required?",
                "options": ["Yes, frequently", "No, never", "Only sometimes", "Not applicable"],
                "correctAnswer": 0
            }
        ]
        
    return {"quiz": {"id": f"quiz_{req.course_id}", "title": f"{topic} Quiz", "questions": quiz}}


@router.post("/notes")
async def generate_notes(req: ContentRequest):
    topic = req.topic.strip() or "AI Models"
    notes = ""
    client = get_openai_client()
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f'Generate concise, structured study notes on "{topic}" in {req.language}.'}]
            )
            notes = (response.choices[0].message.content or "").strip()
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

    save_note(req.user_id or get_default_user_id("admin"), topic, notes)
    return {"notes": notes}


@router.post("/flashcards")
async def generate_flashcards(req: ContentRequest):
    topic = req.topic.strip() or "AI Models"
    cards = []

    client = get_openai_client()
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f'Generate 5 study flashcards for "{topic}". Return ONLY a JSON object with a single key "cards" mapped to an array of objects with "front" and "back" keys.'}],
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content)
            cards = parsed.get("cards", [])
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

    save_flashcards(req.user_id or get_default_user_id("admin"), topic, cards)
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
    return _weak_topics_payload(req.user_id or get_default_user_id("admin"))


@router.get("/weak-topics")
async def detect_weak_topics_get(user_id: str | None = None):
    return _weak_topics_payload(user_id or get_default_user_id("admin"))


@router.get("/course-recommendations")
async def get_course_recommendations(user_id: str | None = None):
    resolved_user_id = user_id or get_default_user_id("admin")
    return {"recommended_courses": course_recommendations(resolved_user_id), "user_id": resolved_user_id}


@router.get("/revision-recommendations")
async def get_revision_recommendations(user_id: str | None = None):
    resolved_user_id = user_id or get_default_user_id("admin")
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
