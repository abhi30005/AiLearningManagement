# AI-LMS Route Summary

This document describes all the API routes available in the AI-LMS FastAPI backend and their corresponding features.

## Authentication & User Management (`routers/auth.py`, `routers/users.py`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Email/Password Login (Firebase Auth) |
| POST | `/auth/google` | Google Sign-In |
| POST | `/auth/register` | Register a new user |
| GET | `/users/me` | Get current user profile |
| GET | `/users/{user_id}` | Get user by ID (RBAC Protected) |
| PUT | `/users/{user_id}/role` | Update user role (RBAC: Admin) |

## Course Management (`routers/courses.py`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/courses/` | Browse courses |
| POST | `/courses/` | Create a new course (RBAC Protected: Teacher/Admin) |
| GET | `/courses/{course_id}` | Get course details |
| PUT | `/courses/{course_id}` | Edit course (RBAC Protected: Teacher/Admin) |
| DELETE | `/courses/{course_id}` | Delete course (RBAC Protected: Teacher/Admin) |
| POST | `/courses/{course_id}/chapters` | Add chapters to a course (RBAC Protected: Teacher/Admin) |
| POST | `/courses/{course_id}/chapters/{chapter_id}/modules` | Add modules to a chapter (RBAC Protected: Teacher/Admin) |
| GET | `/courses/{course_id}/chapters/{chapter_id}/modules` | List all modules inside a chapter |

## Learning Resources (`routers/materials.py`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/materials/` | List material metadata |
| POST | `/materials/upload-pdf` | Upload PDF files (Saves metadata to MongoDB-backed state) |
| POST | `/materials/add-youtube` | Add YouTube video links |
| POST | `/materials/add-drive-pdf` | Add Google Drive PDF links |

## AI Knowledge Base (RAG) (`routers/rag.py`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/rag/extract-pdf` | PDF Text Extraction & Chunking |
| POST | `/rag/extract-youtube` | YouTube Transcript Extraction |
| POST | `/rag/generate-embeddings` | Generate OpenAI Embeddings & ChromaDB storage |

## AI Tutor (`routers/tutor.py`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/tutor/chat` | Multi-Language Chat with PDFs/Videos (Saves chat to DB for Memory) |
| GET | `/tutor/history/{user_id}` | Get saved tutor chat history |
| POST | `/tutor/voice-chat` | Voice-to-Text & Text-to-Speech interactions |
| POST | `/tutor/chapter-summary` | Chapter Summaries |

## AI Content Generation & Personalized Learning (`routers/ai_content.py`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai-content/notes` | Generate AI Notes (Saves to DB) |
| POST | `/ai-content/flashcards` | Generate Flashcards (Saves to DB) |
| POST | `/ai-content/mindmaps` | Generate Mind Maps |
| POST | `/ai-content/learning-path` | Generate AI Learning Paths (Saves to DB) |
| POST | `/ai-content/weak-topics` | Detect Weak Topics & Adaptive Learning |
| GET | `/ai-content/course-recommendations` | Smart Course Recommendations |
| GET | `/ai-content/revision-recommendations` | Spaced Revision Recommendations |

## Quiz & Assessments, Assignments (`routers/assessments.py`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/assessments/generate-quiz` | Quiz Generation (MCQ, Coding, etc.) (Saves to DB) |
| POST | `/assessments/submit-assignment` | Assignment Submission (Saves Submission metadata) |
| POST | `/assessments/evaluate-assignment` | AI Evaluation, Grades, & Plagiarism Detection |

## Collaborative Whiteboard (`routers/collaboration.py`)
| Method | Endpoint | Description |
|---|---|---|
| WS | `/collaboration/ws/{session_id}` | Real-Time Collaboration WebSocket |
| POST | `/collaboration/export/{session_id}`| Export PDF/Image |
| POST | `/collaboration/ai-diagram` | AI Diagram Generation from prompt |

## AI Search (`routers/search.py`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/search/` | Semantic Search across all resources |

## Analytics (`routers/analytics.py`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/student/{student_id}`| Learning Progress, Study Hours, Quiz Performance |
| GET | `/analytics/teacher/{teacher_id}`| Student & Course Analytics |
| GET | `/analytics/admin` | Platform & AI Usage Analytics |

## Gamification (`routers/gamification.py`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/gamification/leaderboard` | Get leaderboards based on dynamic XP |
| POST | `/gamification/award-xp` | Award XP points for streaks (Increments streaks) |
| GET | `/gamification/stats/{user_id}` | Get User XP, Streaks, & Badges |
| POST | `/gamification/issue-certificate` | Issue completion certificates |

## Reports (`routers/reports.py`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/export` | Export reports (PDF, Excel) |
