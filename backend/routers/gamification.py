from fastapi import APIRouter, Query
from pydantic import BaseModel

from state_store import award_xp, get_default_user_id, get_leaderboard, get_user_stats, issue_certificate, list_certificates


router = APIRouter(prefix="/gamification", tags=["Gamification"])


class AwardXpRequest(BaseModel):
    userId: str
    amount: int


class CertificateRequest(BaseModel):
    userId: str
    title: str = "Course Completion"
    courseId: str | None = None


@router.get("/leaderboard")
async def leaderboard():
    return {"leaderboard": get_leaderboard()}


@router.post("/award-xp")
async def add_xp(
    req: AwardXpRequest | None = None,
    user_id: str | None = Query(default=None),
    amount: int | None = Query(default=None),
):
    resolved_user_id = user_id or (req.userId if req else get_default_user_id("admin"))
    resolved_amount = int(amount if amount is not None else (req.amount if req else 0))
    stats = award_xp(resolved_user_id, resolved_amount)
    return {
        "success": True,
        "totalXp": stats["xp"],
        "total_xp": stats["xp"],
        "streak": stats["streak"],
        "current_streak": stats["streak"],
        "user_id": stats["user_id"],
    }


@router.get("/stats/{user_id}")
async def stats(user_id: str):
    current = get_user_stats(user_id)
    return {
        "xp": current["xp"],
        "totalXp": current["xp"],
        "total_xp": current["xp"],
        "streak": current["streak"],
        "badges": current["badges"],
    }


@router.get("/certificates/{user_id}")
async def certificates(user_id: str):
    return {"certificates": list_certificates(user_id)}


@router.post("/issue-certificate")
async def create_certificate(req: CertificateRequest):
    certificate = issue_certificate(req.userId, req.title, req.courseId)
    if not certificate:
        return {"success": False, "message": "User not found"}
    return {"success": True, "certificate": certificate}
