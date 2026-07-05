from __future__ import annotations

import json
import uuid
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from typing import Any

from config import settings
from database import get_database

STATE_FILE = Path(__file__).resolve().parent / "data" / "app_state.json"
STATE_DOC_ID = "app-state"
VALID_ROLES = {"student", "teacher", "admin"}
_LOCK = Lock()
_MONGO_AVAILABLE: bool | None = None
SYNC_COLLECTIONS = [
    "users",
    "courses",
    "categories",
    "enrollments",
    "assignments",
    "submissions",
    "materials",
    "chatHistory",
    "notifications",
    "notes",
    "flashcards",
    "quiz_submissions",
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _default_settings() -> dict[str, Any]:
    return {
        "notifications": True,
        "ragChunkSize": 512,
        "emailDigest": "daily",
        "preferredLanguage": "en",
    }


def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _seed_users() -> list[dict[str, Any]]:
    if not settings.SEED_DEMO_DATA:
        from utils.security import get_password_hash

        return [
            {
                "id": settings.DEFAULT_ADMIN_ID,
                "email": settings.DEFAULT_ADMIN_EMAIL.lower(),
                "password": get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                "name": settings.DEFAULT_ADMIN_NAME,
                "role": "admin",
                "xp": 0,
                "streak": 0,
                "badges": [],
                "studyHours": [0, 0, 0, 0, 0, 0, 0],
                "weakTopics": [],
                "certificates": [],
                "active": True,
                "createdAt": _now_iso(),
            }
        ]

    return [
        {
            "id": settings.DEFAULT_ADMIN_ID,
            "email": settings.DEFAULT_ADMIN_EMAIL,
            "password": "admin123",
            "name": settings.DEFAULT_ADMIN_NAME,
            "role": "admin",
            "xp": 125000,
            "streak": 28,
            "badges": ["Champion", "Mentor"],
            "studyHours": [2, 2, 1, 2, 1, 2, 1],
            "weakTopics": ["Quantum Entanglement", "Algorithmic Proofs"],
            "certificates": [
                {"id": "adm-1", "title": "AI Governance", "date": "2026-06-15", "icon": "Shield", "color": "primary"},
            ],
            "createdAt": _now_iso(),
        },
        {
            "id": "admin-2",
            "email": "admin2@eduai.edu",
            "password": "admin123",
            "name": "Second Admin",
            "role": "admin",
            "xp": 100000,
            "streak": 10,
            "badges": ["Champion"],
            "studyHours": [1, 2, 1, 2, 1, 2, 1],
            "weakTopics": [],
            "certificates": [],
            "createdAt": _now_iso(),
        },
        {
            "id": settings.DEFAULT_TEACHER_ID,
            "email": settings.DEFAULT_TEACHER_EMAIL,
            "password": "teacher123",
            "name": settings.DEFAULT_TEACHER_NAME,
            "role": "teacher",
            "xp": 98200,
            "streak": 17,
            "badges": ["Fast Learner", "Facilitator"],
            "studyHours": [1, 2, 1, 3, 2, 2, 2],
            "weakTopics": ["Evaluation Metrics"],
            "certificates": [
                {"id": "tch-1", "title": "Course Design", "date": "2026-04-30", "icon": "Award", "color": "primary"},
            ],
            "createdAt": _now_iso(),
        },
        {
            "id": settings.DEFAULT_STUDENT_ID,
            "email": settings.DEFAULT_STUDENT_EMAIL,
            "password": "student123",
            "name": settings.DEFAULT_STUDENT_NAME,
            "role": "student",
            "xp": 88230,
            "streak": 14,
            "badges": ["Consistent", "Explorer"],
            "studyHours": [3, 2, 1, 4, 3, 5, 2],
            "weakTopics": _csv(settings.DEFAULT_STUDENT_WEAK_TOPICS),
            "certificates": [
                {"id": "std-1", "title": "AI Basics", "date": "2026-03-10", "icon": "Award", "color": "primary"},
                {"id": "std-2", "title": "Python Master", "date": "2026-05-22", "icon": "Award", "color": "secondary"},
            ],
            "createdAt": _now_iso(),
        },
    ]


def _seed_courses() -> list[dict[str, Any]]:
    if not settings.SEED_DEMO_DATA:
        return []
    return [
        {
            "id": "c1",
            "title": "Transformer Models Deep Dive",
            "description": "Master attention mechanisms and modern LLM architecture.",
            "category": "AI Fundamentals",
            "level": "Level 3",
            "studentsCount": 184,
            "weeks": 12,
            "progress": 75,
            "active": True,
            "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
            "teacherId": settings.DEFAULT_TEACHER_ID,
            "chapters": [
                {
                    "id": "c1-ch1",
                    "title": "Attention Foundations",
                    "modules": [
                        {"id": "c1-ch1-m1", "title": "Scaled Dot Product Attention", "completed": True, "hasPdf": True},
                        {"id": "c1-ch1-m2", "title": "Multi-Head Attention", "completed": False, "hasPdf": True},
                    ],
                }
            ],
            "createdAt": _now_iso(),
        },
        {
            "id": "c2",
            "title": "Quantum Computing Basics",
            "description": "Understand qubits, superposition, and quantum gates.",
            "category": "Quantum Computing",
            "level": "Level 2",
            "studentsCount": 93,
            "weeks": 8,
            "progress": 30,
            "active": True,
            "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
            "teacherId": settings.DEFAULT_TEACHER_ID,
            "chapters": [
                {
                    "id": "c2-ch1",
                    "title": "Qubit Mechanics",
                    "modules": [
                        {"id": "c2-ch1-m1", "title": "State Vectors", "completed": True, "hasPdf": True},
                        {"id": "c2-ch1-m2", "title": "Bloch Sphere", "completed": False, "hasPdf": False},
                    ],
                }
            ],
            "createdAt": _now_iso(),
        },
        {
            "id": "c3",
            "title": "CRISPR & Gene Editing",
            "description": "The revolution in molecular biology and genetic engineering.",
            "category": "Bioinformatics",
            "level": "Level 1",
            "studentsCount": 126,
            "weeks": 10,
            "progress": 0,
            "active": True,
            "image": "https://images.unsplash.com/photo-1530213786676-4122348bb3f5?auto=format&fit=crop&q=80&w=800",
            "teacherId": settings.DEFAULT_TEACHER_ID,
            "chapters": [
                {
                    "id": "c3-ch1",
                    "title": "Gene Editing Overview",
                    "modules": [
                        {"id": "c3-ch1-m1", "title": "CRISPR-Cas9 Intro", "completed": False, "hasPdf": True},
                    ],
                }
            ],
            "createdAt": _now_iso(),
        },
    ]


def _default_state() -> dict[str, Any]:
    users = _seed_users()
    return {
        "users": users,
        "courses": _seed_courses(),
        "enrollments": [],
        "assignments": [],
        "submissions": [],
        "materials": [],
        "chatHistory": [],
        "notifications": [],
        "notes": [],
        "flashcards": [],
        "settings": {u["id"]: _default_settings() for u in users},
    }


def _mongo_collection():
    global _MONGO_AVAILABLE
    try:
        db = get_database()
        if db is None:
            _MONGO_AVAILABLE = False
            return None
        db.client.admin.command("ping")
        _MONGO_AVAILABLE = True
        return db["app_state"]
    except Exception:
        _MONGO_AVAILABLE = False
        return None


def _sync_mongo_collections(collection, state: dict[str, Any]) -> None:
    pass


def _save_unlocked(state: dict[str, Any]) -> None:
    collection = _mongo_collection()
    if collection is not None:
        collection.update_one(
            {"_id": STATE_DOC_ID},
            {"$set": {"state": state, "updatedAt": _now_iso()}},
            upsert=True,
        )
        return

    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp_file = STATE_FILE.with_suffix(".tmp")
    tmp_file.write_text(json.dumps(state, ensure_ascii=True, indent=2), encoding="utf-8")
    tmp_file.replace(STATE_FILE)


def _load_unlocked() -> dict[str, Any]:
    collection = _mongo_collection()
    if collection is not None:
        document = collection.find_one({"_id": STATE_DOC_ID})
        if document and isinstance(document.get("state"), dict):
            raw = document["state"]
        else:
            raw = _default_state()
            collection.update_one(
                {"_id": STATE_DOC_ID},
                {"$set": {"state": raw, "updatedAt": _now_iso()}},
                upsert=True,
            )
        raw.setdefault("users", [])
        raw.setdefault("courses", [])
        raw.setdefault("enrollments", [])
        raw.setdefault("assignments", [])
        raw.setdefault("submissions", [])
        raw.setdefault("materials", [])
        raw.setdefault("chatHistory", [])
        raw.setdefault("notifications", [])
        raw.setdefault("notes", [])
        raw.setdefault("flashcards", [])
        raw.setdefault("settings", {})
        return raw

    if not STATE_FILE.exists():
        state = _default_state()
        _save_unlocked(state)
        return state
    try:
        raw = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        raw = _default_state()
        _save_unlocked(raw)
    raw.setdefault("users", [])
    raw.setdefault("courses", [])
    raw.setdefault("enrollments", [])
    raw.setdefault("assignments", [])
    raw.setdefault("submissions", [])
    raw.setdefault("materials", [])
    raw.setdefault("chatHistory", [])
    raw.setdefault("notifications", [])
    raw.setdefault("notes", [])
    raw.setdefault("flashcards", [])
    raw.setdefault("settings", {})
    return raw



def _role_tier(role: str) -> str:
    if role == "admin":
        return "Admin Tier"
    if role == "teacher":
        return "Faculty Tier"
    return "Student Tier"


def _public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "name": user["name"],
        "full_name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "active": bool(user.get("active", True)),
        "tier": _role_tier(user["role"]),
        "xp": int(user.get("xp", 0)),
        "streak": int(user.get("streak", 0)),
        "badges": list(user.get("badges", [])),
        "studyHours": list(user.get("studyHours", [0, 0, 0, 0, 0, 0, 0])),
        "weakTopics": list(user.get("weakTopics", [])),
        "certificates": list(user.get("certificates", [])),
        "createdAt": user.get("createdAt"),
        "department": user.get("department") or _role_tier(user["role"]).replace(" Tier", ""),
        "course": user.get("course", ""),
        "subject": user.get("subject", ""),
    }


