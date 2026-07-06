import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { ClipboardList, CheckCircle, Plus, BookOpen, Clock } from 'lucide-react'
import { PageLoader } from '../../components/ui/PageLoader'

export default function TeacherAssignmentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments')
  const [loading, setLoading] = useState(true)
  
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [gradeInput, setGradeInput] = useState({ score: 0, feedback: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subData, assignData] = await Promise.all([
          apiFetch<any>('/assessments/submissions'),
          apiFetch<any>(`/assessments/assignments?teacher_id=${user?.id || 'current'}`)
        ])
        setSubmissions(subData.submissions || [])
        setAssignments(assignData.assignments || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user])

  const handleGrade = async () => {
    if (!selectedSubmission) return
    try {
      const res = await apiFetch<any>(`/assessments/submit-assignment/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        body: JSON.stringify({
          score: Number(gradeInput.score),
          feedback: gradeInput.feedback
        })
      })
      if (res.success) {
        setSubmissions(submissions.map(s => s.id === selectedSubmission.id ? res.submission : s))
        setSelectedSubmission(null)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to grade submission")
    }
  }

  if (loading) {
    return <PageLoader type="list" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Assignments & Grading</h1>
          <p className="text-secondary-600">Manage your assignments and review student submissions.</p>
        </div>
        <button onClick={() => navigate('/teacher/assignments/create')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="flex border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Assignments
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Student Submissions
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th className="py-3 px-4 text-sm font-medium text-secondary-900">Title</th>
                  <th className="py-3 px-4 text-sm font-medium text-secondary-900">Course ID</th>
                  <th className="py-3 px-4 text-sm font-medium text-secondary-900">Due Date</th>
                  <th className="py-3 px-4 text-sm font-medium text-secondary-900">Max Points</th>
                  <th className="py-3 px-4 text-sm font-medium text-secondary-900">Resubmissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-secondary-500">
                      You haven't created any assignments yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment, i) => (
                    <tr key={i} className="hover:bg-secondary-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-secondary-900">{assignment.title}</td>
                      <td className="py-3 px-4 text-secondary-600">{assignment.courseId}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-secondary-700">
                          <Clock className="w-4 h-4 text-secondary-400" />
                          {assignment.dueDate || 'No Due Date'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-primary-700">
                         {assignment.points}
                      </td>
                      <td className="py-3 px-4 text-secondary-600">
                        {assignment.allowResubmission ? 'Allowed' : 'Disabled'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-secondary-200">
                      <th className="py-3 px-4 text-sm font-medium text-secondary-900">Assignment</th>
                      <th className="py-3 px-4 text-sm font-medium text-secondary-900">Student ID</th>
                      <th className="py-3 px-4 text-sm font-medium text-secondary-900">Status</th>
                      <th className="py-3 px-4 text-sm font-medium text-secondary-900">Score</th>
                      <th className="py-3 px-4 text-sm font-medium text-secondary-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 px-6 text-center text-secondary-500">
                          No student submissions yet.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub, i) => (
                        <tr key={i} className={`hover:bg-secondary-50 transition-colors ${selectedSubmission?.id === sub.id ? 'bg-primary-50' : ''}`}>
                          <td className="py-3 px-4 font-medium text-secondary-900">{sub.title}</td>
                          <td className="py-3 px-4 text-secondary-600">{sub.userId}</td>
                          <td className="py-3 px-4">
                            {sub.grade ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700">
                                <CheckCircle className="w-3 h-3" /> Graded
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                                Needs Review
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                             {sub.score ? `${sub.score}/100` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => {
                                setSelectedSubmission(sub)
                                setGradeInput({ score: sub.score || 0, feedback: sub.feedback || '' })
                              }}
                              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedSubmission ? (
              <div className="card p-5 sticky top-24">
                <h3 className="font-semibold text-lg text-secondary-900 mb-4">Grade Submission</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-1">Assignment</p>
                    <p className="text-secondary-900 bg-secondary-50 p-2 rounded">{selectedSubmission.title}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-1">Submission Text</p>
                    <div className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded h-32 overflow-y-auto whitespace-pre-wrap border border-secondary-200">
                      {selectedSubmission.submissionText || 'No text submitted.'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Score (0-100)</label>
                    <input 
                      type="number" 
                      min="0" max="100" 
                      value={gradeInput.score}
                      onChange={(e) => setGradeInput({...gradeInput, score: Number(e.target.value)})}
                      className="input w-full" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Feedback</label>
                    <textarea 
                      value={gradeInput.feedback}
                      onChange={(e) => setGradeInput({...gradeInput, feedback: e.target.value})}
                      className="input w-full min-h-[100px]" 
                      placeholder="Provide constructive feedback..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleGrade} className="btn-primary flex-1">Save Grade</button>
                    <button onClick={() => setSelectedSubmission(null)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <ClipboardList className="w-12 h-12 text-secondary-300 mb-4" />
                <p className="text-secondary-600">Select a submission from the list to review and grade.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
