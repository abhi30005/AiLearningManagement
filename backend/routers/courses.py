from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from state_store import (
    add_chapter_module,
    add_course_chapter,
    create_course,
    delete_course,
    enroll_user_in_course,
    get_course,
    get_default_user_id,
    list_chapter_modules,
    list_courses,
    list_enrollments,
    update_course_progress,
    update_course as update_course_record,
)


router = APIRouter(prefix="/courses", tags=["Course Management"])


class CourseCreateReq(BaseModel):
    title: str
    description: str = ""
    category: str = "General"
    level: str = "beginner"
    language: str = "en"
    thumbnail: Optional[str] = None
    image: Optional[str] = None
    teacher_id: Optional[str] = None


class CourseUpdateReq(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    weeks: Optional[int] = None
    progress: Optional[int] = None
    active: Optional[bool] = None
    teacherId: Optional[str] = None
    language: Optional[str] = None
    thumbnail: Optional[str] = None
    image: Optional[str] = None
    chapters: Optional[list[dict]] = None


class ChapterCreateReq(BaseModel):
    title: str


class ModuleCreateReq(BaseModel):
    title: str
    completed: bool = False
    hasPdf: bool = False
    url: Optional[str] = None
    type: Optional[str] = None


class EnrollmentReq(BaseModel):
    userId: Optional[str] = None


class ProgressReq(BaseModel):
    userId: Optional[str] = None
    progress: int


@router.get("/")
async def get_courses():
    return list_courses()

@router.get("/teacher/{teacher_id}")
async def get_teacher_courses(teacher_id: str):
    courses = list_courses()
    return [c for c in courses if c.get("teacherId") == teacher_id]


@router.post("/")
async def post_course(req: CourseCreateReq):
    course = create_course(
        title=req.title,
        description=req.description,
        category=req.category,
        teacher_id=req.teacher_id,
        thumbnail=req.thumbnail or req.image,
        level=req.level,
        language=req.language,
    )
    return {"success": True, "course": course}


@router.get("/{course_id}")
async def get_course_detail(course_id: str):
    course = get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/{course_id}/enroll")
async def enroll_course(course_id: str, req: EnrollmentReq):
    enrollment = enroll_user_in_course(req.userId or get_default_user_id("admin"), course_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"success": True, "enrollment": enrollment}


@router.get("/{course_id}/enrollments")
async def course_enrollments(course_id: str):
    if not get_course(course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    return {"enrollments": list_enrollments(course_id=course_id)}


@router.put("/{course_id}/progress")
async def update_progress(course_id: str, req: ProgressReq):
    enrollment = update_course_progress(req.userId or get_default_user_id("admin"), course_id, req.progress)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"success": True, "enrollment": enrollment}


@router.put("/{course_id}")
async def update_course(course_id: str, req: CourseUpdateReq):
    if not get_course(course_id):
        raise HTTPException(status_code=404, detail="Course not found")

    updates = req.model_dump(exclude_none=True)
    if not updates:
        return {"success": True, "course": get_course(course_id)}
    updated = update_course_record(course_id, updates)
    return {"success": True, "course": updated}


@router.delete("/{course_id}")
async def remove_course(course_id: str):
    deleted = delete_course(course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"success": True}


@router.post("/{course_id}/chapters")
async def add_chapter(course_id: str, req: ChapterCreateReq):
    if not get_course(course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    chapter = add_course_chapter(course_id, req.title)
    if not chapter:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"success": True, "chapter": chapter}


@router.post("/{course_id}/chapters/{chapter_id}/modules")
async def add_module(course_id: str, chapter_id: str, req: ModuleCreateReq):
    module = add_chapter_module(course_id, chapter_id, req.title, req.completed, req.hasPdf, req.url, req.type)
    if not module:
        raise HTTPException(status_code=404, detail="Course or chapter not found")
    return {"success": True, "module": module}


@router.get("/{course_id}/chapters/{chapter_id}/modules")
async def list_modules(course_id: str, chapter_id: str):
    modules = list_chapter_modules(course_id, chapter_id)
    if modules is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return {"modules": modules}

@router.delete("/{course_id}/chapters/{chapter_id}/modules/{module_id}")
async def delete_module(course_id: str, chapter_id: str, module_id: str):
    from database import get_collection
    result = get_collection('courses').update_one(
        {'id': course_id, 'chapters.id': chapter_id},
        {'$pull': {'chapters.$.modules': {'id': module_id}}}
    )
    if result.modified_count > 0:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Module not found")
