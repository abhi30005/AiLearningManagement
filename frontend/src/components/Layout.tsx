import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { useLanguage } from '../lib/language-context'
import {
  GraduationCap,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  MessageSquare,
  ClipboardList,
  User,
  LayoutDashboard,
  ChevronDown,
  Globe,
  PenTool,
  BarChart2,
  Award,
} from 'lucide-react'
import { useState } from 'react'

const navItems = {
  admin: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/admin/my-courses', icon: BookOpen, label: 'my courses' },
    { path: '/admin/users', icon: Users, label: 'users' },
    { path: '/admin/courses', icon: ClipboardList, label: 'all courses' },
    { path: '/admin/enrollments', icon: ClipboardList, label: 'enrollments' },
  ],
  teacher: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/teacher/courses', icon: BookOpen, label: 'my courses' },
    { path: '/teacher/students', icon: Users, label: 'students' },
    { path: '/teacher/assignments', icon: ClipboardList, label: 'assignments' },
    { path: '/teacher/quizzes', icon: Settings, label: 'quizzes' },
    { path: '/teacher/results', icon: BarChart2, label: 'results' },
    { path: '/teacher/materials', icon: BookOpen, label: 'course materials' },
  ],
  student: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/my-courses', icon: BookOpen, label: 'my courses' },
    { path: '/courses', icon: BookOpen, label: 'all courses' },
    { path: '/assignments', icon: ClipboardList, label: 'assignments' },
    { path: '/ai-tutor', icon: MessageSquare, label: 'ai tutor' },
    { path: '/whiteboard', icon: PenTool, label: 'whiteboard' },
    { path: '/results', icon: BarChart2, label: 'results' },
    { path: '/certificates', icon: Award, label: 'certificates' },
  ],
}

const languages = [
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'hi', label: 'Hindi', flag: 'IN' },
  { code: 'bn', label: 'Bengali', flag: 'BD' },
] as const

export default function Layout() {
  const { user, signOut } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const items = user ? navItems[user.role] : navItems.student

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-secondary-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">AI-LMS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="capitalize">{item.label.replace('aiTutor.title', 'AI Tutor').replace('ai tutor', 'AI Tutor')}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          </div>
        </aside>

        {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-secondary-200 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-secondary-600" />
              </button>
              <h1 className="text-lg font-semibold text-secondary-900 hidden sm:block">
                {t('common.welcome')}, {user?.full_name?.split(' ')[0] || 'User'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <Globe className="w-5 h-5 text-secondary-600" />
                  <span className="text-sm font-medium text-secondary-700">
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setLangMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${language === lang.code
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-secondary-700 hover:bg-secondary-50'
                          }`}
                      >
                        <span className="font-medium">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-medium text-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-secondary-700 hidden sm:block">
                    {user?.full_name || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-secondary-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                    <NavLink
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <User className="w-4 h-4" />
                      {t('common.profile')}
                    </NavLink>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
