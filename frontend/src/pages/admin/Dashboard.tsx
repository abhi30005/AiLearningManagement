import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'



export default function AdminDashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()
  
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await apiFetch<any>(`/analytics/admin`)
        setData(result)
      } catch (error) {
        console.error('Error fetching admin analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchAnalytics()
  }, [user])

  const stats = useMemo(() => {
    if (!data) return []
    return [
      { label: 'dashboard.totalUsers', value: data.active_users || 0, change: '+12%', icon: Users, color: 'primary' },
      { label: 'dashboard.totalCourses', value: data.active_courses || 0, change: '+8%', icon: BookOpen, color: 'accent' },
      { label: 'dashboard.activeStudents', value: data.active_students || 0, change: '+15%', icon: GraduationCap, color: 'success' },
      { label: 'dashboard.activeTeachers', value: data.active_teachers || 0, change: '+5%', icon: TrendingUp, color: 'warning' },
    ]
  }, [data])

  const activityData = useMemo(() => {
    if (!data?.ai_token_flow) return []
    return data.ai_token_flow.map((item: any) => ({
      name: item.name,
      value: item.interactions
    }))
  }, [data])

  const categoryData = useMemo(() => {
    if (!data?.category_breakdown) return []
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#64748b']
    return data.category_breakdown.map((item: any, idx: number) => ({
      name: item.category,
      value: item.courses,
      color: colors[idx % colors.length]
    }))
  }, [data])

  // Mock enrollment data since we don't track historical enrollment counts per month
  const enrollmentData = [
    { month: 'Jan', students: 400, courses: 24 },
    { month: 'Feb', students: 500, courses: 28 },
    { month: 'Mar', students: 600, courses: 32 },
    { month: 'Apr', students: 750, courses: 38 },
    { month: 'May', students: 820, courses: 42 },
    { month: 'Jun', students: data?.active_students || 900, courses: data?.active_courses || 48 },
  ]

  const recentActivity = data?.recent_activity || []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('dashboard.overview')}</h1>
          <p className="text-secondary-600">Welcome back, {user?.full_name || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </button>
          <button className="btn-primary">
            <BookOpen className="w-4 h-4" />
            {t('courses.createCourse')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-secondary-600">{t(stat.label)}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                <p className="text-sm text-accent-600 mt-1">{stat.change} this month</p>
              </div>
              <div className={`p-3 rounded-xl ${
                stat.color === 'primary' ? 'bg-primary-100' :
                stat.color === 'accent' ? 'bg-accent-100' :
                stat.color === 'success' ? 'bg-green-100' :
                'bg-warning-100'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'primary' ? 'text-primary-600' :
                  stat.color === 'accent' ? 'text-accent-600' :
                  stat.color === 'success' ? 'text-green-600' :
                  'text-warning-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Student Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="courses" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Courses by Category</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-secondary-600">{item.name}</span>
                  <span className="text-sm font-medium text-secondary-900 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">{t('dashboard.recentActivity')}</h3>
            <button className="text-sm text-primary-600 hover:underline">{t('common.viewAll')}</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 text-sm font-medium">
                  {activity.title ? activity.title.charAt(0) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-900">
                    <span className="font-medium">{activity.title}</span>{' '}
                    <span className="text-secondary-600">{activity.description}</span>
                  </p>
                  <p className="text-xs text-secondary-500">{activity.createdAt ? activity.createdAt.substring(0, 10) : 'Just now'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
