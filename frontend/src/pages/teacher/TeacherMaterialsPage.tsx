import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../lib/api'
import { FileText, Video, Upload, Link as LinkIcon, Trash2, FolderPlus } from 'lucide-react'
import { useAuth } from '../../lib/auth-context'
import { PageLoader } from '../../components/ui/PageLoader'

export default function TeacherMaterialsPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkType, setLinkType] = useState('youtube')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const cData = await apiFetch<any[]>(`/courses/teacher/${user?.id || 'current'}`)
        setCourses(cData || [])
        if (cData && cData.length > 0) {
          setSelectedCourse(cData[0].id)
        }
        // Fetch all materials for demo
        const mData = await apiFetch<any>('/materials')
        setMaterials(mData.materials || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchInit()
  }, [user])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCourse || !selectedChapter) {
       alert("Please select a course and chapter first.")
       return
    }
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const endpoint = file.type.includes('pdf') ? 'upload-pdf' : 'upload-image'
      const res = await apiFetch<any>(`/materials/${endpoint}?course_id=${selectedCourse}&chapter_id=${selectedChapter}`, {
        method: 'POST',
        body: formData,
        // Don't stringify FormData
      })
      if (res.success) {
        setMaterials([...materials, res.material])
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error(err)
      alert("Failed to upload file")
    }
  }

  const handleLinkSubmit = async () => {
    if (!selectedCourse || !selectedChapter || !linkUrl) {
       alert("Please fill in all fields.")
       return
    }
    try {
      const endpoint = linkType === 'youtube' ? 'add-youtube' : linkType === 'drive' ? 'add-drive-pdf' : 'add-image'
      const res = await apiFetch<any>(`/materials/${endpoint}?course_id=${selectedCourse}&chapter_id=${selectedChapter}`, {
        method: 'POST',
        body: JSON.stringify({ url: linkUrl })
      })
      if (res.success) {
        setMaterials([...materials, res.material])
        setLinkUrl('')
      }
    } catch (err) {
      console.error(err)
      alert("Failed to add link")
    }
  }

  const courseObj = courses.find(c => c.id === selectedCourse)
  const chapters = courseObj?.chapters || []

  if (loading) {
    return <PageLoader type="list" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Course Materials</h1>
        <p className="text-secondary-600">Upload and manage PDFs, Videos, and Notes for your modules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary-600" />
              Add New Material
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Target Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input w-full">
                  <option value="" disabled>Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Target Chapter</label>
                <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} className="input w-full">
                  <option value="" disabled>Select Chapter</option>
                  {chapters.map((ch: any) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
                </select>
              </div>

              <div className="border-t border-secondary-200 pt-4">
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'upload' ? 'bg-primary-50 text-primary-700' : 'text-secondary-600'}`}>
                    Upload File
                  </button>
                  <button onClick={() => setActiveTab('link')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'link' ? 'bg-primary-50 text-primary-700' : 'text-secondary-600'}`}>
                    Add Link
                  </button>
                </div>

                {activeTab === 'upload' ? (
                  <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6 flex flex-col items-center justify-center bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-8 h-8 text-secondary-400 mb-2" />
                    <p className="text-sm font-medium text-secondary-900">Click to upload</p>
                    <p className="text-xs text-secondary-500 mt-1">PDF or Images up to 10MB</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <select value={linkType} onChange={(e) => setLinkType(e.target.value)} className="input w-full">
                      <option value="youtube">YouTube Video</option>
                      <option value="drive">Google Drive Link</option>
                      <option value="image">External Image</option>
                    </select>
                    <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="input w-full" />
                    <button onClick={handleLinkSubmit} className="btn-primary w-full justify-center">Add Resource Link</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden h-full">
            <div className="p-4 border-b border-secondary-200">
              <h3 className="font-semibold text-secondary-900">Uploaded Materials</h3>
            </div>
            
            {materials.length === 0 ? (
              <div className="p-12 text-center">
                 <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                 <p className="text-secondary-600">No materials uploaded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-100">
                {materials.map((m, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-secondary-100 rounded-lg text-secondary-600">
                        {m.material_type === 'youtube' ? <Video className="w-5 h-5 text-error-600" /> :
                         m.material_type === 'drive' ? <LinkIcon className="w-5 h-5 text-primary-600" /> :
                         <FileText className="w-5 h-5 text-accent-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 line-clamp-1">{m.title}</p>
                        <p className="text-xs text-secondary-500 flex gap-2">
                           <span className="uppercase">{m.material_type}</span>
                           <span>•</span>
                           <span>Chapter: {m.chapterId}</span>
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
