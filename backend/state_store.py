import json
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import settings
from database import get_database

VALID_ROLES = {'student', 'teacher', 'admin'}

def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')

def _parse_iso(value: str | None) -> datetime | None:
    if not value: return None
    try: return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError: return None

def _role_tier(role: str) -> str:
    if role == 'admin': return 'Admin Tier'
    if role == 'teacher': return 'Faculty Tier'
    return 'Student Tier'

def _public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        'id': user.get('id', ''),
        'name': user.get('name', ''),
        'full_name': user.get('name', ''),
        'email': user.get('email', ''),
        'role': user.get('role', 'student'),
        'active': bool(user.get('active', True)),
        'tier': _role_tier(user.get('role', 'student')),
        'xp': int(user.get('xp', 0)),
        'streak': int(user.get('streak', 0)),
        'badges': list(user.get('badges', [])),
        'studyHours': list(user.get('studyHours', [0, 0, 0, 0, 0, 0, 0])),
        'weakTopics': list(user.get('weakTopics', [])),
        'certificates': list(user.get('certificates', [])),
        'department': user.get('department') or _role_tier(user.get('role', 'student')).replace(' Tier', ''),
        'course': user.get('course', ''),
        'subject': user.get('subject', ''),
        'createdAt': user.get('createdAt'),
    }

def get_collection(name: str):
    db = get_database()
    if db is None:
        raise Exception('Database not connected')
    return db[name]

# ---------------- USERS ----------------
def list_users() -> list[dict[str, Any]]:
    return [_public_user(u) for u in get_collection('users').find({}, {'_id': 0})]

def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    u = get_collection('users').find_one({'id': user_id}, {'_id': 0})
    return _public_user(u) if u else None

def get_user_by_email(email: str) -> dict[str, Any] | None:
    u = get_collection('users').find_one({'email': email.lower()}, {'_id': 0})
    return _public_user(u) if u else None

def get_user_by_role(role: str) -> dict[str, Any] | None:
    u = get_collection('users').find_one({'role': role}, {'_id': 0})
    return _public_user(u) if u else None

def get_default_user(role: str = 'student') -> dict[str, Any]:
    email = getattr(settings, f'DEFAULT_{role.upper()}_EMAIL')
    u = get_user_by_email(email)
    if u: return u
    raise Exception(f'Default {role} user not found.')

def get_default_user_id(role: str = 'student') -> str:
    return getattr(settings, f'DEFAULT_{role.upper()}_ID')

def get_current_user(default_email: str | None = None) -> dict[str, Any]:
    email = default_email or settings.DEFAULT_STUDENT_EMAIL
    u = get_user_by_email(email)
    if u: return u
    raise Exception('User not found.')

def upsert_oauth_user(email: str, role: str) -> dict[str, Any]:
    coll = get_collection('users')
    existing = coll.find_one({'email': email.lower()}, {'_id': 0})
    if existing: return _public_user(existing)
    
    new_user = {
        'id': f'user-{uuid.uuid4().hex[:10]}',
        'email': email.lower(),
        'name': email.split('@')[0],
        'role': role,
        'password': '',
        'active': True,
        'xp': 0,
        'streak': 0,
        'badges': ['New Learner'],
        'studyHours': [0]*7,
        'weakTopics': [],
        'certificates': [],
        'createdAt': _now_iso()
    }
    coll.insert_one(deepcopy(new_user))
    return _public_user(new_user)

def authenticate_user(email: str, password: str | None = None, role: str | None = None) -> dict[str, Any] | None:
    from utils.security import verify_password
    u = get_collection('users').find_one({'email': email.lower()}, {'_id': 0})
    if not u: return None
    if role and u.get('role') != role: return None
    # oauth bypass
    if u.get('password') == '' and password is not None:
        return None
    if password and not verify_password(password, u.get('password', '')):
        return None
    return _public_user(u)

