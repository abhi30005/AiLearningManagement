code = """

def mark_lesson_completed(user_id: str, course_id: str, lesson_id: str) -> dict[str, Any] | None:
    get_collection('enrollments').update_one(
        {'userId': user_id, 'courseId': course_id},
        {'$addToSet': {'lessonsCompleted': lesson_id}}
    )
    return get_collection('enrollments').find_one({'userId': user_id, 'courseId': course_id}, {'_id': 0})

def _system_admin_doc(existing: dict[str, Any] | None=None) -> dict[str, Any]:
    from utils.security import get_password_hash
    return {
        'id': getattr(settings, 'DEFAULT_ADMIN_ID', 'admin-1'),
        'email': getattr(settings, 'DEFAULT_ADMIN_EMAIL', 'admin@eduai.edu').lower(),
        'name': getattr(settings, 'DEFAULT_ADMIN_NAME', 'Platform Admin'),
        'role': 'admin',
        'password': get_password_hash(getattr(settings, 'DEFAULT_ADMIN_PASSWORD', 'admin123')),
        'active': True,
        'createdAt': _now_iso()
    }

def ensure_system_admin() -> dict[str, Any]:
    email = getattr(settings, 'DEFAULT_ADMIN_EMAIL', 'admin@eduai.edu').lower()
    coll = get_collection('users')
    existing = coll.find_one({'email': email}, {'_id': 0})
    if existing:
        return existing
    admin_doc = _system_admin_doc()
    coll.insert_one(deepcopy(admin_doc))
    return _public_user(admin_doc)

def purge_demo_data() -> dict[str, int]:
    counts = {}
    for coll_name in ['users', 'courses', 'categories', 'enrollments', 'assignments', 'submissions', 'materials', 'chatHistory', 'notifications', 'settings']:
        res = get_collection(coll_name).delete_many({})
        counts[coll_name] = res.deleted_count
    ensure_system_admin()
    return counts

def record_quiz_submission(user_id: str, course_id: str, score: int) -> dict[str, Any]:
    doc = {
        'id': f'quiz-{uuid.uuid4().hex[:8]}',
        'userId': user_id,
        'courseId': course_id,
        'score': score,
        'createdAt': _now_iso()
    }
    get_collection('quiz_submissions').insert_one(deepcopy(doc))
    return get_collection('quiz_submissions').find_one({'id': doc['id']}, {'_id': 0})

def get_student_analytics_results(user_id: str) -> dict[str, Any]:
    return get_user_stats(user_id)
"""

with open('state_store.py', 'r') as f:
    text = f.read()

import re
text = re.sub(r'# ---- AUTO-GENERATED MISSING FUNCTIONS ----.*', code, text, flags=re.DOTALL)

with open('state_store.py', 'w') as f:
    f.write(text)
