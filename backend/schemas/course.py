from pydantic import BaseModel
from typing import List, Optional

class ModuleBase(BaseModel):
    title: str
    content: Optional[str] = None
    type: str # video, pdf, drive
    order: Optional[int] = 0

class ModuleCreate(ModuleBase):
    pass

class ModuleResponse(ModuleBase):
    id: str
    chapter_id: str

    class Config:
        from_attributes = True

class ChapterBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: Optional[int] = 0

class ChapterCreate(ChapterBase):
    pass

class ChapterResponse(ChapterBase):
    id: str
    course_id: str
    modules: List[ModuleResponse] = []

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: str
    category: str

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: str
    teacher_id: str
    chapters: List[ChapterResponse] = []

    class Config:
        from_attributes = True
