import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react'

const categories = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Programming, software development, and IT skills',
    courses: 45,
    icon: '💻',
  },
  {
    id: 2,
    name: 'Business',
    slug: 'business',
    description: 'Business strategy, management, and entrepreneurship',
    courses: 28,
    icon: '📊',
  },
  {
    id: 3,
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design, graphic design, and visual arts',
    courses: 22,
    icon: '🎨',
  },
  {
    id: 4,
    name: 'Science',
    slug: 'science',
    description: 'Physics, chemistry, biology, and mathematics',
    courses: 18,
    icon: '🔬',
  },
  {
    id: 5,
    name: 'Languages',
    slug: 'languages',
    description: 'Foreign language learning and communication',
    courses: 15,
    icon: '🌐',
  },
  {
    id: 6,
    name: 'Health & Wellness',
    slug: 'health',
    description: 'Fitness, nutrition, and mental health',
    courses: 12,
    icon: '💪',
  },
]

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [, setIsEditing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
          <p className="text-secondary-600">Organize courses into categories</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-secondary-600">Total Categories</p>
          <p className="text-2xl font-bold text-secondary-900">{categories.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-secondary-600">Total Courses</p>
          <p className="text-2xl font-bold text-secondary-900">
            {categories.reduce((sum, cat) => sum + cat.courses, 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-secondary-600">Avg. Courses/Category</p>
          <p className="text-2xl font-bold text-secondary-900">
            {Math.round(categories.reduce((sum, cat) => sum + cat.courses, 0) / categories.length)}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="card p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold text-secondary-900">{category.name}</h3>
                  <p className="text-xs text-secondary-500">{category.slug}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="p-1.5 hover:bg-secondary-100 rounded-lg"
                >
                  <MoreVertical className="w-4 h-4 text-secondary-400" />
                </button>

                {selectedCategory === category.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-secondary-600 mb-4">{category.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
              <span className="text-sm text-secondary-500">
                {category.courses} courses
              </span>
              <button className="text-sm text-primary-600 font-medium hover:underline">
                View courses
              </button>
            </div>
          </div>
        ))}

        {/* Add Category Card */}
        <div className="card border-dashed border-2 flex items-center justify-center min-h-[180px] hover:border-primary-400 hover:bg-primary-50/50 transition-colors cursor-pointer">
          <div className="text-center">
            <Plus className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
            <p className="font-medium text-secondary-700">Add Category</p>
          </div>
        </div>
      </div>
    </div>
  )
}
