from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import uuid
from datetime import datetime

from state_store import authenticate_user, get_default_user, register_user
from utils.security import create_access_token

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

@router.post("/register")
async def register(req: RegisterRequest):
    user = register_user(name=req.name, email=req.email, role=req.role, password=req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed",
        )
    
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"success": True, "user": user, "token": token}

@router.post("/google")
async def google_sign_in():
    default_student = get_default_user("student")
    user = authenticate_user(email=default_student["email"], password=None, role="student")
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"success": True, "user": user, "token": token}

@router.post("/github")
async def github_sign_in():
    default_student = get_default_user("student")
    user = authenticate_user(email=default_student["email"], password=None, role="student")
    token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return {"success": True, "user": user, "token": token}

