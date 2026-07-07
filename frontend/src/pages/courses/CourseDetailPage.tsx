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
  const [courseData, setCourseData] = useState<any>(null)
  const [courseMaterials, setCourseMaterials] = useState<any[]>([])
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [data, materialsData, enrollRes] = await Promise.all([
           apiFetch<any>(`/courses/${id}`),
           apiFetch<any>(`/materials?course_id=${id}`),
           user ? apiFetch<any>(`/enrollments/user/${user.id}`).catch(() => null) : Promise.resolve(null)
        ])
        setCourseData(data)
        if (materialsData && materialsData.materials) {
          setCourseMaterials(materialsData.materials)
        }
        if (enrollRes && enrollRes.enrollments) {
          const enr = enrollRes.enrollments.find((e: any) => e.courseId === id)
          setEnrollment(enr)
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
      // Update enrollment state after successful enrollment
      setEnrollment({ progress: 0, courseId: id })
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
                <span className="font-semibold text-white">{courseData.rating || '4.5'}</span>
                <span>({(courseData.studentsCount || courseData.students || 0).toLocaleString()} students)</span>
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
                src={courseData.instructor?.avatar || 'https://ui-avatars.com/api/?name=Instructor&background=random'}
                alt={courseData.instructor?.name || 'Instructor'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-white">{courseData.instructor?.name || 'Instructor'}</p>
                <p className="text-sm text-secondary-300">{courseData.instructor?.bio || ''}</p>
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
                {(courseData.chapters || courseData.modules)?.reduce((acc: number, m: any) => acc + (m.modules?.length || 0), 0) || 0} lessons
              </span>
            </div>

            <div className="space-y-4">
              {(courseData.chapters || courseData.modules)?.map((chapter: any) => (
                <div key={chapter.id} className="border border-secondary-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedModule(expandedModule === chapter.id ? null : chapter.id)}
                    className="w-full flex items-center justify-between p-4 bg-secondary-50 hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedModule === chapter.id ? (
                        <ChevronDown className="w-5 h-5 text-secondary-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-secondary-600" />
                      )}
                      <span className="font-medium text-secondary-900">{chapter.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-secondary-600">
                      <span>{chapter.modules?.length || 0} lessons</span>
                      {chapter.quiz && (
                        <span className="px-2 py-0.5 bg-secondary-200 rounded text-xs">
                          {chapter.quiz.questions} questions
                        </span>
                      )}
                    </div>
                  </button>

                  {expandedModule === chapter.id && (
                    <div className="border-t border-secondary-200">
                      {chapter.modules?.map((lesson: any) => (
                        <Link
                          key={lesson.id}
                          to={`/learn/${id}/lesson/${lesson.id}`}
                          className={`flex items-center justify-between p-3 hover:bg-secondary-50 transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-accent-500" />
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
                      {chapter.quiz && (
                        <Link
                          to={`/learn/${id}/quiz/${chapter.quiz.id}`}
                          className={`flex items-center gap-3 p-3 border-t border-secondary-200 hover:bg-secondary-50 bg-primary-50`}
                        >
                          <FileText className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-primary-700">{chapter.quiz.title}</span>
                          <span className="text-sm text-secondary-600 ml-auto">
                            {chapter.quiz.questions} questions
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className={`mt-8 p-6 border rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
               enrollment?.progress === 100 
                 ? 'bg-accent-50 border-accent-200' 
                 : 'bg-secondary-50 border-secondary-200 opacity-90'
            }`}>
              <div>
                <h3 className={`font-bold flex items-center gap-2 ${enrollment?.progress === 100 ? 'text-accent-800' : 'text-secondary-800'}`}>
                  <Award className="w-5 h-5" />
                  Final AI Quiz & Certification
                </h3>
                <p className={`text-sm mt-1 ${enrollment?.progress === 100 ? 'text-accent-700' : 'text-secondary-600'}`}>
                  Pass the final AI generated assessment with 75%+ to earn your certificate and badges.
                </p>
                {/* Status Message */}
                {(!enrollment) && (
                   <p className="text-xs text-error-600 font-medium mt-2 flex items-center gap-1">
                     <Lock className="w-3 h-3" /> Please enroll in the course to unlock the final quiz.
                   </p>
                )}
                {(enrollment && enrollment.progress < 100) && (
                   <p className="text-xs text-warning-600 font-medium mt-2 flex items-center gap-1">
                     <Lock className="w-3 h-3" /> Complete all course modules to unlock the final quiz. (Current Progress: {enrollment.progress}%)
                   </p>
                )}
              </div>
              
              {enrollment?.progress === 100 ? (
                <Link to={`/learn/${id}/quiz/final`} className="btn-accent whitespace-nowrap shrink-0">
                  Take Final Quiz
                </Link>
              ) : (
                <button disabled className="btn-secondary whitespace-nowrap shrink-0 opacity-60 cursor-not-allowed flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Take Final Quiz
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-accent-600">Free</span>
            </div>

            {enrollment ? (
              <Link
                to={`/learn/${id}/lesson/${(courseData.chapters || courseData.modules)?.[0]?.modules?.[0]?.id || '1'}`}
                className="btn-primary w-full mb-4"
              >
                <PlayCircle className="w-5 h-5" />
                {t('courses.continueLearning')}
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                className="btn-primary w-full mb-4"
              >
                <PlayCircle className="w-5 h-5" />
                Enrollment
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

            {courseMaterials.length > 0 && (
              <div>
                <h4 className="font-medium text-secondary-900 mb-2">Resources</h4>
                <ul className="space-y-2">
                  {courseMaterials.map((resource: any, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                      <File className="w-4 h-4" />
                      <a href={resource.url?.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${resource.url}` : resource.url} target="_blank" rel="noreferrer" className="hover:text-primary-600 hover:underline truncate" title={resource.title}>
                        {resource.title}
                      </a>
                      <span className="text-secondary-400 ml-auto uppercase text-xs">{resource.type || resource.material_type}</span>
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
