import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'

export default function TeacherCoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch<any[]>(`/courses/teacher/${user?.id || 'current'}`)
        setCourses(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchCourses()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' })
      setCourses(courses.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

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
          <h1 className="text-2xl font-bold text-secondary-900">My Courses</h1>
          <p className="text-secondary-600">Manage all your created courses here.</p>
        </div>
        <button onClick={() => navigate('/courses/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">No courses yet</h3>
          <p className="text-secondary-600 mt-2">Start creating your first course to engage students.</p>
          <button onClick={() => navigate('/courses/new')} className="btn-primary mt-6 mx-auto">
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="card overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-secondary-200">
                {(course.image || course.thumbnail) ? (
                   <img src={course.image || course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center">
                       <BookOpen className="w-10 h-10 text-secondary-400" />
                   </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.active ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'}`}>
                    {course.active ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg text-secondary-900 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-secondary-600 line-clamp-2 mt-1 flex-1">{course.description || 'No description provided.'}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-secondary-100">
                  <button onClick={() => navigate(`/courses/${course.id}`)} className="flex-1 btn-secondary btn-sm justify-center">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
