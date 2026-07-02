import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

interface Module {
  id: string
  title: string
  lessons: { id: string; title: string; type: 'video' | 'pdf' | 'quiz' }[]
}

export default function CreateCoursePage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('beginner')
  const [language, setLanguage] = useState('en')
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
            },
          ],
        }
      }
      return m
    }))
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

  const handleSave = async () => {
    setLoading(true)
    try {
      await apiFetch('/courses/', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          instructor_id: 'current-user-id', // The backend will use the authenticated user
          price: 0,
          category,
          level,
          language
        }),
      })
      navigate('/courses')
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">{t('courses.createCourse')}</h1>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Eye className="w-4 h-4" />
            Preview
          </button>
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
        <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
          <div className="text-secondary-500">
            <Plus className="w-12 h-12 mx-auto mb-2" />
            <p>Click to upload or drag and drop</p>
            <p className="text-sm">PNG, JPG up to 5MB</p>
          </div>
        </div>
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
                      <div key={lesson.id} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                        {lesson.type === 'video' && <Video className="w-4 h-4 text-primary-500" />}
                        {lesson.type === 'pdf' && <FileText className="w-4 h-4 text-accent-500" />}
                        {lesson.type === 'quiz' && <FileText className="w-4 h-4 text-warning-500" />}
                        <input
                          type="text"
                          value={lesson.title}
                          className="flex-1 bg-transparent border-none outline-none text-secondary-700"
                        />
                        <button
                          onClick={() => removeLesson(module.id, lesson.id)}
                          className="p-1 hover:bg-secondary-200 rounded text-secondary-400 hover:text-secondary-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      <div className="card p-6 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50">
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
      </div>
    </div>
  )
}
