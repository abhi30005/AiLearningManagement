import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/language-context'
import { useAuth } from '../../lib/auth-context'
import {
  Search,
  Grid,
  List,
  Star,
  Users,
  Clock,
  BookOpen,
  Filter,
} from 'lucide-react'
import { apiFetch } from '../../lib/api'
import { useEffect } from 'react'



const categories = ['All', 'Technology', 'Business', 'Design', 'Development', 'Science']
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function CoursesPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch<any[]>('/courses/')
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('courses.allCourses')}</h1>
          <p className="text-secondary-600">Explore {courses.length}+ courses to enhance your skills</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Link to="/courses/new" className="btn-primary">
            <BookOpen className="w-4 h-4" />
            {t('courses.createCourse')}
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search') + ' courses...'}
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary hidden lg:flex"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center rounded-lg border border-secondary-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-secondary-100' : ''}`}
              >
                <Grid className="w-4 h-4 text-secondary-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-secondary-100' : ''}`}
              >
                <List className="w-4 h-4 text-secondary-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        {(showFilters || true) && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-secondary-200">
            <div>
              <label className="text-xs text-secondary-500 mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input text-sm py-2"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary-500 mb-1 block">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="input text-sm py-2"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Course Grid/List */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {filteredCourses.map((course) => (
          viewMode === 'grid' ? (
            <Link key={course.id} to={`/courses/${course.id}`} className="card-hover overflow-hidden group">
              <div className="relative h-48">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 rounded-md text-xs font-medium text-secondary-700">
                    {course.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-accent-500 text-white rounded-md text-xs font-medium">
                    {course.price}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    {course.level}
                  </span>
                </div>
                <h3 className="font-semibold text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{course.description}</p>

                <div className="flex items-center gap-2 mt-3 text-sm text-secondary-600">
                  <span className="font-medium text-secondary-900">{course.instructor}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100">
                  <div className="flex items-center gap-4 text-xs text-secondary-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.students.toLocaleString()}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-secondary-500">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <Link key={course.id} to={`/courses/${course.id}`} className="card-hover p-4 flex gap-4">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-40 h-28 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    {course.level}
                  </span>
                  <span className="text-xs text-secondary-500">{course.category}</span>
                </div>
                <h3 className="font-semibold text-secondary-900">{course.title}</h3>
                <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-secondary-500">
                  <span>By {course.instructor}</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />
                    {course.rating}
                  </span>
                  <span>{course.students.toLocaleString()} students</span>
                  <span>{course.lessons} lessons</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="text-accent-600 font-semibold">{course.price}</span>
                <button className="btn-primary btn-sm">
                  {t('courses.enroll')}
                </button>
              </div>
            </Link>
          )
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900">No courses found</h3>
          <p className="text-secondary-600 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
