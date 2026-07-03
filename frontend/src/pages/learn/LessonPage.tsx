import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  const { t } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTab, setCurrentTab] = useState<'content' | 'notes'>('content')
  const [sidebarTab, setSidebarTab] = useState<'curriculum' | 'tutor'>('tutor')
  const [showSidebar] = useState(true)

  const [lessons, setLessons] = useState<any[]>([])
  const [course, setCourse] = useState<any>(null)
  const [notes, setNotes] = useState<string>('Loading notes...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiFetch<any>(`/courses/${courseId}`)
        setCourse(data)
        
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
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId, lessonId])

  const currentLessonIndex = lessons.findIndex((l) => String(l.id) === String(lessonId))
  const currentLesson = lessons[currentLessonIndex] || {}

  if (loading) {
    return <PageLoader type="detail" />
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="relative bg-secondary-900 aspect-video">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Lesson thumbnail"
              className="w-full h-full object-cover opacity-50"
            />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-secondary-900" />
                ) : (
                  <Play className="w-8 h-8 text-secondary-900 ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1 bg-secondary-600 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary-500 rounded-full" />
              </div>
              <span className="text-sm text-white">5:12 / 15:30</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-200">
          <div className="flex">
            {[
              { id: 'content', label: 'Content' },
              { id: 'notes', label: 'AI Notes' },
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
                Welcome to this module. Please watch the video to complete this lesson.
              </p>
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
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-secondary-200 p-4 flex items-center justify-between bg-white">
          <button
            disabled={currentLessonIndex <= 0}
            className="btn-secondary disabled:opacity-50"
            onClick={() => window.location.href = `/learn/${courseId}/lesson/${lessons[currentLessonIndex - 1]?.id}`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button className="btn-accent">
            <CheckCircle className="w-4 h-4" />
            Mark Complete
          </button>
          <button
            disabled={currentLessonIndex >= lessons.length - 1}
            className="btn-primary disabled:opacity-50"
            onClick={() => window.location.href = `/learn/${courseId}/lesson/${lessons[currentLessonIndex + 1]?.id}`}
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
              <div className="p-4 space-y-2">
                {lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    to={`/learn/${courseId}/lesson/${lesson.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      String(lesson.id) === String(lessonId)
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-secondary-50 text-secondary-700'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-accent-500" />
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-secondary-300 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                      )}
                    </span>
                    <span className="flex-1 text-sm truncate">{lesson.title}</span>
                    <span className="text-xs text-secondary-500">{lesson.duration}</span>
                  </Link>
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
