from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr


router = APIRouter(prefix="/support", tags=["Support & System Actions"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class SystemActionRequest(BaseModel):
    action: str
    requestedBy: Optional[str] = None


@router.post("/contact")
async def contact(req: ContactRequest):
    ticket_id = f"msg-{abs(hash((req.email, req.message, _now_iso()))) % 10_000_000:07d}"
    return {
        "success": True,
        "ticketId": ticket_id,
        "message": f"Thanks {req.name.strip() or 'there'}, your message was received.",
        "receivedAt": _now_iso(),
    }


@router.post("/password-reset")
async def password_reset(req: PasswordResetRequest):
    return {
        "success": True,
        "message": "Password reset instructions are ready for the requested account.",
        "email": req.email,
        "requestedAt": _now_iso(),
    }


@router.post("/system-action")
async def system_action(req: SystemActionRequest):
    clean_action = req.action.strip().lower().replace(" ", "-")
    messages = {
        "db-optimize": "Database optimization check completed.",
        "cloud-backup": "Cloud backup status refreshed.",
        "emergency-lock": "Emergency lock validation completed. No lock was applied in POC mode.",
        "live-session": "Live session room prepared.",
    }
    return {
        "success": True,
        "action": clean_action,
        "message": messages.get(clean_action, "System action completed."),
        "requestedBy": req.requestedBy,
        "completedAt": _now_iso(),
    }
