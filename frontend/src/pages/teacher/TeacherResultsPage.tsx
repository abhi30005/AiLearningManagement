import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { BarChart2, TrendingUp, Award } from 'lucide-react'

export default function TeacherResultsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await apiFetch<any>('/assessments/submissions')
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Calculate simple stats
  const graded = submissions.filter(s => s.score !== undefined && s.score !== null)
  const avgScore = graded.length ? Math.round(graded.reduce((acc, s) => acc + s.score, 0) / graded.length) : 0
  const totalSubmissions = submissions.length
  const pendingGrades = totalSubmissions - graded.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Results & Performance</h1>
        <p className="text-secondary-600">Overview of student performance across all assessments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4 border-l-4 border-primary-500">
          <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-secondary-600 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-secondary-900">{avgScore}%</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 border-l-4 border-accent-500">
          <div className="p-3 bg-accent-100 rounded-lg text-accent-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-secondary-600 font-medium">Total Graded</p>
            <p className="text-2xl font-bold text-secondary-900">{graded.length}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 border-l-4 border-warning-500">
          <div className="p-3 bg-warning-100 rounded-lg text-warning-600">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-secondary-600 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-secondary-900">{pendingGrades}</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-secondary-200">
          <h3 className="font-semibold text-secondary-900">Gradebook</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Student ID</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Assignment Title</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Submission Date</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Grade</th>
                <th className="py-3 px-4 text-sm font-medium text-secondary-900">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-6 text-center text-secondary-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                submissions.map((sub, i) => (
                  <tr key={i} className="hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4 text-secondary-900 font-medium">{sub.userId}</td>
                    <td className="py-3 px-4 text-secondary-600">{sub.title}</td>
                    <td className="py-3 px-4 text-secondary-500 text-sm">{sub.time || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {sub.grade ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          sub.grade.startsWith('A') ? 'bg-accent-100 text-accent-700' :
                          sub.grade.startsWith('B') ? 'bg-primary-100 text-primary-700' :
                          'bg-warning-100 text-warning-700'
                        }`}>
                          {sub.grade}
                        </span>
                      ) : (
                        <span className="text-secondary-400 text-sm">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary-900 font-semibold">
                      {sub.score ? `${sub.score}%` : '-'}
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
