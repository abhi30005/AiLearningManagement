from fastapi import APIRouter

from state_store import get_admin_analytics, get_default_user_id, get_student_analytics, get_teacher_analytics, list_courses


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/study-hours")
async def get_study_hours(user_id: str | None = None):
    student = get_student_analytics(user_id or get_default_user_id("student"))
    week_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    trends = [{"day": day, "hours": student["studyHours"][idx]} for idx, day in enumerate(week_days)]
    return {"trends": trends}


@router.get("/course-progress")
async def get_course_progress():
    rows = list_courses()
    if not rows:
        return {"overallProgress": 0, "courseProgress": []}
    progress_rows = [{"title": row["title"], "progress": int(row.get("progress", 0))} for row in rows]
    avg = int(sum(row["progress"] for row in progress_rows) / len(progress_rows))
    return {"overallProgress": avg, "courseProgress": progress_rows}


@router.get("/skill-mastery")
async def get_skill_mastery():
    courses = list_courses()
    if courses:
        rows = []
        grouped: dict[str, list[int]] = {}
        for course in courses:
            grouped.setdefault(course.get("category") or "General", []).append(int(course.get("progress", 0)))
        for skill, values in grouped.items():
            rows.append({"skill": skill, "level": int(sum(values) / len(values))})
        return {"skills": rows}
    return {
        "skills": []
    }


@router.get("/student/{student_id}")
async def student_analytics(student_id: str):
    return get_student_analytics(student_id)


@router.get("/teacher/{teacher_id}")
async def teacher_analytics(teacher_id: str):
    return get_teacher_analytics(teacher_id)


@router.get("/admin")
async def admin_analytics():
    return get_admin_analytics()