def list_users() -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        return [_public_user(u) for u in state["users"]]


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for user in state["users"]:
            if user["id"] == user_id:
                return _public_user(user)
    return None


def get_user_by_email(email: str) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for user in state["users"]:
            if user["email"].lower() == email.lower():
                return _public_user(user)
    return None


def get_user_by_role(role: str) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for user in state["users"]:
            if user.get("role") == role:
                return _public_user(user)
    return None


def get_default_user(role: str = "admin") -> dict[str, Any]:
    selected_role = role if role in VALID_ROLES else "admin"
    selected = get_user_by_role(selected_role)
    if selected:
        return selected
    users = list_users()
    if users:
        return users[0]
    raise RuntimeError("No users available in state")


def get_default_user_id(role: str = "admin") -> str:
    return get_default_user(role)["id"]


def get_current_user(default_email: str | None = None) -> dict[str, Any]:
    default_email = default_email or settings.DEFAULT_ADMIN_EMAIL
    user = get_user_by_email(default_email)
    if user:
        return user
    return get_default_user("admin")


def authenticate_user(email: str, password: str | None = None, role: str | None = None) -> dict[str, Any] | None:
    from utils.security import get_password_hash, verify_password

    normalized_email = (email or "").strip().lower()
    with _LOCK:
        state = _load_unlocked()
        existing = next((u for u in state["users"] if u["email"].lower() == normalized_email), None)
        if not existing:
            return None
        if role in VALID_ROLES and existing["role"] != role:
            return None

        stored_password = existing.get("password", "")
        if stored_password:
            if not password:
                return None
            if stored_password.startswith("$2"):
                if not verify_password(password, stored_password):
                    return None
            elif stored_password != password:
                return None
            else:
                existing["password"] = get_password_hash(password)
                _save_unlocked(state)
        elif password:
            return None

        return _public_user(existing)


def register_user(name: str, email: str, role: str, password: str | None = None, **kwargs) -> dict[str, Any] | None:
    from utils.security import get_password_hash

    normalized_email = (email or "").strip().lower()
    chosen_role = role if role in VALID_ROLES else "student"
    with _LOCK:
        state = _load_unlocked()
        existing = next((u for u in state["users"] if u["email"].lower() == normalized_email), None)
        if existing:
            return None

        new_user = {
            "id": f"user-{uuid.uuid4().hex[:10]}",
            "email": normalized_email,
            "password": get_password_hash(password) if password else "",
            "name": name.strip() or "Learner",
            "role": chosen_role,
            "xp": 0,
            "streak": 0,
            "badges": ["New Learner"],
            "studyHours": [0, 0, 0, 0, 0, 0, 0],
            "weakTopics": [],
            "certificates": [],
            "active": True,
            "createdAt": _now_iso(),
            **kwargs,
        }
        state["users"].append(new_user)
        state["settings"][new_user["id"]] = _default_settings()
        _save_unlocked(state)
        return _public_user(new_user)


