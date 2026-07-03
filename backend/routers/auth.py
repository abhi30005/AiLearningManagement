from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import uuid
from datetime import datetime

from state_store import authenticate_user, register_user
from utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    role: Optional[str] = None

class StudentRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: Optional[str] = None
    course: Optional[str] = None

class TeacherRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: Optional[str] = None
    subject: Optional[str] = None

@router.post("/login")
async def login(req: LoginRequest):
    user = authenticate_user(email=req.email, password=req.password, role=req.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"success": True, "user": user, "token": token}

@router.post("/register/student")
async def register_student(req: StudentRegisterRequest):
    user = register_user(
        name=req.name,
        email=req.email,
        role="student",
        password=req.password,
        department=req.department,
        course=req.course
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered or invalid request",
        )
    
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"success": True, "user": user, "token": token}

@router.post("/register/teacher")
async def register_teacher(req: TeacherRegisterRequest):
    user = register_user(
        name=req.name,
        email=req.email,
        role="teacher",
        password=req.password,
        department=req.department,
        subject=req.subject
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered or invalid request",
        )
    
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"success": True, "user": user, "token": token}

class OAuthRequest(BaseModel):
    role: Optional[str] = "student"

@router.post("/google")
async def google_sign_in(req: OAuthRequest = OAuthRequest(role="student")):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google sign-in is not configured for this system.",
    )

@router.post("/github")
async def github_sign_in(req: OAuthRequest = OAuthRequest(role="student")):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub sign-in is not configured for this system.",
    )

