import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth-context'
import { LanguageProvider } from './lib/language-context'
import Layout from './components/Layout'
import AuthLayout from './components/AuthLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import AdminDashboard from './pages/admin/Dashboard'
import TeacherDashboard from './pages/teacher/Dashboard'
import StudentDashboard from './pages/student/Dashboard'
import CoursesPage from './pages/courses/CoursesPage'
import CourseDetailPage from './pages/courses/CourseDetailPage'
import CreateCoursePage from './pages/courses/CreateCoursePage'
import LessonPage from './pages/learn/LessonPage'
import AITutorPage from './pages/ai/AITutorPage'
import QuizPage from './pages/learn/QuizPage'
import AssignmentsPage from './pages/learn/AssignmentsPage'
import ProfilePage from './pages/profile/ProfilePage'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminCategoriesPage from './pages/admin/CategoriesPage'
import AdminCoursesPage from './pages/admin/AdminCoursesPage'
import AdminEnrollmentsPage from './pages/admin/AdminEnrollmentsPage'
import MyCoursesPage from './pages/student/MyCoursesPage'
import WhiteboardPage from './pages/student/WhiteboardPage'
import ResultsPage from './pages/student/ResultsPage'
import CertificatesPage from './pages/student/CertificatesPage'

import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage'
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage'
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage'
import TeacherQuizzesPage from './pages/teacher/TeacherQuizzesPage'
import TeacherResultsPage from './pages/teacher/TeacherResultsPage'
import TeacherMaterialsPage from './pages/teacher/TeacherMaterialsPage'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function DashboardRouter() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'student':
      return <StudentDashboard />
    default:
      return <StudentDashboard />
  }
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/courses/new" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><CreateCoursePage /></ProtectedRoute>} />
        <Route path="/learn/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path="/learn/:courseId/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/ai-tutor" element={<ProtectedRoute><AITutorPage /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* Student Specific Routes */}
        <Route path="/my-courses" element={<ProtectedRoute allowedRoles={['student']}><MyCoursesPage /></ProtectedRoute>} />
        <Route path="/whiteboard" element={<ProtectedRoute><WhiteboardPage /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute allowedRoles={['student']}><ResultsPage /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute allowedRoles={['student']}><CertificatesPage /></ProtectedRoute>} />

        {/* Teacher Specific Routes */}
        <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherCoursesPage /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudentsPage /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignmentsPage /></ProtectedRoute>} />
        <Route path="/teacher/quizzes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherQuizzesPage /></ProtectedRoute>} />
        <Route path="/teacher/results" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherResultsPage /></ProtectedRoute>} />
        <Route path="/teacher/materials" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherMaterialsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage defaultRole="student" /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage defaultRole="teacher" /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCoursesPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminCategoriesPage /></ProtectedRoute>} />
        <Route path="/admin/enrollments" element={<ProtectedRoute allowedRoles={['admin']}><AdminEnrollmentsPage /></ProtectedRoute>} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
