# 🎓 AI Learning Management System (AI-LMS)

> An AI-powered Learning Management System that combines **OpenAI GPT**, **Retrieval-Augmented Generation (RAG)**, **Personalized Learning**, **Voice AI**, and **Multilingual Support** to deliver an intelligent and interactive learning experience.

---

## 🚀 Project Overview

The **AI Learning Management System (AI-LMS)** is an intelligent educational platform designed to enhance digital learning through Artificial Intelligence.

Teachers can create AI-powered courses using PDFs and YouTube videos, while students learn through an AI Tutor, personalized learning paths, AI-generated quizzes, AI notes, voice interaction, and an AI-assisted whiteboard.

The platform uses **Retrieval-Augmented Generation (RAG)** to provide context-aware responses from uploaded learning resources.

---

# ✨ Key Features

## 🔐 Authentication

- Firebase Authentication
- Email & Password Login
- Google Sign-In
- Forgot Password
- Role-Based Access Control (RBAC)

---

# 👥 User Roles

## 👨‍💼 Admin

### Responsibilities

- Manage Teachers
- Manage Students
- Manage Courses
- Manage Categories
- Platform Analytics
- Reports
- System Settings

### Dashboard

- Total Users
- Teachers
- Students
- Courses
- AI Usage
- Platform Statistics

---

## 👨‍🏫 Teacher

Teachers create and manage AI-powered courses.

### Features

### Course Management

- Create Course
- Edit Course
- Delete Course
- Publish Course

### Course Structure

```
Course
│
├── Module 1
│      ├── Lesson 1
│      ├── Lesson 2
│      └── Quiz
│
├── Module 2
│      ├── Lesson 1
│      ├── Assignment
│      └── Quiz
│
└── Final Assessment
```

### Learning Resources

- Upload PDF
- Google Drive PDF
- YouTube Videos
- Images

### AI Course Builder

Generate

- Course Summary
- Chapter Summary
- Study Notes
- Flashcards
- Practice Questions
- Quiz
- Lesson Plans
- Learning Objectives

### Assignment Management

- Create Assignments
- Set Due Date
- View Submissions
- Grade Assignments
- Provide Feedback

### Student Analytics

- Progress Tracking
- Quiz Performance
- Assignment Performance
- Weak Topic Analysis

---

## 👨‍🎓 Student

### Dashboard

- Continue Learning
- My Courses
- Learning Progress
- Study Hours
- Learning Streak
- Weak Topics
- Recommended Courses
- Recent AI Chats
- Certificates

### Learning

- Browse Courses
- Enroll in Courses
- Watch Videos
- Read PDFs
- Download Notes

---

# 🤖 AI Tutor

Students can

- Chat with PDFs
- Chat with YouTube Videos
- Ask Course Questions
- Explain Difficult Concepts
- Generate Examples
- Step-by-Step Explanations
- Conversation History
- Suggested Questions
- Copy Responses
- Regenerate Responses

---

# 🎙 Voice-Based AI Tutor

- Speech-to-Text
- Text-to-Speech
- Ask Questions by Voice
- Listen to AI Responses
- Read PDFs Aloud
- Pause / Resume
- Playback Speed Control

---

# 🎯 Personalized Learning

AI analyzes

- Learning Progress
- Quiz Performance
- Study Time
- Weak Topics

AI recommends

- Personalized Learning Path
- Next Lesson
- Revision Topics
- Daily Learning Goals
- Practice Questions

---

# 📝 AI Quiz Generator

Generate quizzes from

- PDFs
- YouTube Videos

Supported Question Types

- MCQ
- True / False
- Fill in the Blanks
- Short Answer

Features

- Instant Evaluation
- AI Feedback
- Score Analysis

---

# 📚 AI Notes Generator

Generate

- Chapter Summary
- Study Notes
- Key Points
- Flashcards

Download Notes as PDF

---

# 📂 Assignments

Students

- View Assignments
- Submit Assignments
- Upload Documents
- View Teacher Feedback

Teachers

- Create Assignments
- Review Submissions
- Grade Students

