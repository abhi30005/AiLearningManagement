import { useState, useEffect } from 'react'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import {
  BookOpen,
  Clock,
  TrendingUp,
  Flame,
  PlayCircle,
  Award,
  ChevronRight,
  Brain,
  Target,
} from 'lucide-react'



export default function StudentDashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // We use user?.id or a default string so the backend can resolve it
        const studentId = user?.id || 'current' 
        const result = await apiFetch<any>(`/analytics/student/${studentId}`)
        setData(result)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchAnalytics()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Define icon mapping for stats based on the string returned by backend
  const IconMap: Record<string, any> = {
    BookOpen,
    Clock,
    TrendingUp,
    Flame
  }

  const { enrolledCourses = [], recommendedCourses = [], stats = [], weakTopics = [], recentChats = [], certificates = [] } = data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('common.welcome')}, {user?.full_name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-secondary-600">Keep up the great work! You're making progress.</p>
        </div>
        <button className="btn-accent">
          <Brain className="w-4 h-4" />
          Open AI Tutor
        </button>
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
                  src={course.thumbnail}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedCourses.map((course: any) => (
              <div key={course.id} className="flex gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900">{course.title}</h4>
                  <p className="text-sm text-secondary-600">{course.reason}</p>
                  <button className="text-sm text-primary-600 font-medium mt-1 flex items-center gap-1 hover:underline">
                    View Course <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics & Recent Chat */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-warning-500" />
              Topics to Review
            </h3>
            <div className="space-y-2">
              {weakTopics.map((topic: string, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary-50">
                  <span className="text-sm text-secondary-700">{topic}</span>
                  <button className="text-xs text-primary-600 font-medium hover:underline">
                    Practice
                  </button>
                </div>
              ))}
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
