import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { PageLoader } from '../../components/ui/PageLoader'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  Brain,
  MessageSquare,
  Volume2,
  Settings,
  Maximize,
  SkipBack,
  SkipForward,
} from 'lucide-react'



export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTab, setCurrentTab] = useState<'content' | 'notes' | 'resources'>('content')
  const [sidebarTab, setSidebarTab] = useState<'curriculum' | 'tutor'>('tutor')
  const [showSidebar] = useState(true)

  const [lessons, setLessons] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [course, setCourse] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [notes, setNotes] = useState<string>('Loading notes...')
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [courseMaterials, setCourseMaterials] = useState<any[]>([])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiFetch<any>(`/courses/${courseId}`)
        setCourse(data)
        setChapters(data.chapters || [])
        
        let allLessons: any[] = []
        if (data.chapters) {
           data.chapters.forEach((chapter: any) => {
             if (chapter.modules) {
               allLessons = [...allLessons, ...chapter.modules]
             }
           })
        }
        setLessons(allLessons)
        
        // Fetch AI Notes
        const summary = await apiFetch<any>(`/tutor/chapter-summary?chapter_id=${lessonId || 'default'}`, { method: 'POST' })
        setNotes(summary.summary || 'No notes available.')

        // Fetch Materials
        const materialsData = await apiFetch<any>(`/materials?course_id=${courseId}`)
        if (materialsData && materialsData.materials) {
           setCourseMaterials(materialsData.materials)
        }

        if (user) {
          const enrData = await apiFetch<any>(`/enrollments/user/${user.id}`)
          if (enrData && enrData.enrollments) {
            const courseEnr = enrData.enrollments.find((e: any) => e.courseId === courseId)
            if (courseEnr) setEnrollment(courseEnr)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId, lessonId, user])

  const currentLessonIndex = lessons.findIndex((l) => String(l.id) === String(lessonId))
  const currentLesson = lessons[currentLessonIndex] || {}
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const getResourceUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('/')) return `${API_URL}${url}`
    return url
  }
  
  const getYouTubeId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)
    return match ? match[1] : null
  }

  const handleMarkComplete = async () => {
    if (completing || !currentLesson.id) return
    setCompleting(true)
    try {
      const res = await apiFetch<any>(`/enrollments/${courseId}/lessons/${currentLesson.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id })
      })
      if (res.success && res.enrollment) {
        setEnrollment(res.enrollment)
        // Auto-navigate to next if available
        if (currentLessonIndex < lessons.length - 1) {
          navigate(`/learn/${courseId}/lesson/${lessons[currentLessonIndex + 1]?.id}`)
        }
      }
    } catch (e) {
      console.error(e)
      alert("Failed to mark complete")
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return <PageLoader type="detail" />
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Media Player Area */}
        {currentLesson?.type === 'youtube' && currentLesson?.url ? (
          <div className="relative bg-black aspect-video w-full">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(currentLesson.url)}`}
              allowFullScreen
              title={currentLesson.title}
            />
          </div>
        ) : (currentLesson?.type === 'website' || currentLesson?.type === 'doc') && currentLesson?.url ? (
          <div className="relative bg-secondary-100 flex flex-col flex-1 min-h-[500px]">
             {/* Top bar for opening in new tab if iframe blocked */}
             <div className="bg-white p-2 border-b border-secondary-200 flex justify-end">
               <a href={getResourceUrl(currentLesson.url)} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                 <Maximize className="w-4 h-4" /> Open in New Tab
               </a>
             </div>
             <iframe
                className="w-full h-full flex-1"
                src={getResourceUrl(currentLesson.url)}
                title={currentLesson.title}
             />
          </div>
        ) : (
          <div className="relative bg-secondary-900 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={course?.thumbnail || course?.image || "https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=800"}
                alt="Lesson thumbnail"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <FileText className="w-12 h-12 mb-2 text-secondary-300" />
                <p className="text-lg font-medium text-secondary-200">No media attached to this lesson.</p>
                <p className="text-sm text-secondary-400">Please review the content below.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-secondary-200">
          <div className="flex">
            {[
              { id: 'content', label: 'Content' },
              { id: 'notes', label: 'AI Notes' },
              { id: 'resources', label: 'Resources' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as typeof currentTab)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  currentTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {tab.id === 'notes' && <FileText className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {currentTab === 'content' && (
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold text-secondary-900">{currentLesson?.title || 'Lesson'}</h1>
              <p className="text-secondary-600 mt-4">
                Welcome to this module. Please review the material to complete this lesson.
              </p>
              {currentLesson?.url && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100 flex items-center justify-between not-prose">
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Lesson Resource</h3>
                    <p className="text-sm text-primary-700">Access the attached material or link for this lesson.</p>
                  </div>
                  <a href={getResourceUrl(currentLesson.url)} target="_blank" rel="noreferrer" className="btn-primary whitespace-nowrap">
                    Open Resource
                  </a>
                </div>
              )}
            </div>
          )}

          {currentTab === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">AI-Generated Notes</h2>
                <button className="btn-secondary btn-sm">
                  {t('common.download')}
                </button>
              </div>
              <div className="prose max-w-none bg-secondary-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm text-secondary-700">{notes}</pre>
              </div>
            </div>
          )}

          {currentTab === 'resources' && (
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Course Materials</h2>
              {courseMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseMaterials.map((m, i) => (
                    <a key={i} href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors border border-secondary-200">
                      <div className="p-2 bg-white rounded-lg text-secondary-600">
                         {m.material_type === 'youtube' ? <Play className="w-5 h-5 text-error-600" /> : <FileText className="w-5 h-5 text-primary-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="font-medium text-secondary-900 truncate">{m.title}</p>
                         <p className="text-xs text-secondary-500 uppercase">{m.type || m.material_type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-600">No materials available for this course.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-secondary-200 p-4 flex items-center justify-between bg-white">
          <button
            disabled={currentLessonIndex <= 0}
            className="btn-secondary disabled:opacity-50"
            onClick={() => navigate(`/learn/${courseId}/lesson/${lessons[currentLessonIndex - 1]?.id}`)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button 
            disabled={completing || enrollment?.lessonsCompleted?.includes(currentLesson.id)}
            className="btn-accent"
            onClick={handleMarkComplete}
          >
            <CheckCircle className="w-4 h-4" />
            {enrollment?.lessonsCompleted?.includes(currentLesson.id) ? 'Completed' : 'Mark Complete'}
          </button>
          <button
            disabled={currentLessonIndex >= lessons.length - 1}
            className="btn-primary disabled:opacity-50"
            onClick={() => navigate(`/learn/${courseId}/lesson/${lessons[currentLessonIndex + 1]?.id}`)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 lg:w-96 border-l border-secondary-200 bg-white flex flex-col">
          <div className="flex border-b border-secondary-200">
            <button
              onClick={() => setSidebarTab('curriculum')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                sidebarTab === 'curriculum'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setSidebarTab('tutor')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                sidebarTab === 'tutor'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Brain className="w-4 h-4" /> AI Tutor
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'curriculum' ? (
              <div className="space-y-4 p-4">
                {chapters.map((chapter: any, chapIndex: number) => (
                  <div key={chapter.id}>
                    <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">
                      Chapter {chapIndex + 1}: {chapter.title}
                    </h3>
                    <div className="space-y-1">
                      {chapter.modules?.map((lesson: any, index: number) => {
                        const isCompleted = enrollment?.lessonsCompleted?.includes(lesson.id)
                        const isCurrent = String(lesson.id) === String(lessonId)
                        return (
                          <Link
                            key={lesson.id}
                            to={`/learn/${courseId}/lesson/${lesson.id}`}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isCurrent
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'hover:bg-secondary-50 text-secondary-700'
                            }`}
                          >
                            <span className="text-sm">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-accent-500" />
                              ) : (
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${isCurrent ? 'border-primary-500' : 'border-secondary-300'}`}>
                                  {index + 1}
                                </span>
                              )}
                            </span>
                            <span className="flex-1 text-sm truncate">{lesson.title}</span>
                            <span className="text-xs text-secondary-500">{lesson.type}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full p-4 flex flex-col">
                <AITutorChat />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AITutorChat() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI tutor. I can help you understand the concepts in this lesson. What would you like to know?" },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsTyping(true)
    
    try {
      const res = await apiFetch<any>('/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || 'guest',
          message: userMsg,
          document_id: 'lesson_context',
          language: language
        })
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.response || 'Sorry, I could not process that request.' }])
    } catch (e) {
      console.error(e)
      setMessages(prev => [...prev, { role: 'assistant', content: 'There was an error communicating with the AI Tutor.' }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="max-w-[80%] p-4 rounded-2xl bg-secondary-100 text-secondary-900">
                ...
             </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('aiTutor.askQuestion')}
          className="input flex-1"
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping} className="btn-primary disabled:opacity-50">
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
