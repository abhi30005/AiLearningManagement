import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ id: '', name: '', slug: '', description: '', icon: '📁' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<any>('/categories')
      setCategories(data.categories || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCategory = async () => {
    try {
      if (formData.id) {
        // Update
        const res = await apiFetch<any>(`/categories/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon
          })
        })
        if (res.success) {
          setCategories(categories.map(c => c.id === formData.id ? res.category : c))
        }
      } else {
        // Create
        const res = await apiFetch<any>('/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon
          })
        })
        if (res.success) {
          setCategories([...categories, res.category])
        }
      }
      setShowForm(false)
      setFormData({ id: '', name: '', slug: '', description: '', icon: '📁' })
    } catch (err) {
      console.error(err)
      alert("Failed to save category")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' })
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete category")
    }
  }

  const startEdit = (cat: any) => {
    setFormData({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '📁' })
    setShowForm(true)
    setSelectedCategory(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
          <p className="text-secondary-600">Organize courses into categories</p>
        </div>
        <button onClick={() => { setShowForm(true); setFormData({ id: '', name: '', slug: '', description: '', icon: '📁' }) }} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="card p-5 border-l-4 border-primary-500">
          <h3 className="text-lg font-semibold mb-3">{formData.id ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
               <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
               <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input w-full" />
            </div>
            <div>
               <label className="block text-sm font-medium text-secondary-700 mb-1">Slug</label>
               <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="input w-full" />
            </div>
            <div>
               <label className="block text-sm font-medium text-secondary-700 mb-1">Icon (Emoji)</label>
               <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="input w-full" />
            </div>
            <div>
               <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
               <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveCategory} className="btn-primary">Save Category</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-secondary-600">Total Categories</p>
          <p className="text-2xl font-bold text-secondary-900">{categories.length}</p>
        </div>
        {/* Placeholder for Courses - In reality we'd compute this from the courses list */}
        <div className="card p-5 opacity-75">
          <p className="text-sm text-secondary-600">Total Courses</p>
          <p className="text-2xl font-bold text-secondary-900">-</p>
        </div>
        <div className="card p-5 opacity-75">
          <p className="text-sm text-secondary-600">Avg. Courses/Category</p>
          <p className="text-2xl font-bold text-secondary-900">-</p>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-8 text-center text-secondary-500">Loading categories...</div>
      ) : (
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
                      onClick={() => startEdit(category)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-secondary-600 mb-4">{category.description}</p>
          </div>
        ))}
        {categories.length === 0 && !loading && (
           <div className="col-span-full p-8 text-center text-secondary-500 card">No categories found. Create one above!</div>
        )}
      </div>
      )}
    </div>
  )
}
