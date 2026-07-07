import { useState, useEffect } from 'react'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import {
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  MoreVertical,
  Search,
  Plus,
  Filter,
} from 'lucide-react'

export default function AssignmentsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const [asgRes, subRes, coursesRes] = await Promise.all([
          apiFetch<any>('/assessments/assignments'),
          apiFetch<any>(`/assessments/submissions?user_id=${user?.id || ''}`),
          apiFetch<any[]>('/courses/')
        ])
        
        const allAssignments = asgRes.assignments || []
        const userSubmissions = subRes.submissions || []
        const courses = coursesRes || []
        
        const merged = allAssignments.map((a: any) => {
          const sub = userSubmissions.find((s: any) => s.courseId === a.courseId && s.title === a.title) // In real app, match by assignmentId
          let status = 'pending'
          if (sub) {
            status = sub.grade ? 'graded' : 'submitted'
          } else {
             const daysLeft = getDaysRemaining(a.dueDate)
             if (daysLeft < 0) status = 'late'
          }
          
          return {
            ...a,
            course: courses.find((c: any) => c.id === a.courseId)?.title || a.courseId,
            status,
            score: sub?.score,
            feedback: sub?.feedback,
            submittedAt: sub?.submittedAt
          }
        })
        setAssignments(merged)
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.id) {
      fetchAssignments()
    }
  }, [user])

  const filteredAssignments = assignments.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter
    const matchesSearch = (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.course || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return 0
    const due = new Date(dueDate)
    const now = new Date()
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-700">Graded</span>
      case 'submitted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">Submitted</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-700">Pending</span>
      case 'late':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-error-100 text-error-700">Overdue</span>
      default:
        return null
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('assignments.title')}</h1>
          <p className="text-secondary-600">Manage your course assignments</p>
        </div>
        {user?.role === 'teacher' && (
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('assignments.createAssignment')}
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments..."
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary-400" />
            {['all', 'pending', 'submitted', 'graded'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const daysRemaining = getDaysRemaining(assignment.dueDate)
          const isOverdue = daysRemaining < 0 && assignment.status === 'pending'

          return (
            <div key={assignment.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-secondary-900">{assignment.title}</h3>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <p className="text-secondary-600 mb-4">{assignment.course}</p>

                  <div className="flex items-center gap-6 text-sm text-secondary-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      {isOverdue && (
                        <span className="text-error-600 font-medium">({Math.abs(daysRemaining)} days overdue)</span>
                      )}
                      {!isOverdue && daysRemaining <= 3 && daysRemaining >= 0 && assignment.status !== 'submitted' && (
                        <span className="text-warning-600 font-medium">({daysRemaining} days left)</span>
                      )}
                    </span>
                    {assignment.submittedAt && (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent-500" />
                        Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {assignment.score !== undefined && (
                    <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-secondary-700">Score</span>
                        <span className={`text-lg font-bold ${
                          assignment.score >= 90 ? 'text-accent-600' :
                          assignment.score >= 70 ? 'text-primary-600' :
                          'text-warning-600'
                        }`}>
                          {assignment.score}%
                        </span>
                      </div>
                      {assignment.feedback && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-secondary-700">Feedback:</span>
                          <p className="text-sm text-secondary-600 mt-1">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(assignment.status === 'pending' || assignment.status === 'late') && user?.role === 'student' && (
                    <button 
                      onClick={() => setSelectedAssignment(selectedAssignment === assignment.id ? null : assignment.id)}
                      className="btn-primary"
                    >
                      <Upload className="w-4 h-4" />
                      Submit
                    </button>
                  )}
                  {assignment.status === 'submitted' && user?.role === 'student' && (
                    <span className="text-sm text-secondary-500">Awaiting grade</span>
                  )}
                  <button
                    onClick={() => setSelectedAssignment(selectedAssignment === assignment.id ? null : assignment.id)}
                    className="p-2 hover:bg-secondary-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-secondary-400" />
                  </button>
                </div>
              </div>

              {selectedAssignment === assignment.id && (
                <div className="mt-4 pt-4 border-t border-secondary-100 animate-in fade-in slide-in-from-top-2">
                  <h4 className="font-medium text-secondary-900 mb-2">Instructions</h4>
                  <p className="text-secondary-600 text-sm mb-4 whitespace-pre-wrap">{assignment.description || 'No additional instructions provided.'}</p>
                  
                  {(assignment.status === 'pending' || assignment.status === 'late') && user?.role === 'student' && (
                     <div className="space-y-3">
                        <textarea 
                          className="input w-full h-32 resize-none" 
                          placeholder="Type your submission here..."
                          id={`submission-${assignment.id}`}
                        ></textarea>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Upload File / Link</label>
                          <input 
                            type="text" 
                            className="input w-full" 
                            placeholder="Enter file URL (e.g., Google Drive link)"
                            id={`fileUrl-${assignment.id}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Question to Teacher (Optional)</label>
                          <textarea 
                            className="input w-full h-20 resize-none" 
                            placeholder="Ask any question about this assignment..."
                            id={`question-${assignment.id}`}
                          ></textarea>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2">
                           <button 
                             onClick={() => setSelectedAssignment(null)} 
                             className="btn-secondary"
                           >
                             Cancel
                           </button>
                           <button 
                             onClick={async () => {
                               const submissionText = (document.getElementById(`submission-${assignment.id}`) as HTMLTextAreaElement)?.value;
                               const fileUrl = (document.getElementById(`fileUrl-${assignment.id}`) as HTMLInputElement)?.value;
                               const question = (document.getElementById(`question-${assignment.id}`) as HTMLTextAreaElement)?.value;
                               
                               if(!submissionText && !fileUrl) {
                                  alert("Please provide a submission text or file link.");
                                  return;
                               }
                               try {
                                 await apiFetch('/assessments/submit-assignment', {
                                   method: 'POST',
                                   body: JSON.stringify({
                                      assignmentId: assignment.id,
                                      userId: user?.id,
                                      courseId: assignment.courseId,
                                      title: assignment.title,
                                      submissionText,
                                      fileUrl,
                                      question,
                                      studentName: user?.full_name || user?.name || 'Student'
                                   })
                                 });
                                 // Optimistic update
                                 const updatedAssignments = [...assignments];
                                 const idx = updatedAssignments.findIndex(a => a.id === assignment.id);
                                 if (idx > -1) {
                                   updatedAssignments[idx].status = 'submitted';
                                   updatedAssignments[idx].submittedAt = new Date().toISOString();
                                 }
                                 setAssignments(updatedAssignments);
                                 setSelectedAssignment(null);
                               } catch (error) {
                                 console.error('Failed to submit assignment:', error);
                               }
                             }}
                             className="btn-primary"
                           >
                             <CheckCircle className="w-4 h-4" />
                             Submit Assignment
                           </button>
                        </div>
                     </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900">No assignments found</h3>
          <p className="text-secondary-600 mt-1">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  )
}
