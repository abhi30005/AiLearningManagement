from fastapi import APIRouter
from pydantic import BaseModel

from state_store import search_all


router = APIRouter(prefix="/search", tags=["AI Search"])


class SearchRequest(BaseModel):
    query: str


@router.post("/")
async def semantic_search(req: SearchRequest):
    return {"results": search_all(req.query)}


@router.get("/")
async def semantic_search_get(q: str = ""):
    return {"results": search_all(q)}

