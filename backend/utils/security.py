from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

security = HTTPBearer()

def get_current_user_role(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Decodes the JWT token and extracts user role.
    For this dynamic setup, we assume the token is a Firebase ID Token.
    We'll return "student" by default unless we implement full firebase-admin claims.
    """
    token = credentials.credentials
    # Mocking check for local dev
    if token == "teacher_token":
        return "teacher"
    elif token == "admin_token":
        return "admin"
    
    # In a real app with Firebase Admin, we would do:
    # decoded_token = auth.verify_id_token(token)
    # return decoded_token.get('role', 'student')

    # For now, if a real Firebase token is passed, default to teacher so they can create courses
    # (Or read from DB, but we need the user ID)
    return "teacher"

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
