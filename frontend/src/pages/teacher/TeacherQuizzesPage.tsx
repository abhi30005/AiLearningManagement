import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { Brain, FileText, CheckCircle, HelpCircle } from 'lucide-react'

export default function TeacherQuizzesPage() {
  const { user } = useAuth()
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('standard')
  const [numQuestions, setNumQuestions] = useState(5)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch<any[]>(`/courses/teacher/${user?.id || 'current'}`)
        setCourses(data || [])
        if (data && data.length > 0) {
          setSelectedCourse(data[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch courses', err)
      }
    }
    if (user) fetchCourses()
  }, [user])

  const handleGenerate = async () => {
    if (!topic) return
    setLoading(true)
    try {
      const res = await apiFetch<any>('/assessments/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          difficulty,
          numQuestions
        })
      })
      if (res.questions) {
        setQuestions(res.questions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedCourse || questions.length === 0) return
    try {
      await apiFetch('/assessments/assignments', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourse,
          title: `Quiz: ${topic}`,
          instructions: JSON.stringify(questions, null, 2),
          teacherId: user?.id
        })
      })
      alert("Quiz saved and published as an assignment!")
    } catch (err) {
      console.error(err)
      alert("Failed to save quiz.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Quiz Management</h1>
        <p className="text-secondary-600">Create AI-generated quizzes or author them manually.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary-600" />
              AI Quiz Generator
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Topic / Subject</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. React Hooks, Python Basics..."
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)} 
                  className="input w-full"
                >
                  <option value="beginner">Beginner</option>
                  <option value="standard">Standard</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Number of Questions (1-8)</label>
                <input 
                  type="number" 
                  min="1" max="8" 
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="input w-full"
                />
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={loading || !topic} 
                className="btn-primary w-full justify-center mt-2"
              >
                {loading ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {questions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Generated Preview</h3>
                <div className="flex gap-2">
                  <select 
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input py-1 px-3 h-auto"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <button onClick={handlePublish} className="btn-accent">Save & Publish Quiz</button>
                </div>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="card p-5">
                  <p className="font-medium text-secondary-900 mb-3">
                    <span className="text-primary-600 mr-2">Q{i + 1}.</span> 
                    {q.question}
                  </p>
                  <div className="space-y-2 pl-6">
                    {q.options.map((opt: string, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border ${idx === q.correctAnswerIndex ? 'border-accent-500 bg-accent-50' : 'border-secondary-200 bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${idx === q.correctAnswerIndex ? 'border-accent-500 text-accent-600 font-bold bg-accent-100' : 'border-secondary-300'}`}>
                            {idx === q.correctAnswerIndex && <CheckCircle className="w-3 h-3" />}
                          </div>
                          <span className={idx === q.correctAnswerIndex ? 'font-medium text-accent-900' : 'text-secondary-700'}>
                            {opt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-4 pl-6 flex items-start gap-2 text-sm text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                      <HelpCircle className="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="card h-full flex items-center justify-center min-h-[400px]">
               <div className="text-center">
                 <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-secondary-900">No Quiz Generated</h3>
                 <p className="text-secondary-600 mt-2">Use the AI generator on the left to quickly build an assessment.</p>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
