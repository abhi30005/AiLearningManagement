import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { useLanguage } from '../../lib/language-context'
import {
  Trash2,
  GripVertical,
  Video,
  FileText,
  Save,
  Eye,
  ChevronDown,
  ChevronRight,
  Plus,
  Image,
  X,
} from 'lucide-react'

interface Module {
  id: string
  title: string
  lessons: { id: string; title: string; type: 'video' | 'pdf' | 'quiz'; url?: string }[]
}

export default function CreateCoursePage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('beginner')
  const [language, setLanguage] = useState('en')
  const [thumbnail, setThumbnail] = useState('')
  const [thumbnailName, setThumbnailName] = useState('')
  const [modules, setModules] = useState<Module[]>([
    { id: '1', title: 'Module 1: Introduction', lessons: [] },
  ])
  const [expandedModule, setExpandedModule] = useState<string | null>('1')

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: `Module ${modules.length + 1}`,
      lessons: [],
    }
    setModules([...modules, newModule])
    setExpandedModule(newModule.id)
  }

  const addLesson = (moduleId: string, type: 'video' | 'pdf' | 'quiz') => {
    setModules(modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [
            ...m.lessons,
            {
              id: Date.now().toString(),
              title: type === 'video' ? 'New Video' : type === 'pdf' ? 'New PDF' : 'New Quiz',
              type,
              url: '',
            },
          ],
        }
      }
      return m
    }))
  }

  const updateLessonUrl = (moduleId: string, lessonId: string, url: string) => {
    setModules(modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, url } : l)
        }
      }
      return m
    }))
  }

  const handleLessonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, moduleId: string, lessonId: string) => {
    if (!id) {
      alert("Please save the course first before uploading materials.")
      return
    }
    
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Use existing material upload endpoints
      const endpoint = file.type.includes('pdf') ? 'upload-pdf' : 'upload-image'
      const res = await apiFetch<any>(`/materials/${endpoint}?course_id=${id}&chapter_id=${moduleId}`, {
        method: 'POST',
        body: formData,
      })
      if (res.success && res.material) {
        updateLessonUrl(moduleId, lessonId, res.material.url)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to upload file")
    }
  }

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId),
        }
      }
      return m
    }))
  }

  const removeModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)

  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const data = await apiFetch<any>(`/courses/${id}`)
          setTitle(data.title || '')
          setDescription(data.description || '')
          setCategory(data.category || '')
          setLevel(data.level || 'beginner')
          setLanguage(data.language || 'en')
          setThumbnail(data.image || data.thumbnail || '')
          
          if (data.chapters && data.chapters.length > 0) {
            setModules(data.chapters.map((ch: any) => ({
              id: ch.id,
              title: ch.title,
              lessons: (ch.modules || []).map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.hasPdf ? 'pdf' : (l.quiz ? 'quiz' : 'video'),
                url: l.url || ''
              }))
            })))
          } else {
             setModules([])
          }
        } catch (err) {
          console.error(err)
          alert("Failed to load course details")
        } finally {
          setInitialLoading(false)
        }
      }
      fetchCourse()
    }
  }, [id, isEditing])

  if (initialLoading) {
    return <div className="p-8 text-center">Loading course data...</div>
  }

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload a PNG or JPG image.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Thumbnail must be 5MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setThumbnail(String(reader.result || ''))
      setThumbnailName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const removeThumbnail = () => {
    setThumbnail('')
    setThumbnailName('')
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const courseRes = await apiFetch<any>(isEditing ? `/courses/${id}` : '/courses/', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          title,
          description,
          teacher_id: user?.id,
          price: 0,
          category,
          level,
          language,
          thumbnail: thumbnail || undefined,
          ...(isEditing && {
            chapters: modules.map(m => ({
              id: m.id,
              title: m.title,
              modules: m.lessons.map(l => ({
                id: l.id,
                title: l.title,
                completed: false,
                hasPdf: l.type === 'pdf' || l.type === 'quiz',
                url: l.url
              }))
            }))
          })
        }),
      })
      
      const courseId = isEditing ? id : courseRes.course?.id
      if (courseId) {
        // If editing, ideally we should update chapters/modules instead of blindly adding them.
        // For simplicity in this demo backend, we'll assume editing course metadata is primary.
        // But let's try to add chapters if it's a new course, or we can just send the chapters.
        // If it's a new course, we create chapters.
        if (!isEditing) {
          for (const mod of modules) {
            try {
              const chapRes = await apiFetch<any>(`/courses/${courseId}/chapters`, {
                method: 'POST',
                body: JSON.stringify({ title: mod.title }),
              })
              const chapterId = chapRes.chapter?.id
              if (chapterId && mod.lessons.length > 0) {
                for (const lesson of mod.lessons) {
                  await apiFetch(`/courses/${courseId}/chapters/${chapterId}/modules`, {
                    method: 'POST',
                    body: JSON.stringify({
                      title: lesson.title,
                      completed: false,
                      hasPdf: lesson.type === 'pdf' || lesson.type === 'quiz',
                      url: lesson.url
                    }),
                  })
                }
              }
            } catch (modErr) {
              console.error('Failed to save module:', modErr)
            }
          }
        }
      }
      
      navigate('/teacher/courses')
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to save course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">{isEditing ? 'Edit Course' : t('courses.createCourse')}</h1>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button onClick={() => navigate(`/courses/${id}`)} className="btn-secondary">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            {t('common.save')}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="label">{t('courses.courseTitle')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., Introduction to Machine Learning"
            />
          </div>
          <div>
            <label className="label">{t('courses.courseDescription')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[120px]"
              placeholder="Describe what students will learn..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">{t('courses.courseCategory')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="">Select category</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="design">Design</option>
                <option value="science">Science</option>
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">{t('courses.courseLanguage')}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">{t('courses.courseThumbnail')}</h2>
        {thumbnail ? (
          <div className="overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
            <div className="relative aspect-video bg-secondary-200">
              <img src={thumbnail} alt="Course thumbnail preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/70 text-white hover:bg-black"
                aria-label="Remove thumbnail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-2 text-sm text-secondary-700">
                <Image className="h-4 w-4 flex-shrink-0 text-primary-600" />
                <span className="truncate">{thumbnailName}</span>
              </div>
              <label className="btn-secondary btn-sm cursor-pointer">
                Replace
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleThumbnailChange} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <label className="block cursor-pointer rounded-lg border-2 border-dashed border-secondary-300 p-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/40">
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleThumbnailChange} className="hidden" />
            <div className="text-secondary-500">
              <Plus className="w-12 h-12 mx-auto mb-2" />
              <p>Click to upload</p>
              <p className="text-sm">PNG, JPG, or WEBP up to 5MB</p>
            </div>
          </label>
        )}
      </div>

      {/* Course Structure */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Course Structure</h2>
          <button onClick={addModule} className="btn-secondary">
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        <div className="space-y-4">
          {modules.map((module, _index) => (
            <div key={module.id} className="border border-secondary-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 bg-secondary-50 cursor-pointer"
                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              >
                <GripVertical className="w-5 h-5 text-secondary-400" />
                {expandedModule === module.id ? (
                  <ChevronDown className="w-5 h-5 text-secondary-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-secondary-600" />
                )}
                <span className="flex-1 font-medium text-secondary-900">{module.title}</span>
                <span className="text-sm text-secondary-500">{module.lessons.length} items</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeModule(module.id)
                  }}
                  className="p-1 hover:bg-secondary-200 rounded text-secondary-400 hover:text-secondary-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedModule === module.id && (
                <div className="p-4 border-t border-secondary-200 bg-white">
                  <div className="space-y-2 mb-4">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex flex-col gap-2 p-3 bg-secondary-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {lesson.type === 'video' && <Video className="w-4 h-4 text-primary-500" />}
                          {lesson.type === 'pdf' && <FileText className="w-4 h-4 text-accent-500" />}
                          {lesson.type === 'quiz' && <FileText className="w-4 h-4 text-warning-500" />}
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => {
                              setModules(modules.map(m => m.id === module.id ? {
                                ...m, lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l)
                              } : m))
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-secondary-700"
                            placeholder="Lesson Title"
                          />
                          <button
                            onClick={() => removeLesson(module.id, lesson.id)}
                            className="p-1 hover:bg-secondary-200 rounded text-secondary-400 hover:text-secondary-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 pl-7">
                          <input
                            type="text"
                            value={lesson.url || ''}
                            onChange={(e) => updateLessonUrl(module.id, lesson.id, e.target.value)}
                            placeholder={lesson.type === 'video' ? "Paste YouTube URL" : "Paste Link or Upload File ->"}
                            className="flex-1 input h-8 text-sm"
                          />
                          <label className={`btn-secondary btn-sm cursor-pointer whitespace-nowrap ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Upload File
                            <input
                              type="file"
                              className="hidden"
                              disabled={!id}
                              accept={lesson.type === 'video' ? "video/*" : ".pdf,.jpg,.png"}
                              onChange={(e) => {
                                if (!id) {
                                  alert("Please save the course first before uploading files.")
                                  return
                                }
                                handleLessonFileUpload(e, module.id, lesson.id)
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addLesson(module.id, 'video')}
                      className="btn-sm btn-secondary"
                    >
                      <Video className="w-3 h-3" />
                      Video
                    </button>
                    <button
                      onClick={() => addLesson(module.id, 'pdf')}
                      className="btn-sm btn-secondary"
                    >
                      <FileText className="w-3 h-3" />
                      PDF
                    </button>
                    <button
                      onClick={() => addLesson(module.id, 'quiz')}
                      className="btn-sm btn-secondary"
                    >
                      <FileText className="w-3 h-3" />
                      Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Course Builder */}
      {/* <div className="card p-6 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50">
        <h2 className="text-lg font-semibold text-secondary-900 mb-2">AI Course Builder</h2>
        <p className="text-secondary-600 mb-4">
          Let AI help you generate course content, summaries, and quizzes automatically.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Generate Summary', 'Create Flashcards', 'Generate Quiz', 'Study Notes'].map((item) => (
            <button key={item} className="btn-secondary text-sm">
              {item}
            </button>
          ))}
        </div>
      </div> */}
    </div>
  )
}
