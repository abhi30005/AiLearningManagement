import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import { PageLoader } from '../../components/ui/PageLoader'
import {
  PlayCircle,
  Clock,
  Star,
  BookOpen,
  FileText,
  Award,
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle,
  Video,
  File,
} from 'lucide-react'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const { user } = useAuth()
  const [expandedModule, setExpandedModule] = useState<number | null>(1)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [courseData, setCourseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiFetch<any>(`/courses/${id}`)
        setCourseData(data)
        
        if (user) {
          const enrRes = await apiFetch<any>(`/enrollments/user/${user.id}`)
          if (enrRes.enrollments?.some((e: any) => e.courseId === id)) {
            setIsEnrolled(true)
          }
        }
      } catch (error) {
        console.error('Error fetching course details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id, user])

  const handleEnroll = async () => {
    if (!user) return
    try {
      await apiFetch('/enrollments/', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, courseId: id })
      })
      setIsEnrolled(true)
    } catch (error) {
      console.error('Enrollment failed', error)
    }
  }

  if (loading) {
    return <PageLoader type="detail" />
  }

  if (!courseData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-secondary-900">Course not found</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
            <img
              src={courseData.thumbnail || courseData.image}
            alt={courseData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/90 via-secondary-900/70 to-secondary-900/50" />
        </div>
        <div className="relative py-12 px-8 md:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                {courseData.category}
              </span>
              <span className="px-3 py-1 bg-secondary-700 text-white text-sm rounded-full">
                {courseData.level}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{courseData.title}</h1>
            <p className="text-lg text-secondary-200 mb-6">{courseData.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-secondary-200 mb-6">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning-400 fill-warning-400" />
                <span className="font-semibold text-white">{courseData.rating}</span>
                <span>({courseData.students.toLocaleString()} students)</span>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {courseData.duration}
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {courseData.lessons} lessons
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificate
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={courseData.instructor.avatar}
                alt={courseData.instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-white">{courseData.instructor.name}</p>
                <p className="text-sm text-secondary-300">{courseData.instructor.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* What You'll Learn */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Understand ML fundamentals and algorithms',
                'Build and train neural networks',
                'Implement supervised and unsupervised learning',
                'Work with real-world datasets',
                'Apply ML to solve practical problems',
                'Evaluate model performance',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Curriculum */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">Course Curriculum</h2>
              <span className="text-sm text-secondary-600">
                {courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0} lessons
              </span>
            </div>

            <div className="space-y-4">
              {courseData.modules?.map((module: any) => (
                <div key={module.id} className="border border-secondary-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    className="w-full flex items-center justify-between p-4 bg-secondary-50 hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedModule === module.id ? (
                        <ChevronDown className="w-5 h-5 text-secondary-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-secondary-600" />
                      )}
                      <span className="font-medium text-secondary-900">{module.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-secondary-600">
                      <span>{module.lessons?.length || 0} lessons</span>
                      {module.quiz && (
                        <span className="px-2 py-0.5 bg-secondary-200 rounded text-xs">
                          {module.quiz.questions} questions
                        </span>
                      )}
                    </div>
                  </button>

                  {expandedModule === module.id && (
                    <div className="border-t border-secondary-200">
                      {module.lessons?.map((lesson: any) => (
                        <Link
                          key={lesson.id}
                          to={isEnrolled ? `/learn/${id}/lesson/${lesson.id}` : '#'}
                          className={`flex items-center justify-between p-3 hover:bg-secondary-50 transition-colors ${
                            !isEnrolled ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-accent-500" />
                            ) : !isEnrolled ? (
                              <Lock className="w-5 h-5 text-secondary-400" />
                            ) : lesson.type === 'video' ? (
                              <Video className="w-5 h-5 text-primary-500" />
                            ) : (
                              <File className="w-5 h-5 text-warning-500" />
                            )}
                            <span className={lesson.completed ? 'text-secondary-900' : ''}>
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-sm text-secondary-500">{lesson.duration}</span>
                        </Link>
                      ))}
                      {module.quiz && (
                        <Link
                          to={isEnrolled ? `/learn/${id}/quiz/${module.quiz.id}` : '#'}
                          className={`flex items-center gap-3 p-3 border-t border-secondary-200 hover:bg-secondary-50 bg-primary-50 ${
                            !isEnrolled ? 'opacity-60' : ''
                          }`}
                        >
                          <FileText className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-primary-700">{module.quiz.title}</span>
                          <span className="text-sm text-secondary-600 ml-auto">
                            {module.quiz.questions} questions
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {isEnrolled && (
              <div className="mt-8 p-6 bg-accent-50 border border-accent-200 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-accent-800 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Final AI Quiz & Certification
                  </h3>
                  <p className="text-sm text-accent-700 mt-1">
                    Pass the final AI generated assessment with 75%+ to earn your certificate and badges.
                  </p>
                </div>
                <Link to={`/learn/${id}/quiz/final`} className="btn-accent whitespace-nowrap">
                  Take Final Quiz
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-accent-600">Free</span>
            </div>

            {isEnrolled ? (
              <Link
                to={`/learn/${id}/lesson/1`}
                className="btn-primary w-full mb-4"
              >
                <PlayCircle className="w-5 h-5" />
                {t('courses.continueLearning')}
              </Link>
            ) : (
              <button onClick={handleEnroll} className="btn-accent w-full mb-4">
                {t('courses.enroll')}
              </button>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-secondary-600">
                <Clock className="w-4 h-4" />
                <span>{courseData.duration} of content</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-600">
                <BookOpen className="w-4 h-4" />
                <span>{courseData.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-600">
                <Star className="w-4 h-4" />
                <span>{courseData.rating} rating</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-600">
                <Award className="w-4 h-4" />
                <span>Certificate of completion</span>
              </div>
            </div>

            <hr className="my-4 border-secondary-200" />

            {courseData.resources && courseData.resources.length > 0 && (
              <div>
                <h4 className="font-medium text-secondary-900 mb-2">Resources</h4>
                <ul className="space-y-2">
                  {courseData.resources.map((resource: any, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                      <File className="w-4 h-4" />
                      <span>{resource.name}</span>
                      <span className="text-secondary-400 ml-auto">{resource.size}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
