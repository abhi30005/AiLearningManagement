from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from state_store import list_categories, create_category, update_category, delete_category

router = APIRouter(prefix="/categories", tags=["Categories Management"])

class CategoryCreateReq(BaseModel):
    name: str
    slug: str
    description: str = ""
    icon: str = "📁"

class CategoryUpdateReq(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

@router.get("/")
async def get_categories():
    return {"categories": list_categories()}

@router.post("/")
async def post_category(req: CategoryCreateReq):
    cat = create_category(
        name=req.name,
        slug=req.slug,
        description=req.description,
        icon=req.icon,
    )
    return {"success": True, "category": cat}

@router.put("/{category_id}")
async def put_category(category_id: str, req: CategoryUpdateReq):
    updates = req.model_dump(exclude_none=True)
    if not updates:
        return {"success": True}
    updated = update_category(category_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True, "category": updated}

@router.delete("/{category_id}")
async def remove_category(category_id: str):
    success = delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}
