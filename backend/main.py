from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from config import settings
from database import get_database_status

# Import routers
from routers import auth, users, courses, materials, rag, tutor, ai_content
from routers import assessments, collaboration, search, analytics, gamification, reports, notifications, support

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Backend API for AI-Powered Learning Management System",
    version="1.0.0"
)

# CORS middleware for frontend communication
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
allow_credentials = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(materials.router)
app.include_router(rag.router)
app.include_router(tutor.router)
app.include_router(ai_content.router)
app.include_router(assessments.router)
app.include_router(collaboration.router)
app.include_router(search.router)
app.include_router(analytics.router)
app.include_router(gamification.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(support.router)

@app.get("/")
async def root():
    return {"message": f"Welcome to the {settings.APP_NAME} API"}

@app.get("/health")
async def health():
    return {"status": "ok", **get_database_status()}
