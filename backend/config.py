import os
from dotenv import load_dotenv

load_dotenv()

def _default_user_id(email: str, role: str) -> str:
    local = (email or role).split("@")[0].lower()
    safe = "".join(ch if ch.isalnum() else "-" for ch in local).strip("-")
    return f"{role}-{safe or role}"


class Settings:
    APP_NAME = os.getenv("APP_NAME", "Lumina AI-LMS")
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    MONGODB_DB = os.getenv("MONGODB_DB", "lumina_lms")
    MONGODB_TIMEOUT_MS = int(os.getenv("MONGODB_TIMEOUT_MS", 10000))
    MONGODB_CONNECT_ATTEMPTS = int(os.getenv("MONGODB_CONNECT_ATTEMPTS", 5))
    MONGODB_RETRY_DELAY_SECONDS = float(os.getenv("MONGODB_RETRY_DELAY_SECONDS", 2))
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    SECRET_KEY = os.getenv("SECRET_KEY", "secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
    DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@eduai.edu")
    DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    DEFAULT_TEACHER_EMAIL = os.getenv("DEFAULT_TEACHER_EMAIL", "teacher@eduai.edu")
    DEFAULT_STUDENT_EMAIL = os.getenv("DEFAULT_STUDENT_EMAIL", "student@eduai.edu")
    DEFAULT_ADMIN_ID = os.getenv("DEFAULT_ADMIN_ID", _default_user_id(DEFAULT_ADMIN_EMAIL, "admin"))
    DEFAULT_TEACHER_ID = os.getenv("DEFAULT_TEACHER_ID", _default_user_id(DEFAULT_TEACHER_EMAIL, "teacher"))
    DEFAULT_STUDENT_ID = os.getenv("DEFAULT_STUDENT_ID", _default_user_id(DEFAULT_STUDENT_EMAIL, "student"))
    DEFAULT_ADMIN_NAME = os.getenv("DEFAULT_ADMIN_NAME", "Platform Admin")
    DEFAULT_TEACHER_NAME = os.getenv("DEFAULT_TEACHER_NAME", "Course Teacher")
    DEFAULT_STUDENT_NAME = os.getenv("DEFAULT_STUDENT_NAME", "Student User")
    DEFAULT_STUDENT_WEAK_TOPICS = os.getenv("DEFAULT_STUDENT_WEAK_TOPICS", "")
    SEED_DEMO_DATA = os.getenv("SEED_DEMO_DATA", "false").lower() in {"1", "true", "yes", "on"}
    DEFAULT_COURSE_WEEKS = int(os.getenv("DEFAULT_COURSE_WEEKS", 8))
    DEFAULT_API_PORT = int(os.getenv("DEFAULT_API_PORT", 8000))
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
    ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX", "")
    CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "false").lower() in {"1", "true", "yes", "on"}

settings = Settings()
