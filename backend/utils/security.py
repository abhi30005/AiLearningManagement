from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

security = HTTPBearer()

def get_current_user_role(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Decodes the JWT token and extracts user role.
    This mock assumes the token itself contains the role.
    For production, parse Firebase or custom JWT token.
    """
    token = credentials.credentials
    # Mocking check: token 'teacher' acts as teacher, 'admin' as admin, otherwise student
    if token == "teacher_token":
        return "teacher"
    elif token == "admin_token":
        return "admin"
    return "student"

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, role: str = Security(get_current_user_role)):
        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return role

def require_role(roles: List[str]):
    return RoleChecker(roles)

async def rate_limiter():
    """
    Simple API Rate Limiting simulator.
    In production, use slowapi (Redis) or custom middleware.
    """
    # Mocks rate limiter success
    return True
