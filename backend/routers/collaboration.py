from fastapi import APIRouter, WebSocket, Depends
from pydantic import BaseModel
from utils.security import rate_limiter

router = APIRouter(prefix="/collaboration", tags=["Collaborative Whiteboard"], dependencies=[Depends(rate_limiter)])

class DiagramRequest(BaseModel):
    prompt: str

@router.websocket("/ws/{session_id}")
async def whiteboard_websocket(websocket: WebSocket, session_id: str):
    """
    Real-Time Collaboration WebSocket endpoint.
    Handles drawing tools, sticky notes, annotations.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except Exception as e:
        print(f"Error: {e}")

@router.post("/export/{session_id}")
async def export_whiteboard(session_id: str):
    """Export PDF/Image of the whiteboard"""
    return {"url": "https://example.com/export.pdf"}

# --- AI DIAGRAM GENERATION ---

@router.post("/ai-diagram")
async def generate_ai_diagram(data: DiagramRequest):
    """
    AI Diagram Generation.
    Generates Mermaid.js diagram markup based on text description prompts.
    """
    # Mocks a generated flow diagram
    return {
        "prompt": data.prompt,
        "mermaid_markup": "graph TD\n    A[Start] --> B(Extract PDF)\n    B --> C{Generate Embeddings}\n    C --> D[ChromaDB]"
    }
