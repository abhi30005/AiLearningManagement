import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { Users, Mail, BookOpen } from 'lucide-react'
import { PageLoader } from '../../components/ui/PageLoader'

export default function TeacherStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiFetch<any>(`/users/teacher/${user?.id || 'current'}/students`)
        setStudents(data.students || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchStudents()
  }, [user])

  if (loading) {
    return <PageLoader type="list" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Enrolled Students</h1>
        <p className="text-secondary-600">Track the progress of students in your courses.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="py-4 px-6 text-sm font-medium text-secondary-900">Student</th>
                <th className="py-4 px-6 text-sm font-medium text-secondary-900">Courses</th>
                <th className="py-4 px-6 text-sm font-medium text-secondary-900">Average Progress</th>
                <th className="py-4 px-6 text-sm font-medium text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-secondary-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student, i) => {
                  const enrollments = student.enrollments || []
                  const avgProgress = enrollments.length 
                      ? Math.round(enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length) 
                      : 0

                  return (
                    <tr key={i} className="hover:bg-secondary-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">{student.name}</p>
                            <p className="text-sm text-secondary-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-secondary-400" />
                          <span className="text-secondary-900 font-medium">{enrollments.length}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden w-24">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${avgProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-secondary-900">{avgProgress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
