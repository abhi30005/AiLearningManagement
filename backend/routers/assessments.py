import json
import os
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from state_store import (
    apply_submission_evaluation,
    create_assignment,
    create_submission,
    evaluate_submission_text,
    get_default_user_id,
    list_assignments,
    list_submissions,
)

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None


router = APIRouter(prefix="/assessments", tags=["Quiz & Assessments, Assignments"])


def get_gemini_client():
    key = os.environ.get("GEMINI_API_KEY")
    if key and key != "MY_GEMINI_API_KEY" and genai:
        return genai.Client(api_key=key)
    return None


class GenerateQuizRequest(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    numQuestions: Optional[int] = 3
    type: Optional[str] = None
    course_id: Optional[str] = None


class SubmitAssignmentRequest(BaseModel):
    userId: str | None = None
    courseId: str = ""
    title: str = "Untitled Assignment"
    submissionText: str = ""


class AssignmentCreateRequest(BaseModel):
    courseId: str
    teacherId: Optional[str] = None
    title: str
    instructions: str = ""
    dueDate: Optional[str] = None
    resources: list[str] = []
    allowResubmission: bool = True


class EvaluateAssignmentRequest(BaseModel):
    userId: Optional[str] = None
    submissionText: str


@router.post("/generate-quiz")
async def generate_quiz(req: GenerateQuizRequest):
    topic = req.topic or "this concept"
    difficulty = req.difficulty or "standard"
    count = max(1, min(8, int(req.numQuestions or 3)))

    fallback = [
        {
            "id": f"q-{index + 1}",
            "question": f"[{difficulty}] {topic} - question {index + 1}",
            "options": [
                f"{topic} concept",
                f"{topic} example",
                f"{topic} misconception",
                f"{topic} application",
            ],
            "correctAnswerIndex": index % 4,
            "explanation": "This answer aligns with the key concept in the requested topic.",
        }
        for index in range(count)
    ]

    client = get_gemini_client()
    if client:
        try:
            prompt = (
                f'Generate a {difficulty} multiple choice quiz with exactly {count} questions about "{topic}". '
                'Return ONLY JSON array with fields: id, question, options[4], correctAnswerIndex, explanation.'
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            parsed = json.loads(response.text)
            return {"questions": parsed}
        except Exception:
            pass

    return {"questions": fallback}


@router.post("/assignments")
async def create_course_assignment(req: AssignmentCreateRequest):
    assignment = create_assignment(
        course_id=req.courseId,
        title=req.title,
        instructions=req.instructions,
        due_date=req.dueDate,
        teacher_id=req.teacherId,
        resources=req.resources,
        allow_resubmission=req.allowResubmission,
    )
    if not assignment:
        return {"success": False, "message": "Course not found"}
    return {"success": True, "assignment": assignment}


@router.get("/assignments")
async def get_assignments(course_id: Optional[str] = None, teacher_id: Optional[str] = None):
    return {"assignments": list_assignments(course_id=course_id, teacher_id=teacher_id)}


@router.post("/submit-assignment")
async def submit_assignment(req: SubmitAssignmentRequest):
    assignment = create_submission(
        user_id=req.userId or get_default_user_id("student"),
        course_id=req.courseId,
        title=req.title,
        submission_text=req.submissionText,
    )
    return {"success": True, "assignment": assignment}


@router.get("/submissions")
async def get_assignment_submissions(user_id: str | None = None):
    return {"submissions": list_submissions(user_id)}


@router.post("/evaluate-assignment")
async def evaluate_assignment(req: EvaluateAssignmentRequest):
    client = get_gemini_client()
    if client:
        try:
            prompt = (
                "You are an academic evaluator. Evaluate the submission and return JSON object with: "
                "grade (A-F), score (0-100), feedback (2-3 lines), plagiarismRate (like '3% - Original Work').\n\n"
                f"Submission:\n{req.submissionText[:3000]}"
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            parsed = json.loads(response.text)
            if req.userId:
                apply_submission_evaluation(req.userId, parsed)
            return parsed
        except Exception:
            pass

    result = evaluate_submission_text(req.submissionText)
    if req.userId:
        apply_submission_evaluation(req.userId, result)
    return result
