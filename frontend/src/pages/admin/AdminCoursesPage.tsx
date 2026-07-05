import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../../components/ui/PageLoader'
import {
  BookOpen,
  Edit2,
  Trash2,
  Users,
  Plus,
  Eye
} from 'lucide-react'

export default function AdminCoursesPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        apiFetch<any[]>('/courses'),
        apiFetch<any>('/users')
      ])
      setCourses(coursesRes || [])
      setTeachers((usersRes.users || []).filter((u: any) => u.role === 'teacher'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTeacher = async (courseId: string, teacherId: string) => {
    try {
      const res = await apiFetch<any>(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify({ teacherId })
      })
      if (res.success) {
        setCourses(courses.map(c => c.id === courseId ? res.course : c))
      }
    } catch (err) {
      console.error(err)
      alert("Failed to assign teacher")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' })
      setCourses(courses.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete course")
    }
  }

  if (loading) {
    return <PageLoader type="list" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Course Management</h1>
          <p className="text-secondary-600">Manage courses and assign teachers globally.</p>
        </div>
        <button onClick={() => navigate('/courses/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Course</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Students Enrolled</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Assigned Teacher</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-secondary-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course, i) => (
                  <tr key={course.id || i} className="hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4">
                       <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-secondary-400" />
                          <div>
                            <p className="font-medium text-secondary-900">{course.title}</p>
                            <p className="text-xs text-secondary-500">{course.level || 'All Levels'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-secondary-600">
                         <Users className="w-4 h-4" /> {course.studentsCount || 0}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        value={course.teacherId || ''} 
                        onChange={(e) => handleAssignTeacher(course.id, e.target.value)}
                        className="input btn-sm max-w-[200px]"
                      >
                        <option value="" disabled>Unassigned</option>
                        {teachers.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                         <button onClick={() => navigate(`/courses/${course.id}`)} className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors" title="View Course">
                            <Eye className="w-4 h-4" />
                         </button>
                         <button onClick={() => navigate(`/courses/${course.id}/edit`)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit Course">
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(course.id)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors" title="Delete Course">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
