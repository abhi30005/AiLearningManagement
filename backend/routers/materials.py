from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

from state_store import create_material, list_materials

router = APIRouter(prefix="/materials", tags=["Learning Resources"])

class YoutubeLinkRequest(BaseModel):
    url: str

class DriveLinkRequest(BaseModel):
    url: str

class ImageLinkRequest(BaseModel):
    url: str
    title: str = "Image Resource"

@router.get("", include_in_schema=False)
@router.get("/")
async def get_materials(course_id: str | None = None, chapter_id: str | None = None):
    return {"materials": list_materials(course_id=course_id, chapter_id=chapter_id)}


@router.post("/upload-pdf")
async def upload_pdf(course_id: str, chapter_id: str, file: UploadFile = File(...)):
    """Upload PDFs to a specific chapter"""
    material = create_material(
        chapter_id=chapter_id,
        course_id=course_id,
        material_type="pdf",
        url=f"/uploads/{file.filename}",
        title=file.filename,
    )
    return {"success": True, "message": f"File {file.filename} uploaded successfully.", "material": material}

@router.post("/add-youtube")
async def add_youtube_video(course_id: str, chapter_id: str, data: YoutubeLinkRequest):
    """Add YouTube video links"""
    material = create_material(
        chapter_id=chapter_id,
        course_id=course_id,
        material_type="youtube",
        url=data.url,
        title="YouTube Video",
    )
    return {"success": True, "message": "YouTube video added.", "material": material}

@router.post("/add-drive-pdf")
async def add_drive_pdf(course_id: str, chapter_id: str, data: DriveLinkRequest):
    """Add Google Drive PDF Link"""
    material = create_material(
        chapter_id=chapter_id,
        course_id=course_id,
        material_type="drive",
        url=data.url,
        title="Drive PDF",
    )
    return {"success": True, "message": "Google Drive link added.", "material": material}

@router.post("/add-image")
async def add_image_resource(course_id: str, chapter_id: str, data: ImageLinkRequest):
    """Add image links for chapter resources"""
    material = create_material(
        chapter_id=chapter_id,
        course_id=course_id,
        material_type="image",
        url=data.url,
        title=data.title or "Image Resource",
    )
    return {"success": True, "message": "Image resource added.", "material": material}

@router.post("/upload-image")
async def upload_image(course_id: str, chapter_id: str, file: UploadFile = File(...)):
    """Register uploaded images for chapter resources"""
    material = create_material(
        chapter_id=chapter_id,
        course_id=course_id,
        material_type="image",
        url=f"/uploads/{file.filename}",
        title=file.filename,
    )
    return {"success": True, "message": f"Image {file.filename} uploaded successfully.", "material": material}
