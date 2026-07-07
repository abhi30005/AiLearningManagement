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
    issue_course_certificate,
    grade_submission,
)

try:
    import openai
except ImportError:
    openai = None


router = APIRouter(prefix="/assessments", tags=["Quiz & Assessments, Assignments"])


def get_openai_client():
    key = os.environ.get("OPENAI_API_KEY")
    if key and key != "MY_OPENAI_API_KEY" and openai:
        return openai.OpenAI(api_key=key)
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
    fileUrl: str = ""
    question: str = ""
    studentName: str = ""
    assignmentId: str = ""

class AssignmentUpdateRequest(BaseModel):
    title: str
    instructions: str = ""
    dueDate: Optional[str] = None
    points: int = 100
    resources: list[str] = []
    allowResubmission: bool = True


class AssignmentCreateRequest(BaseModel):
    courseId: str
    teacherId: Optional[str] = None
    title: str
    instructions: str = ""
    dueDate: Optional[str] = None
    points: int = 100
    resources: list[str] = []
    allowResubmission: bool = True


class EvaluateAssignmentRequest(BaseModel):
    userId: Optional[str] = None
    submissionText: str

class GradeSubmissionRequest(BaseModel):
    score: int
    feedback: str

class SubmitQuizRequest(BaseModel):
    userId: Optional[str] = None
    courseId: str
    score: int


@router.post("/generate-quiz")
async def generate_quiz(req: GenerateQuizRequest):
    topic = req.topic or "this concept"
    
    if req.course_id:
        from state_store import get_course
        course = get_course(req.course_id)
        if course and course.get("title"):
            topic = course["title"]

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

    client = get_openai_client()
    if client:
        try:
            prompt = (
                f'Generate a {difficulty} multiple choice quiz with exactly {count} unique and randomized questions about "{topic}". '
                'Ensure the questions are different every time you are asked. '
                'Return ONLY a JSON object with a single key "questions" mapped to an array with fields: id, question, options[4], correctAnswerIndex, explanation.'
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.9
            )
            parsed = json.loads(response.choices[0].message.content)
            return {"questions": parsed.get("questions", [])}
        except Exception:
            pass

    return {"questions": fallback}

@router.post("/submit-quiz")
async def submit_quiz(req: SubmitQuizRequest):
    user_id = req.userId or get_default_user_id("admin")
    
    # Record the quiz submission
    from state_store import record_quiz_submission
    record_quiz_submission(user_id, req.courseId, req.score)
    
    if req.score >= 75:
        certificate_info = issue_course_certificate(user_id, req.courseId, req.score)
        if certificate_info:
            return {
                "success": True, 
                "passed": True, 
                "certificate": certificate_info,
                "badges": certificate_info.get("new_badges", [])
            }
    
    return {"success": True, "passed": False}

@router.post("/assignments")
async def create_course_assignment(req: AssignmentCreateRequest):
    assignment = create_assignment(
        course_id=req.courseId,
        title=req.title,
        description=req.instructions,
        due_date=req.dueDate or "",
        points=req.points,
        teacher_id=req.teacherId,
        resources=req.resources,
        allow_resubmission=req.allowResubmission
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
        user_id=req.userId or get_default_user_id("admin"),
        course_id=req.courseId,
        title=req.title,
        submission_text=req.submissionText,
        file_url=req.fileUrl,
        question=req.question,
        student_name=req.studentName,
        assignment_id=req.assignmentId
    )
    return {"success": True, "assignment": assignment}

@router.put("/assignments/{assignment_id}")
async def update_course_assignment(assignment_id: str, req: AssignmentUpdateRequest):
    from state_store import update_assignment
    updates = req.dict(exclude_unset=True) if hasattr(req, "dict") else req.model_dump(exclude_unset=True)
    updated = update_assignment(assignment_id, updates)
    if not updated:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"success": True, "assignment": updated}

@router.get("/submissions")
async def get_assignment_submissions(user_id: str | None = None):
    return {"submissions": list_submissions(user_id)}

@router.put("/submit-assignment/{submission_id}/grade")
async def manual_grade_assignment(submission_id: str, req: GradeSubmissionRequest):
    updated = grade_submission(submission_id, req.score, req.feedback)
    if not updated:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"success": True, "submission": updated}


@router.post("/evaluate-assignment")
async def evaluate_assignment(req: EvaluateAssignmentRequest):
    client = get_openai_client()
    if client:
        try:
            prompt = (
                "You are an academic evaluator. Evaluate the submission and return a JSON object with keys: "
                "grade (A-F), score (0-100), feedback (2-3 lines), plagiarismRate (like '3% - Original Work').\n\n"
                f"Submission:\n{req.submissionText[:3000]}"
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content)
            if req.userId:
                apply_submission_evaluation(req.userId, parsed)
            return parsed
        except Exception:
            pass

    result = evaluate_submission_text(req.submissionText)
    if req.userId:
        apply_submission_evaluation(req.userId, result)
    return result
