import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { ClipboardList, CheckCircle, Plus, X } from 'lucide-react'
import { PageLoader } from '../../components/ui/PageLoader'

export default function TeacherAssignmentsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [gradeInput, setGradeInput] = useState({ score: 0, feedback: '' })

  const [courses, setCourses] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    courseId: '',
    instructions: '',
    dueDate: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subData, courseData] = await Promise.all([
          apiFetch<any>('/assessments/submissions'),
          apiFetch<any[]>(`/courses/teacher/${user?.id || 'current'}`)
        ])
        setSubmissions(subData.submissions || [])
        setCourses(courseData || [])
        if (courseData && courseData.length > 0) {
          setNewAssignment(prev => ({ ...prev, courseId: courseData[0].id }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [])

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

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.courseId) {
      alert("Title and Course are required.")
      return
    }
    try {
      await apiFetch('/assessments/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: newAssignment.title,
          courseId: newAssignment.courseId,
          instructions: newAssignment.instructions,
          dueDate: newAssignment.dueDate,
          teacherId: user?.id
        })
      })
      alert("Assignment created successfully!")
      setShowCreateModal(false)
      setNewAssignment({ title: '', courseId: courses[0]?.id || '', instructions: '', dueDate: '' })
    } catch (err) {
      console.error(err)
      alert("Failed to create assignment")
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
          <p className="text-secondary-600">Create assignments and review student submissions.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

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
                        No submissions yet.
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

        {/* Grading Panel */}
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-secondary-100">
              <h2 className="text-xl font-bold text-secondary-900">Create New Assignment</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="input w-full"
                  placeholder="e.g. Week 1 Essay"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Course</label>
                <select 
                  value={newAssignment.courseId}
                  onChange={(e) => setNewAssignment({...newAssignment, courseId: e.target.value})}
                  className="input w-full"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Instructions</label>
                <textarea 
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment({...newAssignment, instructions: e.target.value})}
                  className="input w-full min-h-[100px]"
                  placeholder="Write instructions for the students..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-secondary-100 bg-secondary-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateAssignment}
                className="btn-primary"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
