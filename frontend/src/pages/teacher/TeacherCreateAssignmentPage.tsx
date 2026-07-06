import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { PageLoader } from '../../components/ui/PageLoader'

export default function TeacherCreateAssignmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    instructions: '',
    dueDate: '',
    points: 100,
    allowResubmission: true,
    resources: [] as string[]
  })
  
  const [newResource, setNewResource] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch<any[]>(`/courses/teacher/${user?.id || 'current'}`)
        setCourses(data || [])
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, courseId: data[0].id }))
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchCourses()
  }, [user])

  const handleAddResource = () => {
    if (newResource.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, newResource.trim()]
      }))
      setNewResource('')
    }
  }

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      alert('Please fill out all required fields (Title, Course, Due Date).')
      return
    }
    
    setIsSubmitting(true)
    try {
      await apiFetch('/assessments/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          courseId: formData.courseId,
          instructions: formData.instructions,
          dueDate: formData.dueDate,
          points: formData.points,
          allowResubmission: formData.allowResubmission,
          resources: formData.resources,
          teacherId: user?.id
        })
      })
      navigate('/teacher/assignments')
    } catch (err) {
      console.error(err)
      alert('Failed to create assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <PageLoader type="detail" />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/teacher/assignments')}
          className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Create New Assignment</h1>
          <p className="text-secondary-600">Configure a new assignment for your students.</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Assignment Title *
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input w-full"
                placeholder="e.g. Week 1 Final Essay"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Course *
              </label>
              <select 
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                className="input w-full"
                required
              >
                {courses.length === 0 && <option value="">No courses available</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Due Date *
              </label>
              <input 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Maximum Points
              </label>
              <input 
                type="number" 
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({...formData, points: Number(e.target.value)})}
                className="input w-full"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox"
                id="allowResubmission"
                checked={formData.allowResubmission}
                onChange={(e) => setFormData({...formData, allowResubmission: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="allowResubmission" className="text-sm font-medium text-secondary-700">
                Allow student resubmissions
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Instructions
            </label>
            <textarea 
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="input w-full min-h-[150px]"
              placeholder="Provide detailed instructions for the assignment..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Resources (URLs)
            </label>
            <div className="flex gap-2 mb-2">
              <input 
                type="url" 
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                className="input flex-1"
                placeholder="https://example.com/reading-material"
              />
              <button 
                type="button"
                onClick={handleAddResource}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {formData.resources.length > 0 && (
              <ul className="space-y-2 mt-2">
                {formData.resources.map((url, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm">
                    <span className="truncate flex-1 mr-4 text-secondary-700">{url}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveResource(i)}
                      className="text-error-500 hover:text-error-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="pt-4 border-t border-secondary-200 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => navigate('/teacher/assignments')}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
