import os

from fastapi import APIRouter
from pydantic import BaseModel

try:
    import openai
except ImportError:
    openai = None


router = APIRouter(prefix="/rag", tags=["AI Knowledge Base (RAG)"])


class QueryRequest(BaseModel):
    query: str
    courseId: str = "default"


class SummarizeRequest(BaseModel):
    chapterId: str = "default"


class ExtractPdfRequest(BaseModel):
    courseId: str = "default"
    fileName: str = "uploaded.pdf"


class ExtractYoutubeRequest(BaseModel):
    url: str
    courseId: str = "default"


class EmbeddingsRequest(BaseModel):
    courseId: str = "default"
    text: str = ""


def get_openai_client():
    key = os.environ.get("OPENAI_API_KEY")
    if key and key != "MY_OPENAI_API_KEY" and openai:
        return openai.OpenAI(api_key=key)
    return None


@router.post("/query")
async def rag_query(req: QueryRequest):
    citations = [
        {"title": "Course Introduction", "url": "#", "snippet": "Overview of the primary components."},
        {"title": "Advanced Methods", "url": "#", "snippet": "Detailed methodology for applying these concepts."},
    ]

    client = get_openai_client()
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f"You are an AI Tutor for course ID {req.courseId}. Answer this student question concisely: {req.query}"}],
            )
            return {"answer": response.choices[0].message.content, "citations": citations}
        except Exception:
            pass

    return {
        "answer": f"I see you asked about '{req.query}'. Here is a concise simulated RAG answer.",
        "citations": citations,
    }


@router.post("/summarize-chapter")
async def summarize_chapter(req: SummarizeRequest):
    client = get_openai_client()
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": f"Provide a concise bullet-point summary for chapter ID {req.chapterId}."}]
            )
            return {"summary": response.choices[0].message.content}
        except Exception:
            pass

    return {"summary": "- Simulated summary point 1\n- Simulated summary point 2\n- Simulated summary point 3"}


@router.post("/extract-pdf")
async def extract_pdf(req: ExtractPdfRequest):
    return {
        "success": True,
        "courseId": req.courseId,
        "fileName": req.fileName,
        "chunks": [
            {"id": "chunk-1", "text": "Extracted PDF introduction text."},
            {"id": "chunk-2", "text": "Extracted PDF key concept text."},
        ],
    }


@router.post("/extract-youtube")
async def extract_youtube(req: ExtractYoutubeRequest):
    return {
        "success": True,
        "courseId": req.courseId,
        "url": req.url,
        "transcript": "Simulated transcript extracted from the supplied YouTube URL.",
    }


@router.post("/generate-embeddings")
async def generate_embeddings(req: EmbeddingsRequest):
    source_text = req.text.strip() or "default course knowledge"
    return {
        "success": True,
        "courseId": req.courseId,
        "chunksIndexed": max(1, len(source_text.split()) // 20),
        "vectorStore": "mongodb-metadata-plus-chromadb-compatible",
    }
