from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from state_store import list_all_enrollments, delete_enrollment, list_enrollments, get_course, enroll_user_in_course, get_user_by_id

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
    enrollments = list_all_enrollments()
    result = []
    for enr in enrollments:
        user = get_user_by_id(enr['userId'])
        course = get_course(enr['courseId'])
        enr['userName'] = user['name'] if user else enr['userId']
        enr['userEmail'] = user['email'] if user else 'N/A'
        enr['courseTitle'] = course['title'] if course else enr['courseId']
        enr['enrolledAt'] = enr.get('createdAt')
        result.append(enr)
    return {"enrollments": result}

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
