from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from state_store import authenticate_user, get_default_user, register_user


router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    role: Optional[str] = None


class RegisterRequest(BaseModel):
    name: str
    email: str
    role: str
    password: Optional[str] = None


def _token_for_role(role: str) -> str:
    if role == "admin":
        return "admin_token"
    if role == "teacher":
        return "teacher_token"
    return "student_token"


@router.post("/login")
async def login(req: LoginRequest):
    user = authenticate_user(email=req.email, password=req.password, role=req.role)
    return {"success": True, "user": user, "token": _token_for_role(user["role"])}


@router.post("/register")
async def register(req: RegisterRequest):
    user = register_user(name=req.name, email=req.email, role=req.role, password=req.password)
    return {"success": True, "user": user, "token": _token_for_role(user["role"])}


@router.post("/google")
async def google_sign_in():
    default_student = get_default_user("student")
    user = authenticate_user(email=default_student["email"], password=None, role="student")
    return {"success": True, "user": user, "token": _token_for_role(user["role"])}


@router.post("/github")
async def github_sign_in():
    default_student = get_default_user("student")
    user = authenticate_user(email=default_student["email"], password=None, role="student")
    return {"success": True, "user": user, "token": _token_for_role(user["role"])}
