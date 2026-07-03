from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from config import settings
from database import get_database_status, wait_for_database
from state_store import ensure_system_admin

# Import routers
from routers import auth, users, courses, materials, rag, tutor, ai_content
from routers import assessments, collaboration, search, analytics, gamification, reports, notifications, support
from routers import categories, enrollments

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Backend API for AI-Powered Learning Management System",
    version="1.0.0"
)

# CORS middleware for frontend communication
allowed_origins_raw = settings.ALLOWED_ORIGINS
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
allow_credentials = settings.CORS_ALLOW_CREDENTIALS and "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX or None,
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
app.include_router(categories.router)
app.include_router(enrollments.router)

@app.on_event("startup")
async def bootstrap_system_admin():
    wait_for_database()
    ensure_system_admin()

@app.get("/")
async def root():
    return {"message": f"Welcome to the {settings.APP_NAME} API"}

@app.head("/")
async def root_head():
    return Response(status_code=200)

@app.get("/api/health")
@app.get("/health")
@app.get("/healthz")
async def health():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": app.version,
    }

@app.head("/api/health")
@app.head("/health")
@app.head("/healthz")
async def health_head():
    return Response(status_code=200)

@app.get("/ready")
@app.get("/readyz")
async def readiness():
    database = get_database_status()
    payload = {
        "status": "ok" if database.get("connected") else "degraded",
        "service": settings.APP_NAME,
        "database": database,
    }
    if not database.get("connected"):
        return JSONResponse(status_code=503, content=payload)
    return payload

@app.head("/ready")
@app.head("/readyz")
async def readiness_head():
    database = get_database_status()
    return Response(status_code=200 if database.get("connected") else 503)
