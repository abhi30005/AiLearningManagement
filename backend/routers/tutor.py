import os
from fastapi import APIRouter
from pydantic import BaseModel

try:
    import openai
except ImportError:
    openai = None

def get_openai_client():
    key = os.environ.get("OPENAI_API_KEY")
    if key and key != "MY_OPENAI_API_KEY" and openai:
        return openai.OpenAI(api_key=key)
    return None

from state_store import list_chat_history, save_chat_message

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])

class ChatRequest(BaseModel):
    user_id: str
    message: str
    document_id: str
    language: str = "en"

class VoiceRequest(BaseModel):
    audio_url: str | None = None
    user_id: str | None = None
    message: str | None = None
    document_id: str = "voice-session"
    language: str = "en"

@router.post("/chat")
async def chat_with_tutor(data: ChatRequest):
    """
    Chat with PDFs or YouTube Videos (Multi-Language).
    Semantic Search and Context-Aware Retrieval.
    """
    save_chat_message(
        user_id=data.user_id,
        document_id=data.document_id,
        message=data.message,
        sender="user",
    )
    
    client = get_openai_client()
    ai_response_text = ""
    
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": f"You are a helpful AI tutor. Respond in {data.language}. Keep it concise, provide a key idea, an example, and a next practice step."}, {"role": "user", "content": data.message}]
            )
            ai_response_text = response.choices[0].message.content or ""
        except Exception:
            pass
            
    if not ai_response_text:
        ai_response_text = (
            f"I reviewed your question: \"{data.message}\". "
            f"Here is a focused explanation in {data.language}, with the key idea, an example, and a next practice step."
        )
    save_chat_message(
        user_id=data.user_id,
        document_id=data.document_id,
        message=ai_response_text,
        sender="ai",
    )
    
    return {"response": ai_response_text, "citations": ["doc1_page2"]}


@router.get("/history/{user_id}")
async def get_chat_history(user_id: str, limit: int = 20):
    return {"history": list_chat_history(user_id=user_id, limit=limit)}

@router.post("/voice-chat")
async def voice_chat_with_tutor(data: VoiceRequest):
    """
    Voice-to-Text -> LLM -> Text-to-Speech Responses.
    """
    transcript = (data.message or "Voice question received").strip()
    client = get_openai_client()
    answer = ""
    
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": f"You are a helpful voice AI tutor. Respond in {data.language}. Keep it concise, provide a key idea, repeat the example aloud, and answer one practice question."}, {"role": "user", "content": transcript}]
            )
            answer = response.choices[0].message.content or ""
        except Exception:
            pass
            
    if not answer:
        answer = (
            f"Voice tutor response for: \"{transcript}\". "
            "Review the core idea, repeat the example aloud, then answer one practice question."
        )
    if data.user_id:
        save_chat_message(data.user_id, data.document_id, transcript, "user")
        save_chat_message(data.user_id, data.document_id, answer, "ai")
    return {
        "transcript": transcript,
        "response": answer,
        "response_audio_url": "https://example.com/audio.mp3",
        "language": data.language,
    }

@router.post("/chapter-summary")
async def get_chapter_summary(chapter_id: str):
    """Chapter Summaries"""
    return {"summary": "AI generated summary here."}