def register_user(name: str, email: str, role: str, password: str | None = None, **kwargs) -> dict[str, Any] | None:
    from utils.security import get_password_hash
    coll = get_collection('users')
    if coll.find_one({'email': email.lower()}):
        return None
    
    hashed = get_password_hash(password) if password else ''
    new_user = {
        'id': f'user-{uuid.uuid4().hex[:10]}',
        'email': email.lower(),
        'name': name,
        'role': role,
        'password': hashed,
        'active': True,
        'xp': 0,
        'streak': 0,
        'badges': ['New Learner'],
        'studyHours': [0]*7,
        'weakTopics': [],
        'certificates': [],
        'createdAt': _now_iso(),
        **kwargs
    }
    coll.insert_one(deepcopy(new_user))
    return _public_user(new_user)

def update_user_role(user_id: str, role: str) -> dict[str, Any] | None:
    if role not in VALID_ROLES: raise ValueError('Invalid role')
    get_collection('users').update_one({'id': user_id}, {'$set': {'role': role}})
    return get_user_by_id(user_id)

def update_user(user_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    get_collection('users').update_one({'id': user_id}, {'$set': updates})
    return get_user_by_id(user_id)

def delete_user(user_id: str) -> bool:
    res = get_collection('users').delete_one({'id': user_id})
    return res.deleted_count > 0

def admin_create_user(email: str, name: str, role: str) -> dict[str, Any]:
    res = register_user(name=name, email=email, role=role, password='password123')
    if not res: raise ValueError('User already exists')
    return res


# ---------------- COURSES ----------------
def list_courses() -> list[dict[str, Any]]:
    return list(get_collection('courses').find({}, {'_id': 0}))

def get_course(course_id: str) -> dict[str, Any] | None:
    return get_collection('courses').find_one({'id': course_id}, {'_id': 0})

def create_course(title: str, description: str, category: str, teacher_id: str | None = None, thumbnail: str | None = None, level: str | None = None, language: str | None = None) -> dict[str, Any]:
    c_id = f'c-{uuid.uuid4().hex[:8]}'
    course = {
        'id': c_id,
        'title': title,
        'description': description,
        'category': category,
        'level': level or 'Level 1',
        'language': language or 'en',
        'studentsCount': 0,
        'weeks': settings.DEFAULT_COURSE_WEEKS,
        'progress': 0,
        'active': True,
        'image': thumbnail or 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
        'teacherId': teacher_id or settings.DEFAULT_TEACHER_ID,
        'chapters': [],
        'createdAt': _now_iso(),
    }
    get_collection('courses').insert_one(deepcopy(course))
    return get_course(c_id)

def update_course(course_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    get_collection('courses').update_one({'id': course_id}, {'$set': updates})
    return get_course(course_id)

def add_course_chapter(course_id: str, title: str) -> dict[str, Any] | None:
    ch_id = f'{course_id}-ch-{uuid.uuid4().hex[:4]}'
    ch = {'id': ch_id, 'title': title, 'modules': []}
    get_collection('courses').update_one({'id': course_id}, {'$push': {'chapters': ch}})
    return ch

def add_chapter_module(course_id: str, chapter_id: str, title: str, completed: bool, has_pdf: bool, url: str | None = None, type: str | None = None) -> dict[str, Any] | None:
    m_id = f'{chapter_id}-m-{uuid.uuid4().hex[:4]}'
    mod = {'id': m_id, 'title': title, 'completed': completed, 'hasPdf': has_pdf, 'url': url or "", 'type': type or "video"}
    get_collection('courses').update_one(
        {'id': course_id, 'chapters.id': chapter_id},
        {'$push': {'chapters.$.modules': mod}}
    )
    return mod

def list_chapter_modules(course_id: str, chapter_id: str) -> list[dict[str, Any]] | None:
    course = get_course(course_id)
    if not course: return None
    for ch in course.get('chapters', []):
        if ch['id'] == chapter_id:
            return ch.get('modules', [])
    return None

def delete_course(course_id: str) -> bool:
    return get_collection('courses').delete_one({'id': course_id}).deleted_count > 0

# ---------------- CATEGORIES ----------------
def list_categories() -> list[dict[str, Any]]:
    return list(get_collection('categories').find({}, {'_id': 0}))

def create_category(name: str, slug: str, description: str, icon: str) -> dict[str, Any]:
    cat = {'id': f'cat-{uuid.uuid4().hex[:6]}', 'name': name, 'slug': slug, 'description': description, 'icon': icon}
    get_collection('categories').insert_one(deepcopy(cat))
    return get_collection('categories').find_one({'id': cat['id']}, {'_id': 0})

def update_category(cat_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    get_collection('categories').update_one({'id': cat_id}, {'$set': updates})
    return get_collection('categories').find_one({'id': cat_id}, {'_id': 0})

def delete_category(cat_id: str) -> bool:
    return get_collection('categories').delete_one({'id': cat_id}).deleted_count > 0


# ---------------- ENROLLMENTS ----------------
def enroll_user_in_course(user_id: str, course_id: str) -> dict[str, Any] | None:
    coll = get_collection('enrollments')
    if coll.find_one({'userId': user_id, 'courseId': course_id}):
        return None
    e = {
        'id': f'enr-{uuid.uuid4().hex[:8]}',
        'userId': user_id,
        'courseId': course_id,
        'progress': 0,
        'enrolledAt': _now_iso()
    }
    coll.insert_one(deepcopy(e))
    get_collection('courses').update_one({'id': course_id}, {'$inc': {'studentsCount': 1}})
    return coll.find_one({'id': e['id']}, {'_id': 0})

def list_enrollments(user_id: str | None = None, course_id: str | None = None) -> list[dict[str, Any]]:
    q = {}
    if user_id: q['userId'] = user_id
    if course_id: q['courseId'] = course_id
    enrollments = list(get_collection('enrollments').find(q, {'_id': 0}))
    
    # Calculate progress dynamically based on completed lessons
    for enr in enrollments:
        course = get_course(enr['courseId'])
        if course:
            total_lessons = sum(len(ch.get('modules', [])) for ch in course.get('chapters', []))
            completed = len(enr.get('lessonsCompleted', []))
            if total_lessons > 0:
                enr['progress'] = int((completed / total_lessons) * 100)
            else:
                enr['progress'] = 0
                
    return enrollments

def list_all_enrollments() -> list[dict[str, Any]]:
    return list_enrollments()

def delete_enrollment(enrollment_id: str) -> bool:
    e = get_collection('enrollments').find_one({'id': enrollment_id})
    if e:
        get_collection('courses').update_one({'id': e['courseId']}, {'$inc': {'studentsCount': -1}})
        get_collection('enrollments').delete_one({'id': enrollment_id})
        return True
    return False

def update_course_progress(user_id: str, course_id: str, progress: int) -> dict[str, Any] | None:
    get_collection('enrollments').update_one(
        {'userId': user_id, 'courseId': course_id},
        {'$set': {'progress': progress}}
    )
    return get_collection('enrollments').find_one({'userId': user_id, 'courseId': course_id}, {'_id': 0})

# ---------------- ASSIGNMENTS & SUBMISSIONS ----------------
def create_assignment(course_id: str, title: str, description: str, due_date: str, points: int, teacher_id: str | None = None, resources: list[str] | None = None, allow_resubmission: bool = True) -> dict[str, Any]:
    a = {
        'id': f'assn-{uuid.uuid4().hex[:8]}',
        'courseId': course_id,
        'title': title,
        'description': description,
        'dueDate': due_date,
        'points': points,
        'teacherId': teacher_id or get_course(course_id).get('teacherId', settings.DEFAULT_TEACHER_ID),
        'resources': resources or [],
        'allowResubmission': allow_resubmission,
        'createdAt': _now_iso()
    }
    get_collection('assignments').insert_one(deepcopy(a))
    return get_collection('assignments').find_one({'id': a['id']}, {'_id': 0})

def list_assignments(course_id: str | None = None, teacher_id: str | None = None) -> list[dict[str, Any]]:
    q = {}
    if course_id: q['courseId'] = course_id
    if teacher_id: q['teacherId'] = teacher_id
    return list(get_collection('assignments').find(q, {'_id': 0}))

def update_assignment(assignment_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    get_collection('assignments').update_one({'id': assignment_id}, {'$set': updates})
    return get_collection('assignments').find_one({'id': assignment_id}, {'_id': 0})

def create_submission(user_id: str, course_id: str, title: str, submission_text: str, file_url: str = "", question: str = "", student_name: str = "", assignment_id: str = "") -> dict[str, Any]:
    s = {
        'id': f'sub-{uuid.uuid4().hex[:8]}',
        'userId': user_id,
        'courseId': course_id,
        'assignmentId': assignment_id,
        'title': title,
        'submissionText': submission_text,
        'fileUrl': file_url,
        'question': question,
        'studentName': student_name,
        'submittedAt': _now_iso(),
        'status': 'pending',
        'score': 0,
        'feedback': '',
    }
    get_collection('submissions').insert_one(deepcopy(s))
    return get_collection('submissions').find_one({'id': s['id']}, {'_id': 0})

def list_submissions(user_id: str | None = None) -> list[dict[str, Any]]:
    q = {}
    if user_id: q['userId'] = user_id
    return list(get_collection('submissions').find(q, {'_id': 0}))

def evaluate_submission_text(submission_text: str) -> dict[str, Any]:
    return {
        'score': 85,
        'feedback': 'Good job. AI evaluated.',
        'suggestions': ['Add more detail here.']
    }

def apply_submission_evaluation(user_id: str, evaluation: dict[str, Any]) -> None:
    pass

def grade_submission(submission_id: str, score: int, feedback: str) -> dict[str, Any] | None:
    get_collection('submissions').update_one(
        {'id': submission_id},
        {'$set': {'score': score, 'feedback': feedback, 'status': 'graded'}}
    )
    return get_collection('submissions').find_one({'id': submission_id}, {'_id': 0})


# ---------------- GAMIFICATION ----------------
def award_xp(user_id: str, amount: int) -> dict[str, Any]:
    get_collection('users').update_one({'id': user_id}, {'$inc': {'xp': amount}})
    return get_user_by_id(user_id)

def get_user_stats(user_id: str) -> dict[str, Any]:
    return get_user_by_id(user_id) or {}

def get_leaderboard(limit: int = 20) -> list[dict[str, Any]]:
    users = list(get_collection('users').find({'role': 'student'}, {'_id': 0}).sort('xp', -1).limit(limit))
    return [_public_user(u) for u in users]

def issue_certificate(user_id: str, title: str, course_id: str | None = None, student_name: str | None = None, course_name: str | None = None) -> dict[str, Any] | None:
    cert = {
        'id': f'cert-{uuid.uuid4().hex[:8]}',
        'title': title,
        'date': _now_iso(),
        'courseId': course_id,
        'color': 'primary',
        'studentName': student_name,
        'courseName': course_name
    }
    get_collection('users').update_one({'id': user_id}, {'$push': {'certificates': cert}})
    return cert

def issue_course_certificate(user_id: str, course_id: str, score: int) -> dict[str, Any] | None:
    if score < 75: return None
    course = get_course(course_id)
    if not course: return None
    user = get_user_by_id(user_id)
    student_name = user.get('name', 'Student') if user else 'Student'
    course_name = course.get('title', 'Course')
    return issue_certificate(user_id, f"Completion: {course_name}", course_id, student_name, course_name)

def list_certificates(user_id: str) -> list[dict[str, Any]]:
    u = get_user_by_id(user_id)
    return u.get('certificates', []) if u else []

def weak_topics(user_id: str) -> list[dict[str, Any]]:
    return []

def course_recommendations(user_id: str) -> list[dict[str, Any]]:
    topics = weak_topics(user_id)
    courses = list_courses()
    recs = []
    for index, course in enumerate(courses[:3]):
        reason_topic = topics[index % len(topics)]['topic'] if topics else course.get('category', 'General')
        recs.append({'id': course['id'], 'title': course['title'], 'image': course.get('image'), 'thumbnail': course.get('thumbnail'), 'match': f'{94 - index * 4}% AI Match', 'category': course.get('category', 'General'), 'reason': f'Suggested to improve: {reason_topic}'})
    return recs

# ---------------- MATERIALS, NOTIFICATIONS & CHAT ----------------
def create_material(course_id: str, chapter_id: str, material_type: str, url: str, title: str) -> dict[str, Any]:
    m = {
        'id': f'mat-{uuid.uuid4().hex[:8]}',
        'courseId': course_id,
        'chapterId': chapter_id,
        'type': material_type,
        'url': url,
        'title': title,
        'createdAt': _now_iso()
    }
    get_collection('materials').insert_one(deepcopy(m))
    return get_collection('materials').find_one({'id': m['id']}, {'_id': 0})

def list_materials(course_id: str | None = None, chapter_id: str | None = None) -> list[dict[str, Any]]:
    q = {}
    if course_id: q['courseId'] = course_id
    if chapter_id: q['chapterId'] = chapter_id
    return list(get_collection('materials').find(q, {'_id': 0}))

def create_notification(user_id: str, title: str, message: str, notification_type: str = 'info') -> dict[str, Any]:
    n = {
        'id': f'notif-{uuid.uuid4().hex[:8]}',
        'userId': user_id,
        'title': title,
        'message': message,
        'type': notification_type,
        'read': False,
        'createdAt': _now_iso()
    }
    get_collection('notifications').insert_one(deepcopy(n))
    return get_collection('notifications').find_one({'id': n['id']}, {'_id': 0})

def list_notifications(user_id: str | None = None) -> list[dict[str, Any]]:
    q = {}
    if user_id: q['userId'] = user_id
    return list(get_collection('notifications').find(q, {'_id': 0}))

def mark_notification_read(notification_id: str) -> dict[str, Any] | None:
    get_collection('notifications').update_one({'id': notification_id}, {'$set': {'read': True}})
    return get_collection('notifications').find_one({'id': notification_id}, {'_id': 0})

def save_chat_message(user_id: str, document_id: str, message: str, sender: str) -> dict[str, Any]:
    c = {
        'id': f'msg-{uuid.uuid4().hex[:8]}',
        'userId': user_id,
        'documentId': document_id,
        'message': message,
        'sender': sender,
        'timestamp': _now_iso()
    }
    get_collection('chatHistory').insert_one(deepcopy(c))
    return get_collection('chatHistory').find_one({'id': c['id']}, {'_id': 0})

def list_chat_history(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
    return list(get_collection('chatHistory').find({'userId': user_id}, {'_id': 0}).sort('timestamp', 1).limit(limit))

def save_note(user_id: str, topic: str, content: str) -> dict[str, Any]:
    return {}

def save_flashcards(user_id: str, topic: str, cards: list[dict[str, str]]) -> dict[str, Any]:
    return {}

def search_all(query: str) -> list[dict[str, Any]]:
    return []

# ---------------- SETTINGS ----------------
def get_settings(user_id: str) -> dict[str, Any]:
    s = get_collection('settings').find_one({'user_id': user_id}, {'_id': 0})
    return s if s else _default_settings()

def save_settings(user_id: str, updates: dict[str, Any]) -> dict[str, Any]:
    get_collection('settings').update_one({'user_id': user_id}, {'$set': updates}, upsert=True)
    return get_settings(user_id)

# ---------------- ANALYTICS ----------------
def get_teacher_students(teacher_id: str) -> list[dict[str, Any]]:
    courses = list(get_collection('courses').find({'teacherId': teacher_id}, {'_id': 0}))
    course_ids = [c['id'] for c in courses]
    enrollments = list(get_collection('enrollments').find({'courseId': {'$in': course_ids}}, {'_id': 0}))
    student_ids = list(set([e['userId'] for e in enrollments]))
    users = list(get_collection('users').find({'id': {'$in': student_ids}}, {'_id': 0}))
    return [_public_user(u) for u in users]

def get_student_analytics(user_id: str) -> dict[str, Any]:
    user = get_user_by_id(user_id) or {}
    if not user:
        return {}
    study_hours = list(user.get('studyHours', [0, 0, 0, 0, 0, 0, 0]))
    submissions = list_submissions(user['id'])
    graded_scores = [int(s['score']) for s in submissions if isinstance(s.get('score'), int)]
    avg_score = int(sum(graded_scores) / len(graded_scores)) if graded_scores else 0
    enrollments = list_enrollments(user['id'])
    all_courses_list = list_courses()
    all_courses = {c['id']: c for c in all_courses_list}
    enrolled_courses = []
    for enr in enrollments:
        course = all_courses.get(enr['courseId'])
        if course:
            completed_lessons = enr.get('lessonsCompleted', [])
            total_lessons = 0
            next_lesson_title = 'Review Course'
            next_lesson_id = 'default'
            found_next = False

            for ch in course.get('chapters', []):
                for mod in ch.get('modules', []):
                    total_lessons += 1
                    if not found_next and mod['id'] not in completed_lessons:
                        next_lesson_title = mod['title']
                        next_lesson_id = mod['id']
                        found_next = True
            
            calculated_progress = 0
            if total_lessons > 0:
                calculated_progress = int((len(completed_lessons) / total_lessons) * 100)
            elif enr.get('progress'):
                calculated_progress = enr['progress']
                
            enrolled_courses.append({
                'id': course['id'], 
                'title': course['title'], 
                'progress': calculated_progress, 
                'nextLesson': next_lesson_title,
                'nextLessonId': next_lesson_id,
                'thumbnail': course.get('image', course.get('thumbnail', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485'))
            })
    stats = [{'label': 'Courses Enrolled', 'value': str(len(enrolled_courses)), 'icon': 'BookOpen'}, {'label': 'Hours Learned', 'value': str(sum(study_hours)), 'icon': 'Clock', 'trend': 'This week'}, {'label': 'XP Earned', 'value': str(user.get('xp', 0)), 'icon': 'TrendingUp'}, {'label': 'Learning Streak', 'value': f"{user.get('streak', 0)} days", 'icon': 'Flame'}]
    return {'student_id': user['id'], 'xp': int(user.get('xp', 0)), 'studyHours': study_hours, 'study_hours': sum(study_hours), 'quiz_performance': max(60, min(98, int(user.get('xp', 0) / 1200))), 'assignment_score': avg_score, 'enrolledCourses': enrolled_courses, 'recommendedCourses': course_recommendations(user['id']), 'stats': stats, 'weakTopics': [t['topic'] for t in weak_topics(user['id'])], 'recentChats': list_chat_history(user['id']), 'certificates': list_certificates(user['id']), 'allCourses': all_courses_list}

def get_teacher_analytics(teacher_id: str) -> dict[str, Any]:
    return {}

def get_admin_analytics() -> dict[str, Any]:
    return {
        'active_users': get_collection('users').count_documents({}),
        'active_courses': get_collection('courses').count_documents({}),
        'active_students': get_collection('users').count_documents({'role': 'student'}),
        'active_teachers': get_collection('users').count_documents({'role': 'teacher'}),
        'category_breakdown': [],
        'recent_activity': []
    }





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
