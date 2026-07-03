import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../lib/language-context'
import { apiFetch } from '../../lib/api'
import { PageLoader } from '../../components/ui/PageLoader'
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Award,
  BarChart3,
} from 'lucide-react'

interface Question {
  id: string | number
  question: string
  type?: 'mcq' | 'true_false' | 'fill_blank'
  options?: string[]
  correctAnswerIndex?: number
  correctAnswer?: number | string
  explanation: string
}

export default function QuizPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string | number, number | string>>({})
  const [showResult, setShowResult] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [timeLeft] = useState(15 * 60)
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiFetch<any>('/assessments/generate-quiz', {
          method: 'POST',
          body: JSON.stringify({
            topic: 'Machine Learning basics',
            difficulty: 'standard',
            numQuestions: 5,
            course_id: courseId
          })
        })
        if (res.questions) {
           setQuestions(res.questions.map((q: any) => ({
             ...q,
             type: 'mcq',
             correctAnswer: q.correctAnswerIndex
           })))
        }
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [courseId])

  if (loading) {
    return <PageLoader type="detail" />
  }
  
  if (questions.length === 0) {
     return <div className="text-center p-8">Failed to load quiz.</div>
  }

  const question = questions[currentQuestion]
  const isAnswered = answers[question.id] !== undefined

  const handleAnswer = (answer: number | string) => {
    setAnswers({ ...answers, [question.id]: answer })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const score = calculateScore()
    try {
      const res = await apiFetch<any>('/assessments/submit-quiz', {
        method: 'POST',
        body: JSON.stringify({
          courseId,
          score,
        })
      })
      setSubmitResult(res)
    } catch(e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
      setShowResult(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  if (showResult) {
    const score = calculateScore()
    const passed = score >= 75

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            passed ? 'bg-accent-100' : 'bg-error-100'
          }`}>
            {passed ? (
              <Award className="w-10 h-10 text-accent-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-error-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className="text-secondary-600 mb-6">
            {passed
              ? `You passed the quiz with a score of ${score}%!`
              : `You scored ${score}%. You need 75% to pass.`}
          </p>

          <div className="bg-secondary-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-900">{score}%</p>
                <p className="text-sm text-secondary-600">{t('quizzes.yourScore')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-900">75%</p>
                <p className="text-sm text-secondary-600">{t('quizzes.passScore')}</p>
              </div>
            </div>
          </div>
          
          {submitResult?.certificate && (
            <div className="mb-6 p-6 border-2 border-accent-200 bg-accent-50 rounded-xl text-left">
              <h3 className="text-lg font-bold text-accent-800 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" /> 
                Certificate Earned!
              </h3>
              <p className="text-sm text-accent-700 mb-1"><strong>Name:</strong> {submitResult.certificate.studentName}</p>
              <p className="text-sm text-accent-700 mb-1"><strong>Course:</strong> {submitResult.certificate.courseName}</p>
              <p className="text-sm text-accent-700"><strong>Date:</strong> {submitResult.certificate.date}</p>
            </div>
          )}

          {submitResult?.badges?.length > 0 && (
            <div className="mb-8 flex flex-col items-center">
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">Milestone Badges Unlocked</h4>
              <div className="flex gap-4 justify-center">
                {submitResult.badges.map((b: string, i: number) => (
                  <div key={i} className="flex flex-col items-center bg-white p-3 rounded-lg border border-secondary-200 shadow-sm">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium text-secondary-800">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setShowResult(false)
                setAnswers({})
                setCurrentQuestion(0)
              }}
              className="btn-secondary"
            >
              {t('quizzes.retakeQuiz')}
            </button>
            <button
              onClick={() => setReviewMode(true)}
              className="btn-primary"
            >
              {t('quizzes.quizResults')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (reviewMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Quiz Review</h2>
          {questions.map((q, index) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correctAnswer

            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg mb-4 ${
                  isCorrect ? 'bg-accent-50 border border-accent-200' : 'bg-error-50 border border-error-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-accent-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">
                      {index + 1}. {q.question}
                    </p>
                    {q.type === 'mcq' && q.options && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt, i) => (
                          <p
                            key={i}
                            className={`text-sm ${
                              i === q.correctAnswer
                                ? 'text-accent-700 font-medium'
                                : i === userAnswer
                                ? 'text-error-600'
                                : 'text-secondary-600'
                            }`}
                          >
                            {i === userAnswer && 'Your answer: '}
                            {i === q.correctAnswer && i !== userAnswer && 'Correct answer: '}
                            {opt}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-secondary-600 mt-2 italic">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="btn-primary w-full"
          >
            {t('common.back')} to Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-secondary-900">AI Generated Quiz</h1>
            <p className="text-secondary-600">Test your knowledge</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-secondary-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              {Object.keys(answers).length}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          {isAnswered && (
            <span className="text-sm text-accent-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Answered
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-secondary-900 mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.type === 'mcq' && question.options && (
            question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === index
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    answers[question.id] === index
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-secondary-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={answers[question.id] === index ? 'text-secondary-900 font-medium' : 'text-secondary-700'}>
                    {option}
                  </span>
                </span>
              </button>
            ))
          )}

          {question.type === 'true_false' && (
            <>
              {['True', 'False'].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[question.id] === index
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[question.id] === index
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-secondary-300'
                    }`}>
                      {answers[question.id] === index && <CheckCircle className="w-4 h-4" />}
                    </span>
                    <span className={answers[question.id] === index ? 'text-secondary-900 font-medium' : 'text-secondary-700'}>
                      {option}
                    </span>
                  </span>
                </button>
              ))}
            </>
          )}

          {question.type === 'fill_blank' && (
            <input
              type="text"
              value={answers[question.id]?.toString() || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="input text-lg"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                currentQuestion === index
                  ? 'bg-primary-600 text-white'
                  : answers[questions[index].id] !== undefined
                  ? 'bg-accent-100 text-accent-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {t('quizzes.submitQuiz')}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            className="btn-primary"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
