import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import {
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Plus,
  MoreVertical,
  Play,
} from 'lucide-react'



export default function TeacherDashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const teacherId = user?.id || 'current' 
        const result = await apiFetch<any>(`/analytics/teacher/${teacherId}`)
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

  const IconMap: Record<string, any> = {
    BookOpen,
    Users,
    Clock,
    TrendingUp,
  }

  const { courses = [], recentSubmissions = [], stats = [] } = data || {}


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('common.welcome')}, {user?.full_name?.split(' ')[0] || 'Teacher'}</h1>
          <p className="text-secondary-600">Here's what's happening with your courses</p>
        </div>
        <button onClick={() => navigate('/courses/create')} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t('courses.createCourse')}
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
                  <p className="text-sm text-secondary-600">{t(stat.label)}</p>
                  <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-secondary-500 mt-1">{stat.change}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary-100">
                  <IconComponent className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">{t('courses.myCourses')}</h2>
          <button className="text-sm text-primary-600 hover:underline">{t('common.viewAll')}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="card-hover overflow-hidden">
              <div className="relative h-40">
                <img
                  src={course.image || course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.status === 'published'
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-secondary-100 text-secondary-700'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 line-clamp-2">{course.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-secondary-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    12 lessons
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-secondary-600 mb-1">
                    <span>{t('courses.progress')}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Course Card */}
          <div onClick={() => navigate('/courses/create')} className="card border-dashed border-2 flex items-center justify-center min-h-[280px] hover:border-primary-400 hover:bg-primary-50/50 transition-colors cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 text-secondary-600" />
              </div>
              <p className="mt-3 font-medium text-secondary-900">{t('courses.createCourse')}</p>
              <p className="text-sm text-secondary-600">Start building your course</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Recent Submissions</h3>
          <button className="text-sm text-primary-600 hover:underline">{t('common.viewAll')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Assignment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Score</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Submitted</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((submission: any, i: number) => (
                <tr key={i} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-medium">
                        {submission.student.charAt(0)}
                      </div>
                      <span className="font-medium text-secondary-900">{submission.student}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-secondary-600">{submission.assignment}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      submission.score >= 90 ? 'bg-accent-100 text-accent-700' :
                      submission.score >= 70 ? 'bg-primary-100 text-primary-700' :
                      'bg-warning-100 text-warning-700'
                    }`}>
                      {submission.score}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-secondary-500">{submission.time}</td>
                  <td className="py-3 px-4">
                    <button className="p-1 hover:bg-secondary-100 rounded">
                      <MoreVertical className="w-4 h-4 text-secondary-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
