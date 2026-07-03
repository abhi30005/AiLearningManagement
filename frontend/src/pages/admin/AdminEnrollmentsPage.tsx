import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import {
  ClipboardList,
  Trash2,
  Mail,
  BookOpen
} from 'lucide-react'

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const data = await apiFetch<any>('/enrollments')
      setEnrollments(data.enrollments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to unenroll this student? All their progress for this course will be lost.")) return
    try {
      await apiFetch(`/enrollments/${id}`, { method: 'DELETE' })
      setEnrollments(enrollments.filter(e => e.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to unenroll student")
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
          <h1 className="text-2xl font-bold text-secondary-900">Enrollments Management</h1>
          <p className="text-secondary-600">Overview of all active student-course enrollments.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Student</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Course Enrolled</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Progress</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Date Enrolled</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center text-secondary-500">
                     <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                     <p>No active enrollments found in the system.</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment, i) => (
                  <tr key={enrollment.id || i} className="hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4">
                       <div className="flex flex-col">
                          <span className="font-medium text-secondary-900">{enrollment.userName || enrollment.userId}</span>
                          <span className="text-xs text-secondary-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {enrollment.userEmail || 'N/A'}</span>
                       </div>
                    </td>
                    <td className="py-3 px-4">
                       <div className="flex items-center gap-2 text-sm font-medium text-secondary-800">
                         <BookOpen className="w-4 h-4 text-primary-500" />
                         {enrollment.courseTitle || enrollment.courseId}
                       </div>
                    </td>
                    <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden min-w-[80px] max-w-[120px]">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${enrollment.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-secondary-900">{enrollment.progress || 0}%</span>
                        </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                         <button onClick={() => handleDelete(enrollment.id)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors" title="Unenroll Student">
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
