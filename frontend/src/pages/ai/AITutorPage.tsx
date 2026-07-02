import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import {
  Send,
  Copy,
  RefreshCw,
  Trash2,
  Mic,
  Volume2,
  Sparkles,
  MessageSquare,
  FileText,
  Youtube,
  Plus,
} from 'lucide-react'

const suggestedQuestions = [
  'Explain this concept in simple terms',
  'Give me practice problems',
  'What are the key takeaways?',
  'How does this relate to real-world applications?',
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AITutorPage() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Tutor. I can help you understand any topic from your courses, explain difficult concepts, generate practice problems, or answer questions about your learning materials. What would you like to explore today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showHistory] = useState(true)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user?.id) {
      apiFetch<any>(`/tutor/history/${user.id}`).then(res => {
        if (res.history) {
          // Format for sidebar
          const formatted = res.history.map((h: any) => ({
            id: h.id,
            title: h.sender === 'user' ? 'Question' : 'Response',
            preview: h.message.substring(0, 30) + '...',
            time: h.createdAt ? h.createdAt.substring(0, 10) : 'Just now'
          }))
          setChatHistory(formatted)
        }
      }).catch(console.error)
    }
  }, [user])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const res = await apiFetch<any>('/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || 'guest',
          message: userMessage.content,
          document_id: 'general',
          language: language
        })
      })

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response || 'Sorry, I could not process that request.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      
      // Update history
      setChatHistory([{
        id: Date.now().toString(),
        title: 'Question',
        preview: userMessage.content.substring(0, 30) + '...',
        time: 'Just now'
      }, ...chatHistory])
    } catch (e) {
      console.error(e)
    } finally {
      setIsTyping(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Starting a new conversation! What would you like to learn about?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-64 border-r border-secondary-200 bg-white p-4">
          <button onClick={handleNewChat} className="btn-primary w-full mb-4">
            <Plus className="w-4 h-4" />
            {t('aiTutor.newChat')}
          </button>

          <h3 className="text-sm font-medium text-secondary-600 mb-3">{t('aiTutor.chatHistory')}</h3>
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-start gap-2 p-3 rounded-lg hover:bg-secondary-50 text-left transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-secondary-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">{chat.title}</p>
                  <p className="text-xs text-secondary-500 truncate">{chat.preview}</p>
                  <p className="text-xs text-secondary-400">{chat.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-secondary-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-secondary-900">{t('aiTutor.title')}</h1>
                <p className="text-sm text-secondary-600">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary btn-sm">
                <FileText className="w-4 h-4" />
                Chat with PDF
              </button>
              <button className="btn-secondary btn-sm">
                <Youtube className="w-4 h-4" />
                Chat with Video
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white border border-secondary-200 text-secondary-900 rounded-2xl rounded-bl-sm shadow-sm'
                } p-4`}
              >
                <div className="prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className={message.role === 'user'? 'text-white' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-secondary-100">
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1.5 hover:bg-secondary-100 rounded-lg text-secondary-500"
                      title={t('aiTutor.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-secondary-100 rounded-lg text-secondary-500"
                      title={t('aiTutor.regenerate')}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-secondary-100 rounded-lg text-secondary-500">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-secondary-200 rounded-2xl rounded-bl-sm shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <p className="text-sm text-secondary-600 mb-2">{t('aiTutor.suggestedQuestions')}</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 rounded-full text-sm text-secondary-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-secondary-200 bg-white p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={t('aiTutor.askQuestion')}
                className="input min-h-[48px] max-h-[120px] resize-none pr-24"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording ? 'bg-error-100 text-error-600' : 'hover:bg-secondary-100 text-secondary-500'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              className="p-3 hover:bg-secondary-100 rounded-lg text-secondary-500"
              title={t('aiTutor.clear')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
