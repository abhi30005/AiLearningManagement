import re

with open('routers/tutor.py', 'r') as f:
    text = f.read()

new_chat_with_tutor = """@router.post("/chat")
async def chat_with_tutor(data: ChatRequest):
    \"\"\"
    Chat with RAG context (Multi-Language).
    Semantic Search and Context-Aware Retrieval.
    \"\"\"
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
        f"You are an expert AI tutor. Respond in {data.language}. "
        "You must answer ANY type of question the student asks.\\n\\n"
        "CRITICAL INSTRUCTIONS:\\n"
        "1. Always structure your response well with bullet points, headers, or numbered lists.\\n"
        "2. Keep your answers concise: short to medium length (never too large).\\n"
        "3. Provide a clear, direct answer, followed by an example if applicable.\\n"
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
            f"I reviewed your question: \\\"{data.message}\\\". "
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
"""

text = re.sub(r'@router\.post\("/chat"\).*?(?=@router\.get\("/history/\{user_id\}"\))', new_chat_with_tutor + '\n', text, flags=re.DOTALL)

with open('routers/tutor.py', 'w') as f:
    f.write(text)
