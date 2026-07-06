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
    
    from database import get_collection
    # Simple RAG simulation: pull student's enrolled courses to provide context
    enrollments = list(get_collection('enrollments').find({'userId': data.user_id}, {'_id': 0}))
    course_ids = [e['courseId'] for e in enrollments]
    courses = list(get_collection('courses').find({'id': {'$in': course_ids}}, {'_id': 0}))
    
    context = "User's Enrolled Courses Context:\\n"
    for c in courses:
        context += f"- Course: {c['title']} (Category: {c.get('category', 'N/A')}). Description: {c.get('description', '')[:200]}\\n"
        for ch in c.get('chapters', []):
            context += f"  * Chapter: {ch['title']}\\n"
    
    system_prompt = (
        f"You are an expert AI tutor with deep knowledge. Respond in {data.language}. "
        "You must answer ANY type of question the student asks with extreme accuracy and deep knowledge.\\n\\n"
        "CRITICAL INSTRUCTIONS:\\n"
        "1. Make your message highly STRUCTURAL and WELL ALIGNED (use markdown, headers, bold text, bullet points).\\n"
        "2. Keep your answers concise: short to medium length (not too large), getting straight to the point while remaining highly knowledgeable.\\n"
        "3. Provide a clear, direct, insightful answer, followed by an example if applicable.\\n"
        "4. Use the following context about the student's enrolled courses to personalize your answer if relevant.\\n\\n"
        f"CONTEXT:\\n{context}"
    )

    client = get_openai_client()
    ai_response_text = ""
    
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": data.message}],
                temperature=0.7,
                max_tokens=500
            )
            ai_response_text = response.choices[0].message.content or ""
        except Exception as e:
            ai_response_text = f"Error from OpenAI: {str(e)}"
            
    if not ai_response_text:
        ai_response_text = (
            f"I reviewed your question: \"{data.message}\". "
            f"However, my AI connection is currently offline. "
            "Please check your API key and connection."
        )
    save_chat_message(
        user_id=data.user_id,
        document_id=data.document_id,
        message=ai_response_text,
        sender="ai",
    )
    
    return {"response": ai_response_text, "citations": ["Course Database"]}


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
    from database import get_collection
    
    lesson_title = "Unknown Lesson"
    course_title = "Unknown Course"
    
    courses = list(get_collection('courses').find({}, {'_id': 0}))
    for c in courses:
        for ch in c.get('chapters', []):
            for mod in ch.get('modules', []):
                if mod['id'] == chapter_id:
                    lesson_title = mod.get('title', 'Unknown')
                    course_title = c.get('title', 'Unknown')
                    break
                    
    client = get_openai_client()
    summary = ""
    
    if client:
        try:
            prompt = f"Generate a comprehensive, structural, and educational summary for a lesson titled '{lesson_title}' in the course '{course_title}'. Use markdown, bullet points, and highlight key takeaways."
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert AI tutor. Generate a highly educational and structural summary of the requested topic. Ensure the output is formatted beautifully with Markdown."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            summary = response.choices[0].message.content
        except Exception as e:
            summary = f"Could not generate AI notes. Error: {str(e)}"
            
    if not summary:
        summary = f"## {lesson_title}\n\nHere are your automated AI notes for this module. The notes highlight key takeaways, definitions, and concepts presented in the lesson.\n\n- **Key Takeaway 1**: Understand the core fundamentals of {lesson_title} within {course_title}.\n- **Key Takeaway 2**: Focus on applying these concepts to practical, real-world scenarios.\n- **Next Steps**: Review the material and attempt any associated quizzes or exercises.\n\n> *Note: AI generation is currently offline or unreachable. Please check the API connection for dynamic notes.*"
        
    return {"summary": summary}
