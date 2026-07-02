from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from state_store import (
    delete_user,
    get_current_user,
    get_settings,
    get_user_by_email,
    get_user_by_id,
    list_users,
    save_settings,
    update_user,
    update_user_role,
)


router = APIRouter(prefix="/users", tags=["Authentication & User Management"])


class RoleUpdateRequest(BaseModel):
    role: str
    user_id: Optional[str] = None


class SettingsUpdateRequest(BaseModel):
    notifications: Optional[bool] = None
    ragChunkSize: Optional[int] = None
    emailDigest: Optional[str] = None
    preferredLanguage: Optional[str] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None
    department: Optional[str] = None


def _resolve_user(default_user_id: Optional[str], email_header: Optional[str]) -> dict[str, Any]:
    if default_user_id:
        selected = get_user_by_id(default_user_id)
        if selected:
            return selected
    if email_header:
        selected = get_user_by_email(email_header)
        if selected:
            return selected
    return get_current_user()


@router.get("/me")
async def get_me(x_user_email: Optional[str] = Header(default=None)):
    return _resolve_user(default_user_id=None, email_header=x_user_email)


@router.get("/")
async def get_roster():
    return {"users": list_users()}


@router.get("/{user_id}")
async def get_user_by_id_route(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me/role")
async def update_my_role(req: RoleUpdateRequest, x_user_email: Optional[str] = Header(default=None)):
    current = _resolve_user(default_user_id=req.user_id, email_header=x_user_email)
    updated = update_user_role(current["id"], req.role)
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid role")
    return {"success": True, "role": updated["role"], "user": updated}


@router.put("/{user_id}/role")
async def update_user_role_route(user_id: str, req: RoleUpdateRequest):
    updated = update_user_role(user_id, req.role)
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid role or user not found")
    return {"success": True, "user": updated}


@router.put("/{user_id}")
async def update_user_route(user_id: str, req: UserUpdateRequest):
    if not get_user_by_id(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    updated = update_user(user_id, req.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid user update")
    return {"success": True, "user": updated}


@router.delete("/{user_id}")
async def delete_user_route(user_id: str):
    deleted = delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}


@router.get("/{user_id}/settings")
async def get_user_settings(user_id: str):
    return {"settings": get_settings(user_id)}


@router.put("/{user_id}/settings")
async def update_user_settings(user_id: str, req: SettingsUpdateRequest):
    payload = req.model_dump(exclude_none=True)
    settings = save_settings(user_id, payload)
    return {"success": True, "settings": settings}
