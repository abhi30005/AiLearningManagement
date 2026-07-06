import { useState, useEffect } from 'react'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { PageLoader } from '../../components/ui/PageLoader'
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  Target,
  Brain,
  MessageSquare,
  ChevronRight,
  Flame,
  Plus
} from 'lucide-react'
import { Link } from 'react-router-dom'



export default function StudentDashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const studentId = user?.id || 'current' 
      const result = await apiFetch<any>(`/analytics/student/${studentId}`)
      setData(result)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user])

  const handleQuickEnroll = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    try {
      await apiFetch('/enrollments/', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, courseId })
      })
      fetchAnalytics() // refresh the dashboard
    } catch (error) {
      console.error('Enrollment failed', error)
    }
  }

  if (loading) {
    return <PageLoader type="dashboard" />
  }

  // Define icon mapping for stats based on the string returned by backend
  const IconMap: Record<string, any> = {
    BookOpen,
    Clock,
    TrendingUp,
    Flame
  }

  const { enrolledCourses = [], recommendedCourses = [], stats = [], skills = [], recentChats = [], certificates = [], allCourses = [] } = data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('common.welcome')}, {user?.full_name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-secondary-600">Keep up the great work! You're making progress.</p>
        </div>
        <Link to="/ai-tutor" className="btn-accent">
          <Brain className="w-4 h-4" />
          Open AI Tutor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any) => {
          const IconComponent = IconMap[stat.icon] || BookOpen
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  {stat.trend && (
                    <p className="text-xs text-accent-600 mt-1">{stat.trend}</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-primary-100">
                  <IconComponent className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">{t('courses.continueLearning')}</h2>
          <button className="text-sm text-primary-600 hover:underline">{t('common.viewAll')}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course: any) => (
            <div key={course.id} className="card-hover overflow-hidden">
              <div className="relative h-36">
                <img
                  src={course.image || course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-secondary-600 mt-1">Next: {course.nextLesson}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-primary-600">{course.progress}% complete</span>
                  <button className="btn-sm btn-primary">
                    <PlayCircle className="w-4 h-4" />
                    Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Courses */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedCourses.map((course: any) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="card overflow-hidden group cursor-pointer border border-secondary-100 hover:border-primary-200 transition-all hover:shadow-md flex flex-col">
                <div className="relative h-32 overflow-hidden bg-secondary-100">
                  <img
                    src={course.image || course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-medium text-secondary-700 shadow-sm">
                      {course.category || 'General'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 bg-accent-500/90 backdrop-blur-sm text-white rounded text-[10px] font-medium shadow-sm">
                      {course.match || 'High Match'}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-semibold text-sm text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-xs text-secondary-600 mt-1 line-clamp-2 mb-3 flex-1">{course.reason}</p>
                  <button 
                    onClick={(e) => handleQuickEnroll(e, course.id)} 
                    className="btn-primary w-full py-1.5 text-xs flex justify-center items-center gap-1 mt-auto"
                  >
                    <Plus className="w-3 h-3" /> Enroll Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Skills & Recent Chat */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Skills & Technologies
            </h3>
            <div className="space-y-4">
              {skills && skills.length > 0 ? (
                skills.map((skill: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-secondary-900">{skill.name}</span>
                      <span className="text-secondary-500">{skill.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-secondary-500 text-center py-2">Enroll in courses to track your skills.</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary-500" />
              Recent AI Chats
            </h3>
            <div className="space-y-3">
              {recentChats.map((chat: any, i: number) => (
                <div key={i} className="p-2 rounded-lg hover:bg-secondary-50 cursor-pointer">
                  <p className="text-sm font-medium text-secondary-900">{chat.topic}</p>
                  <p className="text-xs text-secondary-500 truncate">{chat.message}</p>
                  <p className="text-xs text-secondary-400 mt-1">{chat.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explore All Courses */}
      {/* <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Explore All Courses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course: any) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="card overflow-hidden group cursor-pointer border border-secondary-100 hover:border-primary-200 transition-all hover:shadow-md flex flex-col">
              <div className="relative h-32 overflow-hidden bg-secondary-100">
                <img
                  src={course.image || course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-medium text-secondary-700 shadow-sm">
                    {course.category || 'General'}
                  </span>
                </div>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h4 className="font-semibold text-sm text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-secondary-600 mt-1 line-clamp-2 mb-3 flex-1">{course.description || 'Learn this amazing course.'}</p>
                <button 
                  onClick={(e) => handleQuickEnroll(e, course.id)} 
                  className="btn-primary w-full py-1.5 text-xs flex justify-center items-center gap-1 mt-auto"
                >
                  <Plus className="w-3 h-3" /> Enroll Now
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div> */}

      {/* Certificates */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-600" />
            {t('certificates.title')}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="flex items-center gap-4 p-4 rounded-lg border border-secondary-200 bg-gradient-to-r from-accent-50 to-primary-50">
              <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary-900">{cert.title}</p>
                <p className="text-sm text-secondary-500">{cert.date}</p>
              </div>
              <button className="btn-secondary btn-sm">
                {t('common.download')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
