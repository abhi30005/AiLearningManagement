from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from state_store import create_notification, get_default_user_id, list_notifications, mark_notification_read


router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationRequest(BaseModel):
    userId: Optional[str] = None
    title: str
    message: str
    type: str = "info"


@router.get("/")
async def get_notifications(user_id: Optional[str] = None):
    return {"notifications": list_notifications(user_id or get_default_user_id("admin"))}


@router.post("/")
async def post_notification(req: NotificationRequest):
    row = create_notification(req.userId or get_default_user_id("admin"), req.title, req.message, req.type)
    return {"success": True, "notification": row}


@router.put("/{notification_id}/read")
async def read_notification(notification_id: str):
    row = mark_notification_read(notification_id)
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "notification": row}
