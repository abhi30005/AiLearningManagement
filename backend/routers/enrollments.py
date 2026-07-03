from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from state_store import list_all_enrollments, delete_enrollment, list_enrollments, get_course, enroll_user_in_course

router = APIRouter(prefix="/enrollments", tags=["Enrollments Management"])

class EnrollRequest(BaseModel):
    userId: str
    courseId: str

@router.post("/")
async def create_enrollment(req: EnrollRequest):
    enrollment = enroll_user_in_course(req.userId, req.courseId)
    if not enrollment:
        raise HTTPException(status_code=400, detail="Could not enroll user")
    return {"enrollment": enrollment}

@router.get("/")
async def get_enrollments():
    return {"enrollments": list_all_enrollments()}

@router.get("/user/{user_id}")
async def get_user_enrollments(user_id: str):
    enrollments = list_enrollments(user_id=user_id)
    result = []
    for enr in enrollments:
        course = get_course(enr['courseId'])
        if course:
            enr['course'] = course
            result.append(enr)
    return {"enrollments": result}

@router.delete("/{enrollment_id}")
async def remove_enrollment(enrollment_id: str):
    success = delete_enrollment(enrollment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"success": True}
