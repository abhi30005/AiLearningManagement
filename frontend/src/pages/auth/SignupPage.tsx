import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { useLanguage } from '../../lib/language-context'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Building, BookOpen } from 'lucide-react'

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Business Administration'
];

const STUDENT_COURSES: Record<string, string[]> = {
  'Computer Science': ['B.Tech CSE', 'BCA', 'MCA'],
  'Information Technology': ['B.Tech IT', 'MCA'],
  'Business Administration': ['BBA', 'MBA']
};

const TEACHER_SUBJECTS: Record<string, string[]> = {
  'Computer Science': ['Data Structures', 'DBMS', 'Operating Systems', 'AI'],
  'Information Technology': ['Networking', 'Cloud Computing', 'Cyber Security'],
  'Business Administration': ['Marketing', 'Finance', 'Human Resources']
};

export default function SignupPage() {
  const { signUpStudent, signUpTeacher } = useAuth()
  const { t } = useLanguage()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [department, setDepartment] = useState('')
  const [course, setCourse] = useState('')
  const [subject, setSubject] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError(t('auth.passwordRequirements'))
      return
    }

    if (role === 'student' && (!department || !course)) {
      setError('Department and Course / Program are required')
      return
    }

    if (role === 'teacher' && (!department || !subject)) {
      setError('Department and Subject are required')
      return
    }

    setLoading(true)

    let error;
    if (role === 'student') {
      const res = await signUpStudent(email, password, fullName, department, course)
      error = res.error
    } else {
      const res = await signUpTeacher(email, password, fullName, department, subject)
      error = res.error
    }

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-cyan-300/20 ring-1 ring-cyan-100/30 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-cyan-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Account Created!</h2>
        <p className="text-cyan-50/75">Please check your email to verify your account.</p>
        <Link to="/login" className="btn bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white hover:from-cyan-300 hover:to-blue-500 focus:ring-cyan-300 inline-flex">
          {t('common.login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Create profile</p>
        <h1 className="text-2xl font-bold text-white">{t('auth.signupTitle')}</h1>
        <p className="mt-1 text-sm text-cyan-50/75">{t('auth.signupSubtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-950/70 border border-red-300/35 text-red-100 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-cyan-50/85">{t('common.fullName')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-9 py-2 text-sm border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-cyan-50/85">{t('common.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9 py-2 text-sm border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cyan-50/85">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                role === 'student'
                  ? 'border-cyan-300 bg-cyan-300/20 text-white shadow-sm shadow-cyan-950/25'
                  : 'border-white/20 bg-white/10 text-cyan-50/75 hover:border-cyan-100/40 hover:bg-white/15'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{t('common.students')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                role === 'teacher'
                  ? 'border-cyan-300 bg-cyan-300/20 text-white shadow-sm shadow-cyan-950/25'
                  : 'border-white/20 bg-white/10 text-cyan-50/75 hover:border-cyan-100/40 hover:bg-white/15'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{t('common.teachers')}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cyan-50/85">Department</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value)
                setCourse('')
                setSubject('')
              }}
              className="input pl-10 appearance-none border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
              required
            >
              <option value="" disabled>Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {role === 'student' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cyan-50/85">Course / Program</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="input pl-10 appearance-none border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
                required
                disabled={!department}
              >
                <option value="" disabled>Select Course</option>
                {department && STUDENT_COURSES[department]?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {role === 'teacher' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cyan-50/85">Subject / Specialization</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input pl-10 appearance-none border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
                required
                disabled={!department}
              >
                <option value="" disabled>Select Subject</option>
                {department && TEACHER_SUBJECTS[department]?.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-cyan-50/85">{t('common.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9 pr-10 py-2 text-sm border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-cyan-50/85">{t('common.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-9 py-2 text-sm border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
                placeholder="********"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-300 hover:to-blue-500 focus:ring-cyan-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('common.loading')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              {t('auth.createAccount')}
            </span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-cyan-50/75">
        {t('common.hasAccount')}{' '}
        <Link to="/login" className="text-cyan-200 font-semibold hover:text-white hover:underline">
          {t('common.login')}
        </Link>
      </p>
    </div>
  )
}
