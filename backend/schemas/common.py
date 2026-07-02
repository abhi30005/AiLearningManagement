from pydantic import BaseModel
from typing import Optional

class GenericResponse(BaseModel):
    message: str
    success: bool = True
