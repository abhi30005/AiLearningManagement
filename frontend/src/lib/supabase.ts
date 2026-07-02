import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type User = {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  full_name: string
  avatar_url?: string
  language: 'en' | 'hi' | 'bn'
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  teacher_id: string
  category_id?: string
  status: 'draft' | 'published' | 'archived'
  language: 'en' | 'hi' | 'bn'
  created_at: string
  updated_at: string
}

export type Module = {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  created_at: string
}

export type Lesson = {
  id: string
  module_id: string
  title: string
  content?: string
  video_url?: string
  pdf_url?: string
  order_index: number
  duration_minutes?: number
  created_at: string
}

export type Quiz = {
  id: string
  module_id: string
  title: string
  description?: string
  passing_score: number
  max_attempts: number
  created_at: string
}

export type Question = {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'mcq' | 'true_false' | 'fill_blank' | 'short_answer'
  options?: string[]
  correct_answer: string
  explanation?: string
  points: number
  order_index: number
}

export type Enrollment = {
  id: string
  student_id: string
  course_id: string
  progress: number
  enrolled_at: string
  completed_at?: string
}

export type QuizAttempt = {
  id: string
  quiz_id: string
  student_id: string
  score: number
  answers: Record<string, string>
  submitted_at: string
}

export type Assignment = {
  id: string
  lesson_id: string
  title: string
  description: string
  due_date: string
  max_score: number
  created_at: string
}

export type AssignmentSubmission = {
  id: string
  assignment_id: string
  student_id: string
  content: string
  attachments?: string[]
  submitted_at: string
  score?: number
  feedback?: string
  graded_at?: string
}

export type ChatMessage = {
  id: string
  user_id: string
  lesson_id?: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type Certificate = {
  id: string
  student_id: string
  course_id: string
  issued_at: string
  certificate_url: string
}