def update_user_role(user_id: str, role: str) -> dict[str, Any] | None:
    if role not in VALID_ROLES:
        return None
    with _LOCK:
        state = _load_unlocked()
        for user in state["users"]:
            if user["id"] == user_id:
                user["role"] = role
                _save_unlocked(state)
                return _public_user(user)
    return None


def update_user(user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    allowed = {"name", "email", "role", "active", "department"}
    clean_updates = {key: value for key, value in updates.items() if key in allowed and value is not None}
    if "role" in clean_updates and clean_updates["role"] not in VALID_ROLES:
        return None
    if "email" in clean_updates:
        clean_updates["email"] = str(clean_updates["email"]).strip().lower()
    if "name" in clean_updates:
        clean_updates["name"] = str(clean_updates["name"]).strip() or "Learner"
    if "active" in clean_updates:
        clean_updates["active"] = bool(clean_updates["active"])

    with _LOCK:
        state = _load_unlocked()
        for user in state["users"]:
            if user["id"] == user_id:
                user.update(clean_updates)
                _save_unlocked(state)
                return _public_user(user)
    return None


def delete_user(user_id: str) -> bool:
    with _LOCK:
        state = _load_unlocked()
        original_len = len(state["users"])
        state["users"] = [user for user in state["users"] if user["id"] != user_id]
        changed = len(state["users"]) != original_len
        if changed:
            state.get("settings", {}).pop(user_id, None)
            state["enrollments"] = [row for row in state.get("enrollments", []) if row.get("userId") != user_id]
            state["notifications"] = [row for row in state.get("notifications", []) if row.get("userId") != user_id]
            _save_unlocked(state)
        return changed


def list_courses() -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        return deepcopy(state["courses"])


def get_course(course_id: str) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for course in state["courses"]:
            if course["id"] == course_id:
                return deepcopy(course)
    return None


def create_course(
    title: str,
    description: str,
    category: str,
    teacher_id: str | None = None,
    thumbnail: str | None = None,
    level: str | None = None,
    language: str | None = None,
) -> dict[str, Any]:
    clean_title = (title or "").strip() or "Untitled Course"
    clean_category = (category or "").strip() or "General"
    clean_description = (description or "").strip() or f"{clean_title} curriculum"
    owner_id = teacher_id or get_default_user_id("admin")
    fallback_image = f"https://picsum.photos/seed/{clean_title.replace(' ', '-')}/600/400"
    thumbnail_url = (thumbnail or "").strip() or fallback_image
    chapter_id = f"ch-{uuid.uuid4().hex[:8]}"
    module_id = f"mod-{uuid.uuid4().hex[:8]}"
    course = {
        "id": f"c-{uuid.uuid4().hex[:8]}",
        "title": clean_title,
        "description": clean_description,
        "category": clean_category,
        "level": level or "beginner",
        "language": language or "en",
        "studentsCount": 0,
        "weeks": settings.DEFAULT_COURSE_WEEKS,
        "progress": 0,
        "active": True,
        "image": thumbnail_url,
        "thumbnail": thumbnail_url,
        "teacherId": owner_id,
        "chapters": [
            {
                "id": chapter_id,
                "title": "Introduction",
                "modules": [
                    {"id": module_id, "title": "Kickoff Module", "completed": False, "hasPdf": False},
                ],
            }
        ],
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state["courses"].append(course)
        _save_unlocked(state)
    return deepcopy(course)


def update_course(course_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    if not updates:
        return get_course(course_id)
    with _LOCK:
        state = _load_unlocked()
        for course in state["courses"]:
            if course["id"] == course_id:
                course.update(updates)
                _save_unlocked(state)
                return deepcopy(course)
    return None


def add_course_chapter(course_id: str, title: str) -> dict[str, Any] | None:
    chapter = {"id": f"ch-{uuid.uuid4().hex[:8]}", "title": title, "modules": []}
    with _LOCK:
        state = _load_unlocked()
        for course in state["courses"]:
            if course["id"] == course_id:
                course.setdefault("chapters", []).append(chapter)
                _save_unlocked(state)
                return deepcopy(chapter)
    return None


def add_chapter_module(course_id: str, chapter_id: str, title: str, completed: bool, has_pdf: bool, url: str | None = None) -> dict[str, Any] | None:
    module = {
        "id": f"mod-{uuid.uuid4().hex[:8]}",
        "title": title,
        "completed": completed,
        "hasPdf": has_pdf,
        "url": url,
    }
    with _LOCK:
        state = _load_unlocked()
        for course in state["courses"]:
            if course["id"] != course_id:
                continue
            for chapter in course.get("chapters", []):
                if chapter["id"] == chapter_id:
                    chapter.setdefault("modules", []).append(module)
                    _save_unlocked(state)
                    return deepcopy(module)
            return None
    return None


def list_chapter_modules(course_id: str, chapter_id: str) -> list[dict[str, Any]] | None:
    with _LOCK:
        state = _load_unlocked()
        for course in state["courses"]:
            if course["id"] != course_id:
                continue
            for chapter in course.get("chapters", []):
                if chapter["id"] == chapter_id:
                    return deepcopy(chapter.get("modules", []))
            return None
    return None


def delete_course(course_id: str) -> bool:
    with _LOCK:
        state = _load_unlocked()
        original_len = len(state["courses"])
        state["courses"] = [course for course in state["courses"] if course["id"] != course_id]
        changed = len(state["courses"]) != original_len
        if changed:
            _save_unlocked(state)
        return changed


def enroll_user_in_course(user_id: str, course_id: str) -> dict[str, Any] | None:
    user = get_user_by_id(user_id)
    if not user:
        return None
    with _LOCK:
        state = _load_unlocked()
        course = next((row for row in state["courses"] if row["id"] == course_id), None)
        if not course:
            return None
        existing = next(
            (row for row in state.setdefault("enrollments", []) if row.get("userId") == user["id"] and row.get("courseId") == course_id),
            None,
        )
        if existing:
            return deepcopy(existing)
        row = {
            "id": f"enr-{uuid.uuid4().hex[:10]}",
            "userId": user["id"],
            "courseId": course_id,
            "progress": 0,
            "lessonsCompleted": [],
            "quizPassed": False,
            "assignmentsCompleted": False,
            "completed": False,
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }
        state["enrollments"].insert(0, row)
        course["studentsCount"] = int(course.get("studentsCount", 0)) + 1
        _save_unlocked(state)
        return deepcopy(row)


def list_enrollments(user_id: str | None = None, course_id: str | None = None) -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        rows = list(state.get("enrollments", []))
    if user_id:
        rows = [row for row in rows if row.get("userId") == user_id]
    if course_id:
        rows = [row for row in rows if row.get("courseId") == course_id]
    return deepcopy(rows)


def update_course_progress(user_id: str, course_id: str, progress: int) -> dict[str, Any] | None:
    user = get_user_by_id(user_id)
    if not user:
        return None
    clean_progress = max(0, min(100, int(progress)))
    with _LOCK:
        state = _load_unlocked()
        course = next((row for row in state["courses"] if row["id"] == course_id), None)
        if not course:
            return None
        enrollment = next(
            (row for row in state.setdefault("enrollments", []) if row.get("userId") == user["id"] and row.get("courseId") == course_id),
            None,
        )
        if not enrollment:
            enrollment = {
                "id": f"enr-{uuid.uuid4().hex[:10]}",
                "userId": user["id"],
                "courseId": course_id,
                "lessonsCompleted": [],
                "quizPassed": False,
                "assignmentsCompleted": False,
                "createdAt": _now_iso(),
            }
            state["enrollments"].insert(0, enrollment)
        enrollment["progress"] = clean_progress
        enrollment["completed"] = clean_progress >= 100 and bool(enrollment.get("quizPassed", clean_progress >= 80))
        enrollment["updatedAt"] = _now_iso()
        course["progress"] = max(int(course.get("progress", 0)), clean_progress)
        certificate = None
        if enrollment["completed"]:
            for state_user in state["users"]:
                if state_user["id"] == user["id"]:
                    existing = next((cert for cert in state_user.get("certificates", []) if cert.get("courseId") == course_id), None)
                    if not existing:
                        certificate = {
                            "id": f"cert-{uuid.uuid4().hex[:10]}",
                            "title": f"{course['title']} Completion",
                            "courseId": course_id,
                            "date": _now_iso()[:10],
                            "icon": "Award",
                            "color": "primary",
                        }
                        state_user.setdefault("certificates", []).insert(0, certificate)
                    break
        _save_unlocked(state)
        result = deepcopy(enrollment)
        if certificate:
            result["certificate"] = certificate
        return result


def create_assignment(
    course_id: str,
    title: str,
    instructions: str,
    due_date: str | None = None,
    teacher_id: str | None = None,
    resources: list[str] | None = None,
    allow_resubmission: bool = True,
) -> dict[str, Any] | None:
    course = get_course(course_id)
    if not course:
        return None
    row = {
        "id": f"asg-{uuid.uuid4().hex[:10]}",
        "courseId": course_id,
        "teacherId": teacher_id or course.get("teacherId") or get_default_user_id("admin"),
        "title": title.strip() or "Assignment",
        "instructions": instructions.strip(),
        "dueDate": due_date,
        "resources": resources or [],
        "allowResubmission": allow_resubmission,
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state.setdefault("assignments", []).insert(0, row)
        _save_unlocked(state)
    return deepcopy(row)


def list_assignments(course_id: str | None = None, teacher_id: str | None = None) -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        rows = list(state.get("assignments", []))
    if course_id:
        rows = [row for row in rows if row.get("courseId") == course_id]
    if teacher_id:
        rows = [row for row in rows if row.get("teacherId") == teacher_id]
    return deepcopy(rows)


def award_xp(user_id: str, amount: int) -> dict[str, Any]:
    awarded = int(amount or 0)
    with _LOCK:
        state = _load_unlocked()
        user = next((u for u in state["users"] if u["id"] == user_id), None)
        if not user:
            user = next((u for u in state["users"] if u["role"] == "student"), None)
        if not user:
            user = state["users"][0]
        user["xp"] = int(user.get("xp", 0)) + awarded
        user["streak"] = max(1, int(user.get("streak", 0)))
        _save_unlocked(state)
        return {
            "user_id": user["id"],
            "xp": int(user["xp"]),
            "streak": int(user["streak"]),
            "badges": list(user.get("badges", [])),
        }


def get_user_stats(user_id: str) -> dict[str, Any]:
    user = get_user_by_id(user_id)
    if not user:
        user = get_current_user()
    return {
        "xp": int(user.get("xp", 0)),
        "streak": int(user.get("streak", 0)),
        "badges": list(user.get("badges", [])),
    }


def get_leaderboard(limit: int = 20) -> list[dict[str, Any]]:
    users = list_users()
    ranked = sorted(users, key=lambda u: int(u.get("xp", 0)), reverse=True)
    result: list[dict[str, Any]] = []
    for index, user in enumerate(ranked[:limit]):
        result.append(
            {
                "id": user["id"],
                "user_id": user["id"],
                "name": user["name"],
                "xp": int(user.get("xp", 0)),
                "rank": index + 1,
                "badges": list(user.get("badges", [])),
                "streak": int(user.get("streak", 0)),
                "avatar": f"https://api.dicebear.com/9.x/notionists/svg?seed={user['id']}",
                "location": "Global",
                "trend": "Up",
            }
        )
    return result


def create_submission(user_id: str, course_id: str, title: str, submission_text: str) -> dict[str, Any]:
    submission = {
        "id": f"sub-{uuid.uuid4().hex[:10]}",
        "userId": user_id,
        "courseId": course_id,
        "title": title,
        "submissionText": submission_text,
        "submittedAt": _now_iso(),
        "grade": None,
        "score": None,
        "feedback": None,
        "plagiarismRate": None,
    }
    with _LOCK:
        state = _load_unlocked()
        state["submissions"].insert(0, submission)
        _save_unlocked(state)
    return deepcopy(submission)


def list_submissions(user_id: str | None = None) -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        rows = list(state["submissions"])
        if user_id:
            rows = [s for s in rows if s.get("userId") == user_id]
        return deepcopy(rows)


def evaluate_submission_text(submission_text: str) -> dict[str, Any]:
    words = [token for token in submission_text.split() if token.strip()]
    word_count = len(words)
    score = min(100, max(52, 55 + (word_count // 10)))
    if word_count > 280:
        score = min(100, score + 10)
    if word_count < 40:
        score = max(40, score - 10)

    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B+"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C+"
    else:
        grade = "C"

    plagiarism = max(2, min(24, 24 - (word_count // 25)))
    feedback = (
        "Strong understanding shown. Add one or two concrete examples and tighter structure to improve clarity."
        if score >= 80
        else "Good attempt. Strengthen depth, provide clearer examples, and refine argument flow for a higher score."
    )

    return {
        "grade": grade,
        "score": score,
        "feedback": feedback,
        "plagiarismRate": f"{plagiarism}% - Low Similarity",
    }


def apply_submission_evaluation(user_id: str, evaluation: dict[str, Any]) -> None:
    with _LOCK:
        state = _load_unlocked()
        for submission in state["submissions"]:
            if submission.get("userId") == user_id:
                if submission.get("grade") is None:
                    submission["grade"] = evaluation.get("grade")
                    submission["score"] = evaluation.get("score")
                    submission["feedback"] = evaluation.get("feedback")
                    submission["plagiarismRate"] = evaluation.get("plagiarismRate")
                    break
        _save_unlocked(state)


def save_note(user_id: str, topic: str, content: str) -> dict[str, Any]:
    row = {
        "id": f"note-{uuid.uuid4().hex[:10]}",
        "userId": user_id,
        "topic": topic,
        "content": content,
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state["notes"].insert(0, row)
        _save_unlocked(state)
    return deepcopy(row)


def save_flashcards(user_id: str, topic: str, cards: list[dict[str, str]]) -> dict[str, Any]:
    row = {
        "id": f"cards-{uuid.uuid4().hex[:10]}",
        "userId": user_id,
        "topic": topic,
        "cards": cards,
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state["flashcards"].insert(0, row)
        _save_unlocked(state)
    return deepcopy(row)


def weak_topics(user_id: str) -> list[dict[str, Any]]:
    user = get_user_by_id(user_id) or get_current_user()
    base = list(user.get("weakTopics", []))
    if not base:
        base = ["Foundational Concepts", "Problem Decomposition"]
    return [{"topic": topic, "confidence": max(30, 70 - idx * 8)} for idx, topic in enumerate(base)]


def course_recommendations(user_id: str) -> list[dict[str, Any]]:
    topics = weak_topics(user_id)
    courses = list_courses()
    recs: list[dict[str, Any]] = []
    for index, course in enumerate(courses[:3]):
        reason_topic = topics[index % len(topics)]["topic"] if topics else course["category"]
        recs.append(
            {
                "id": course["id"],
                "title": course["title"],
                "image": course.get("image"),
                "thumbnail": course.get("thumbnail"),
                "match": f"{94 - (index * 4)}% AI Match",
                "category": course["category"],
                "reason": f"Suggested to improve: {reason_topic}",
            }
        )
    return recs


def search_all(query: str) -> list[dict[str, Any]]:
    q = query.strip().lower()
    if not q:
        return []
    results: list[dict[str, Any]] = []
    courses = list_courses()
    for course in courses:
        haystack = f"{course.get('title', '')} {course.get('description', '')} {course.get('category', '')}".lower()
        if q in haystack:
            score = 82 if q in course.get("title", "").lower() else 74
            results.append(
                {
                    "id": course["id"],
                    "title": course["title"],
                    "type": "course",
                    "description": course.get("description", ""),
                    "match": score,
                }
            )

    with _LOCK:
        state = _load_unlocked()
        for note in state["notes"]:
            haystack = f"{note.get('topic', '')} {note.get('content', '')}".lower()
            if q in haystack:
                results.append(
                    {
                        "id": note["id"],
                        "title": note["topic"],
                        "type": "note",
                        "description": "Generated study note",
                        "match": 78,
                    }
                )
    return results[:10]


def get_settings(user_id: str) -> dict[str, Any]:
    with _LOCK:
        state = _load_unlocked()
        current = state["settings"].get(user_id)
        if not current:
            current = _default_settings()
            state["settings"][user_id] = current
            _save_unlocked(state)
        return deepcopy(current)


def save_settings(user_id: str, updates: dict[str, Any]) -> dict[str, Any]:
    allowed = {"notifications", "ragChunkSize", "emailDigest", "preferredLanguage"}
    with _LOCK:
        state = _load_unlocked()
        current = state["settings"].get(user_id, _default_settings())
        for key, value in updates.items():
            if key in allowed:
                current[key] = value
        state["settings"][user_id] = current
        _save_unlocked(state)
        return deepcopy(current)


def create_material(course_id: str, chapter_id: str, material_type: str, url: str, title: str) -> dict[str, Any]:
    material = {
        "id": f"mat-{uuid.uuid4().hex[:10]}",
        "courseId": course_id,
        "chapterId": chapter_id,
        "type": material_type,
        "url": url,
        "title": title,
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state.setdefault("materials", []).insert(0, material)
        _save_unlocked(state)
    return deepcopy(material)


def list_materials(course_id: str | None = None, chapter_id: str | None = None) -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        rows = list(state.get("materials", []))
    if course_id:
        rows = [row for row in rows if row.get("courseId") == course_id]
    if chapter_id:
        rows = [row for row in rows if row.get("chapterId") == chapter_id]
    return deepcopy(rows)


def save_chat_message(user_id: str, document_id: str, message: str, sender: str) -> dict[str, Any]:
    row = {
        "id": f"chat-{uuid.uuid4().hex[:10]}",
        "userId": user_id,
        "documentId": document_id,
        "message": message,
        "sender": sender,
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state.setdefault("chatHistory", []).insert(0, row)
        _save_unlocked(state)
    return deepcopy(row)


def list_chat_history(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        rows = [row for row in state.get("chatHistory", []) if row.get("userId") == user_id]
    return deepcopy(rows[:limit])


def create_notification(user_id: str, title: str, message: str, notification_type: str = "info") -> dict[str, Any]:
    row = {
        "id": f"ntf-{uuid.uuid4().hex[:10]}",
        "userId": user_id,
        "title": title.strip() or "Notification",
        "message": message.strip(),
        "type": notification_type,
        "read": False,
        "createdAt": _now_iso(),
    }
    with _LOCK:
        state = _load_unlocked()
        state.setdefault("notifications", []).insert(0, row)
        _save_unlocked(state)
    return deepcopy(row)


def list_notifications(user_id: str | None = None) -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        rows = list(state.get("notifications", []))
        if not rows:
            for course in state.get("courses", [])[:3]:
                rows.append(
                    {
                        "id": f"ntf-course-{course['id']}",
                        "userId": None,
                        "title": "Course available",
                        "message": course["title"],
                        "type": "course",
                        "read": False,
                        "createdAt": course.get("createdAt"),
                    }
                )
    if user_id:
        rows = [row for row in rows if row.get("userId") in {None, user_id}]
    rows.sort(key=lambda row: _parse_iso(row.get("createdAt")) or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    return deepcopy(rows)


def mark_notification_read(notification_id: str) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for row in state.setdefault("notifications", []):
            if row["id"] == notification_id:
                row["read"] = True
                _save_unlocked(state)
                return deepcopy(row)
    return None


def issue_certificate(user_id: str, title: str, course_id: str | None = None) -> dict[str, Any] | None:
    certificate = {
        "id": f"cert-{uuid.uuid4().hex[:10]}",
        "title": title.strip() or "Course Completion",
        "courseId": course_id,
        "date": _now_iso()[:10],
        "icon": "Award",
        "color": "primary",
    }
    with _LOCK:
        state = _load_unlocked()
        for user in state["users"]:
            if user["id"] == user_id:
                user.setdefault("certificates", []).insert(0, certificate)
                if "Certified" not in user.setdefault("badges", []):
                    user["badges"].append("Certified")
                _save_unlocked(state)
                return deepcopy(certificate)
    return None


def list_certificates(user_id: str) -> list[dict[str, Any]]:
    user = get_user_by_id(user_id)
    if not user:
        user = get_default_user("admin")
        
    certs = deepcopy(list(user.get("certificates", [])))
    enriched_certs = []
    
    student_name = user.get('name', 'Student')
    department = user.get('department', 'General')
    
    for cert in certs:
        cert['studentName'] = student_name
        cert['department'] = department
        
        course_id = cert.get('courseId')
        if course_id:
            course = get_course(course_id)
            if course:
                cert['courseName'] = course.get('title', 'Course')
                teacher_id = course.get('teacherId')
                if teacher_id:
                    teacher = get_user_by_id(teacher_id)
                    cert['instructorName'] = teacher.get('name', 'Admin') if teacher else 'Admin'
                else:
                    cert['instructorName'] = 'Admin'
            else:
                cert['courseName'] = 'Course'
                cert['instructorName'] = 'Admin'
        else:
            cert['courseName'] = cert.get('title', 'Course')
            cert['instructorName'] = 'Admin'
            
        enriched_certs.append(cert)
        
    return enriched_certs


def get_student_analytics(user_id: str) -> dict[str, Any]:
    user = get_user_by_id(user_id) or get_current_user()
    study_hours = list(user.get("studyHours", [0, 0, 0, 0, 0, 0, 0]))
    submissions = list_submissions(user["id"])
    graded_scores = [int(s["score"]) for s in submissions if isinstance(s.get("score"), int)]
    avg_score = int(sum(graded_scores) / len(graded_scores)) if graded_scores else 0
    
    enrollments = list_enrollments(user["id"])
    all_courses = {c["id"]: c for c in list_courses()}
    enrolled_courses = []
    for enr in enrollments:
        course = all_courses.get(enr["courseId"])
        if course:
            enrolled_courses.append({
                "id": course["id"],
                "title": course["title"],
                "progress": enr.get("progress", 0),
                "nextLesson": "Continue Learning", # Mocked next lesson
                "thumbnail": course.get("image", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485"),
            })
            
    stats = [
        {"label": "Courses Enrolled", "value": str(len(enrolled_courses)), "icon": "BookOpen"},
        {"label": "Hours Learned", "value": str(sum(study_hours)), "icon": "Clock", "trend": "This week"},
        {"label": "XP Earned", "value": str(user.get("xp", 0)), "icon": "TrendingUp"},
        {"label": "Learning Streak", "value": f"{user.get('streak', 0)} days", "icon": "Flame"},
    ]
    
    return {
        "student_id": user["id"],
        "xp": int(user.get("xp", 0)),
        "studyHours": study_hours,
        "study_hours": sum(study_hours),
        "quiz_performance": max(60, min(98, int(user.get("xp", 0) / 1200))),
        "assignment_score": avg_score,
        "enrolledCourses": enrolled_courses,
        "recommendedCourses": course_recommendations(user["id"]),
        "stats": stats,
        "weakTopics": [t["topic"] for t in weak_topics(user["id"])],
        "recentChats": list_chat_history(user["id"]),
        "certificates": list_certificates(user["id"]),
    }


def get_teacher_analytics(teacher_id: str) -> dict[str, Any]:
    courses = list_courses()
    teacher = get_user_by_id(teacher_id) or get_default_user("admin")
    owned = [course for course in courses if course.get("teacherId") == teacher["id"]]
    student_estimate = sum(int(course.get("studentsCount", 0)) for course in owned)
    completion = [int(course.get("progress", 0)) for course in owned] or [0]
    avg_completion = int(sum(completion) / len(completion))
    
    formatted_courses = []
    for course in owned:
        formatted_courses.append({
            "id": course["id"],
            "title": course["title"],
            "students": course.get("studentsCount", 0),
            "progress": course.get("progress", 0),
            "status": "published" if course.get("active") else "draft",
            "thumbnail": course.get("image", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485"),
        })
        
    stats = [
        {"label": "courses.myCourses", "value": str(len(owned)), "icon": "BookOpen", "change": "+2 this month"},
        {"label": "Students Enrolled", "value": str(student_estimate), "icon": "Users", "change": "+15 this week"},
        {"label": "Average Completion", "value": f"{avg_completion}%", "icon": "TrendingUp", "change": "This month"},
    ]
    
    # Mock recent submissions for the teacher dashboard based on students in the system
    submissions = list_submissions()
    recent_subs = []
    for sub in submissions[:5]:
        user = get_user_by_id(sub.get("userId"))
        recent_subs.append({
            "student": user.get("name", "Student") if user else "Student",
            "assignment": sub.get("title", "Assignment"),
            "score": sub.get("score", 0) or 0,
            "time": sub.get("submittedAt", "")[:10]
        })
        
    if not recent_subs:
        recent_subs = [
            {"student": "Alice Johnson", "assignment": "Python Basics", "score": 92, "time": "2026-06-25"},
            {"student": "Bob Smith", "assignment": "ML Intro", "score": 88, "time": "2026-06-26"},
        ]

    return {
        "teacher_id": teacher["id"],
        "active_courses": len(owned),
        "active_students": student_estimate,
        "average_completion_rate": avg_completion,
        "courses": formatted_courses,
        "recentSubmissions": recent_subs,
        "stats": stats
    }


def get_admin_analytics() -> dict[str, Any]:
    users = list_users()
    courses = list_courses()
    with _LOCK:
        state = _load_unlocked()
        notes = list(state.get("notes", []))
        submissions = list(state.get("submissions", []))
        chats = list(state.get("chatHistory", []))
        materials = list(state.get("materials", []))

    activity_rows: list[dict[str, Any]] = []
    for user in users:
        activity_rows.append(
            {
                "id": f"user-{user['id']}",
                "title": "User registered",
                "description": f"{user['name']} joined as {user['role']}",
                "type": "user",
                "createdAt": user.get("createdAt"),
            }
        )
    for course in courses:
        activity_rows.append(
            {
                "id": f"course-{course['id']}",
                "title": "Course updated",
                "description": course["title"],
                "type": "course",
                "createdAt": course.get("createdAt"),
            }
        )
    for material in materials:
        activity_rows.append(
            {
                "id": material["id"],
                "title": "Material added",
                "description": material.get("title", "Learning material"),
                "type": "material",
                "createdAt": material.get("createdAt"),
            }
        )
    for chat in chats:
        activity_rows.append(
            {
                "id": chat["id"],
                "title": "Tutor interaction",
                "description": str(chat.get("message", ""))[:120],
                "type": "ai",
                "createdAt": chat.get("createdAt"),
            }
        )

    activity_rows.sort(
        key=lambda row: _parse_iso(row.get("createdAt")) or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )

    today = datetime.now(timezone.utc).date()
    day_rows = []
    for offset in range(6, -1, -1):
        current_day = today - timedelta(days=offset)
        day_key = current_day.isoformat()
        day_activity = [
            row
            for row in [*notes, *submissions, *chats, *materials]
            if (_parse_iso(row.get("createdAt") or row.get("submittedAt")) or datetime.min.replace(tzinfo=timezone.utc)).date().isoformat()
            == day_key
        ]
        interaction_count = len(day_activity)
        token_estimate = sum(len(str(row).split()) for row in day_activity)
        day_rows.append(
            {
                "name": current_day.strftime("%a"),
                "date": day_key,
                "tokens": token_estimate,
                "interactions": interaction_count,
            }
        )

    categories: dict[str, dict[str, Any]] = {}
    for course in courses:
        key = course.get("category") or "General"
        current = categories.setdefault(key, {"category": key, "courses": 0, "students": 0, "avgProgress": 0})
        current["courses"] += 1
        current["students"] += int(course.get("studentsCount", 0))
        current["avgProgress"] += int(course.get("progress", 0))
    category_rows = []
    for row in categories.values():
        row["avgProgress"] = int(row["avgProgress"] / row["courses"]) if row["courses"] else 0
        category_rows.append(row)
    category_rows.sort(key=lambda row: (row["students"], row["courses"]), reverse=True)

    progress_values = [int(course.get("progress", 0)) for course in courses]
    avg_progress = int(sum(progress_values) / len(progress_values)) if progress_values else 0
    generated_content_count = len(notes) + len(submissions) + len(chats) + len(materials)
    active_users = len(users)
    uptime_score = 100 if active_users or courses else 0
    return {
        "active_users": active_users,
        "active_courses": len(courses),
        "active_teachers": len([user for user in users if user.get("role") == "teacher"]),
        "active_students": len([user for user in users if user.get("role") == "student"]),
        "ai_queries_today": generated_content_count,
        "platform_uptime": f"{uptime_score}%",
        "average_course_progress": avg_progress,
        "total_materials": len(materials),
        "total_submissions": len(submissions),
        "total_chats": len(chats),
        "ai_token_flow": day_rows,
        "category_breakdown": category_rows,
        "recent_activity": activity_rows[:6],
    }


def _system_admin_doc(existing: dict[str, Any] | None = None) -> dict[str, Any]:
    from utils.security import get_password_hash, verify_password

    password = (existing or {}).get("password") or (existing or {}).get("hashedPassword") or ""
    if not password.startswith("$2") or not verify_password(settings.DEFAULT_ADMIN_PASSWORD, password):
        password = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)

    return {
        "id": settings.DEFAULT_ADMIN_ID,
        "name": settings.DEFAULT_ADMIN_NAME,
        "email": settings.DEFAULT_ADMIN_EMAIL.lower(),
        "password": password,
        "role": "admin",
        "xp": int((existing or {}).get("xp", 0)),
        "streak": int((existing or {}).get("streak", 0)),
        "badges": list((existing or {}).get("badges", [])),
        "studyHours": list((existing or {}).get("studyHours", [0, 0, 0, 0, 0, 0, 0])),
        "weakTopics": list((existing or {}).get("weakTopics", [])),
        "certificates": list((existing or {}).get("certificates", [])),
        "active": True,
        "createdAt": (existing or {}).get("createdAt") or _now_iso(),
    }


def ensure_system_admin() -> dict[str, Any]:
    with _LOCK:
        state = _load_unlocked()
        users = state.setdefault("users", [])
        existing = next(
            (
                user for user in users
                if user.get("id") == settings.DEFAULT_ADMIN_ID
                or user.get("email", "").lower() == settings.DEFAULT_ADMIN_EMAIL.lower()
            ),
            None,
        )
        admin_user = _system_admin_doc(existing)
        if existing:
            existing.clear()
            existing.update(admin_user)
        else:
            users.insert(0, admin_user)
        state.setdefault("settings", {})[settings.DEFAULT_ADMIN_ID] = state.setdefault("settings", {}).get(
            settings.DEFAULT_ADMIN_ID,
            _default_settings(),
        )
        _save_unlocked(state)
        return _public_user(admin_user)


def purge_demo_data() -> dict[str, int]:
    with _LOCK:
        state = _load_unlocked()
        users = state.setdefault("users", [])
        existing_admin = next(
            (
                user for user in users
                if user.get("id") == settings.DEFAULT_ADMIN_ID
                or user.get("email", "").lower() == settings.DEFAULT_ADMIN_EMAIL.lower()
            ),
            None,
        )
        admin_user = _system_admin_doc(existing_admin)
        deleted = {
            "users": max(0, len(users) - 1),
            "courses": len(state.get("courses", [])),
            "categories": len(state.get("categories", [])),
            "enrollments": len(state.get("enrollments", [])),
            "assignments": len(state.get("assignments", [])),
            "submissions": len(state.get("submissions", [])),
            "materials": len(state.get("materials", [])),
            "chatHistory": len(state.get("chatHistory", [])),
            "notifications": len(state.get("notifications", [])),
            "notes": len(state.get("notes", [])),
            "flashcards": len(state.get("flashcards", [])),
            "quiz_submissions": len(state.get("quiz_submissions", [])),
            "settings": max(0, len(state.get("settings", {})) - 1),
        }
        state.update(
            {
                "users": [admin_user],
                "courses": [],
                "categories": [],
                "enrollments": [],
                "assignments": [],
                "submissions": [],
                "materials": [],
                "chatHistory": [],
                "notifications": [],
                "notes": [],
                "flashcards": [],
                "quiz_submissions": [],
                "settings": {settings.DEFAULT_ADMIN_ID: _default_settings()},
            }
        )
        _save_unlocked(state)
        return deleted



def get_teacher_students(teacher_id: str) -> list[dict[str, Any]]:
    # Simplified implementation based on monolithic JSON state
    courses = [c for c in list_courses() if c.get('teacherId') == teacher_id]
    course_ids = {c['id'] for c in courses}
    with _LOCK:
        state = _load_unlocked()
        enrollments = state.get('enrollments', [])
        users = state.get('users', [])
        
    student_ids = {e['userId'] for e in enrollments if e['courseId'] in course_ids}
    students = [u for u in users if u['id'] in student_ids]
    return [_public_user(s) for s in students]

def admin_create_user(email: str, name: str, role: str) -> dict[str, Any]:
    from utils.security import get_password_hash
    with _LOCK:
        state = _load_unlocked()
        users = state.setdefault('users', [])
        # Check if exists
        for u in users:
            if u.get('email') == email:
                return _public_user(u)
        
        new_user = {
            'id': f'user-{uuid.uuid4().hex[:8]}',
            'email': email,
            'name': name,
            'role': role,
            'password': get_password_hash('Password@123'),
            'createdAt': _now_iso(),
            'department': 'General'
        }
        users.append(new_user)
        _save_unlocked(state)
        return _public_user(new_user)



def issue_course_certificate(user_id: str, course_id: str, score: int) -> dict[str, Any] | None:
    if score < 75: return None
    course = get_course(course_id)
    if not course: return None
    return issue_certificate(user_id, f"Completion: {course.get('title', 'Course')}", course_id)

def record_quiz_submission(user_id: str, course_id: str, score: int) -> dict[str, Any]:
    doc = {
        'id': f'qs-{uuid.uuid4().hex[:8]}',
        'userId': user_id,
        'courseId': course_id,
        'score': score,
        'submittedAt': _now_iso()
    }
    with _LOCK:
        state = _load_unlocked()
        state.setdefault('quiz_submissions', []).append(doc)
        _save_unlocked(state)
        
    if score >= 50:
        award_xp(user_id, score * 2)
        
    return doc

def get_student_analytics_results(user_id: str) -> dict[str, Any]:
    with _LOCK:
        state = _load_unlocked()
        quizzes = [q for q in state.get('quiz_submissions', []) if q.get('userId') == user_id]
        assignments = [a for a in state.get('submissions', []) if a.get('userId') == user_id]
    
    total_quizzes = len(quizzes)
    assignments_submitted = len(assignments)
    
    total_score = sum(q.get('score', 0) for q in quizzes)
    graded_assignments = [a for a in assignments if a.get('score') is not None]
    total_score += sum(a.get('score', 0) for a in graded_assignments)
    
    total_graded = total_quizzes + len(graded_assignments)
    avg_score = int(total_score / total_graded) if total_graded > 0 else 0
    
    recent = []
    for i, q in enumerate(sorted(quizzes, key=lambda x: x.get('submittedAt', ''), reverse=True)[:5]):
        recent.append({'name': f'Quiz {i+1}', 'score': q.get('score', 0), 'date': q.get('submittedAt')})
        
    for i, a in enumerate(sorted(graded_assignments, key=lambda x: x.get('submittedAt', ''), reverse=True)[:5]):
        recent.append({'name': f'Assign {i+1}', 'score': a.get('score', 0), 'date': a.get('submittedAt')})
        
    recent = sorted(recent, key=lambda x: x.get('date', ''), reverse=True)[:5]
    
    user_stats = get_user_stats(user_id)
    
    return {
        'overview': {
            'averageScore': avg_score,
            'totalQuizzes': total_quizzes,
            'assignmentsSubmitted': assignments_submitted,
            'learningHours': user_stats.get('studyHours', 0)
        },
        'recentScores': recent
    }



def grade_submission(submission_id: str, score: int, feedback: str) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for sub in state.get('submissions', []):
            if sub.get('id') == submission_id:
                sub['score'] = score
                sub['feedback'] = feedback
                _save_unlocked(state)
                return sub
        return None

def list_all_enrollments() -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        return deepcopy(list(state.get('enrollments', [])))

def delete_enrollment(enrollment_id: str) -> bool:
    with _LOCK:
        state = _load_unlocked()
        original_len = len(state.get('enrollments', []))
        state['enrollments'] = [e for e in state.get('enrollments', []) if e.get('id') != enrollment_id]
        if len(state['enrollments']) != original_len:
            _save_unlocked(state)
            return True
        return False

def list_categories() -> list[dict[str, Any]]:
    with _LOCK:
        state = _load_unlocked()
        return deepcopy(list(state.get('categories', [])))

def create_category(category: dict[str, Any]) -> dict[str, Any]:
    doc = deepcopy(category)
    doc['id'] = f'cat-{uuid.uuid4().hex[:8]}'
    with _LOCK:
        state = _load_unlocked()
        state.setdefault('categories', []).append(doc)
        _save_unlocked(state)
        return doc

def update_category(category_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    with _LOCK:
        state = _load_unlocked()
        for cat in state.get('categories', []):
            if cat.get('id') == category_id:
                cat.update(updates)
                _save_unlocked(state)
                return cat
        return None

def delete_category(category_id: str) -> bool:
    with _LOCK:
        state = _load_unlocked()
        original_len = len(state.get('categories', []))
        state['categories'] = [c for c in state.get('categories', []) if c.get('id') != category_id]
        if len(state['categories']) != original_len:
            _save_unlocked(state)
            return True
        return False

