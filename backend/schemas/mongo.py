from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, timezone

def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

class MongoBase(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    createdAt: str = Field(default_factory=_now_iso)
    
    class Config:
        populate_by_name = True
        extra = "allow" # allow extra fields during migration

class UserMongo(MongoBase):
    email: str
    password: Optional[str] = None
    name: str
    role: str = "student"
    xp: int = 0
    streak: int = 0
    badges: List[str] = []
    studyHours: List[int] = [0, 0, 0, 0, 0, 0, 0]
    weakTopics: List[str] = []
    certificates: List[Dict[str, Any]] = []
    active: bool = True
    settings: Optional[Dict[str, Any]] = None

class ModuleMongo(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    completed: bool = False
    hasPdf: bool = False
    url: Optional[str] = None
    type: Optional[str] = None
    content: Optional[str] = None

class ChapterMongo(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    title: str
    modules: List[ModuleMongo] = []

class CourseMongo(MongoBase):
    title: str
    description: str
    category: str
    level: str = "beginner"
    language: str = "en"
    studentsCount: int = 0
    weeks: int = 4
    progress: int = 0
    active: bool = True
    image: Optional[str] = None
    thumbnail: Optional[str] = None
    teacherId: Optional[str] = None
    chapters: List[ChapterMongo] = []

class CategoryMongo(MongoBase):
    name: str
    slug: str
    icon: Optional[str] = None
    color: Optional[str] = None
    courseCount: int = 0

class EnrollmentMongo(MongoBase):
    userId: str
    courseId: str
    progress: int = 0
    lessonsCompleted: List[str] = []
    lastAccessed: Optional[str] = None

class AssignmentMongo(MongoBase):
    courseId: str
    title: str
    description: str
    dueDate: str
    totalPoints: int = 100

class SubmissionMongo(MongoBase):
    assignmentId: str
    userId: str
    content: str
    score: Optional[int] = None
    feedback: Optional[str] = None

class MaterialMongo(MongoBase):
    title: str
    url: str
    type: str # 'pdf', 'youtube', 'drive'
    courseId: Optional[str] = None
    size: Optional[str] = None
    uploadedBy: Optional[str] = None

class ChatMessageMongo(BaseModel):
    role: str
    content: str
    timestamp: str = Field(default_factory=_now_iso)

class ChatHistoryMongo(MongoBase):
    userId: str
    documentId: str
    messages: List[ChatMessageMongo] = []

class NotificationMongo(MongoBase):
    userId: str
    title: str
    message: str
    read: bool = False
    type: str = "info"

class NoteMongo(MongoBase):
    userId: str
    title: str
    content: str
    courseId: Optional[str] = None

class FlashcardItemMongo(BaseModel):
    front: str
    back: str

class FlashcardDeckMongo(MongoBase):
    userId: str
    title: str
    cards: List[FlashcardItemMongo] = []
    courseId: Optional[str] = None

class QuizSubmissionMongo(MongoBase):
    userId: str
    quizId: str
    courseId: Optional[str] = None
    score: int
    total: int
    answers: Dict[str, Any] = {}
