import time
from typing import Optional

from fastapi import APIRouter

from state_store import get_admin_analytics, get_default_user_id, get_student_analytics, list_courses, list_users


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
async def report_summary(user_id: str | None = None):
    student = get_student_analytics(user_id or get_default_user_id("admin"))
    admin = get_admin_analytics()
    courses = list_courses()
    avg_progress = int(sum(int(c.get("progress", 0)) for c in courses) / len(courses)) if courses else 0
    return {
        "student": {
            "total_xp": student["xp"],
            "study_hours": student["study_hours"],
            "assignment_score": student["assignment_score"],
        },
        "course": {
            "active_courses": len(courses),
            "avg_progress": avg_progress,
            "modules_done": sum(len(ch.get("modules", [])) for c in courses for ch in c.get("chapters", [])),
        },
        "platform": {
            "total_users": len(list_users()),
            "ai_queries": admin["ai_queries_today"],
            "uptime": admin["platform_uptime"],
        },
    }


@router.get("/export")
async def export_report(format: Optional[str] = "pdf"):
    fmt = (format or "pdf").lower()
    if fmt not in {"pdf", "excel"}:
        fmt = "pdf"
    ext = "xlsx" if fmt == "excel" else "pdf"
    return {
        "success": True,
        "downloadUrl": f"/downloads/report-{int(time.time())}.{ext}",
        "message": f"Report exported as {fmt.upper()}",
    }