---

# 🖍 AI-Assisted Whiteboard

Drawing Tools

- Pen
- Pencil
- Shapes
- Sticky Notes
- Text
- Images
- Undo / Redo

AI Assistance

- Generate Diagrams
- Generate Flowcharts
- Generate Mind Maps
- Explain Drawings
- Summarize Whiteboard Notes

Export

- PDF
- PNG

---

# 🌍 Multi-Language Support

Supported Languages

- 🇺🇸 English
- 🇮🇳 Hindi
- 🇮🇳 Bengali

Available For

- User Interface
- AI Tutor
- AI Notes
- AI Quiz
- Voice Tutor
- Whiteboard

---

# 🔍 Smart Search

Semantic Search powered by RAG

Search

- Courses
- PDFs
- YouTube Videos
- Notes

---

# 📊 Progress Tracking

Students can view

- Course Progress
- Quiz Scores
- Assignment Scores
- Study Hours
- Weak Topics
- Achievements

---

# 🏆 Certificates

Automatically generated after

- Completing Lessons
- Passing Final Quiz
- Completing Assignments

Download as PDF

---

# 🔔 Notifications

Students

- Quiz Available
- Assignment Due
- Course Updated
- Certificate Ready

Teachers

- New Student Enrollment
- Assignment Submission
- Quiz Completion

---

# 👤 Profile & Settings

Profile

- Name
- Photo
- Email
- Preferred Language

Settings

- Theme
- Language
- Notifications
- Change Password

---

# 🤖 AI Modules

- AI Tutor
- AI Course Builder
- AI Notes Generator
- AI Quiz Generator
- AI Flashcards Generator
- AI Recommendation Engine
- AI Whiteboard Assistant
- AI Translation

---

# 🔄 Learning Workflow

```
Teacher Creates Course
        │
        ▼
Upload PDF / Add YouTube Video
        │
        ▼
AI Processes Learning Content
        │
        ▼
Student Enrolls
        │
        ▼
Watch Video + Read PDF
        │
        ▼
Chat with AI Tutor
        │
        ▼
Generate AI Notes
        │
        ▼
Take AI Quiz
        │
        ▼
Submit Assignment
        │
        ▼
Track Progress
        │
        ▼
Receive Certificate
```

---

# 🏗 System Architecture

```
                React + Vite
                     │
      Firebase Authentication
                     │
               FastAPI Backend
                     │
      ┌──────────────┼───────────────┐
      │              │               │
 PostgreSQL      ChromaDB      WebSockets
      │              │
      └────── LangChain ──────┘
               │
      OpenAI GPT-5.5
               │
    ┌──────────┼──────────┐
    │          │          │
 AI Tutor  AI Quiz  AI Notes
```

---

# 🛠 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | FastAPI |
| Database | PostgreSQL |
| Authentication | Firebase Authentication |
| AI | OpenAI GPT-5.5 |
| Embeddings | OpenAI text-embedding-3-small |
| Vector Database | ChromaDB |
| RAG Framework | LangChain |
| PDF Processing | PyMuPDF |
| YouTube Transcript | youtube-transcript-api |
| Speech-to-Text | OpenAI Whisper |
| Text-to-Speech | OpenAI TTS |
| Charts | Recharts |
| Deployment | Vercel + Render |

---

# 📁 Project Structure

```
frontend/
backend/
docs/
uploads/
chromadb/
README.md
```

---

# 🚀 Future Enhancements

- Live Classroom
- AI Interview Preparation
- Coding Playground
- AI Resume Analyzer
- AI Mock Interviews
- Mobile Application
- LMS Marketplace
- AI Learning Analytics
- Collaborative Whiteboard
- Offline Learning

---

# 📌 Status

🚧 **Proof of Concept (POC)**

This project demonstrates the core capabilities of an AI-powered Learning Management System and can be extended into a production-ready platform.

---

# 👨‍💻 Author

**Abhijit Bhunia**

GitHub: https://github.com/abhi30052004

Repository: https://github.com/abhi30052004/LearningManagement

---
