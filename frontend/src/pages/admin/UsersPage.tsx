import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Shield,
  Edit,
  Trash2,
  UserCheck,
} from 'lucide-react'

export default function UsersPage({ defaultRole = 'student' }: { defaultRole?: string }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(defaultRole)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // New user form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: defaultRole === 'all' ? 'student' : defaultRole })

  useEffect(() => {
    fetchUsers()
  }, [])

  // Sync role filter with prop
  useEffect(() => {
    setRoleFilter(defaultRole)
  }, [defaultRole])

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<any>('/users')
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      const res = await apiFetch<any>('/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      if (res.success) {
        setUsers([...users, res.user])
        setShowAddForm(false)
        setNewUser({ name: '', email: '', role: defaultRole === 'all' ? 'student' : defaultRole })
      }
    } catch (err) {
      console.error(err)
      alert("Failed to add user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== userId))
      setSelectedUser(null)
    } catch (err) {
      console.error(err)
      alert("Failed to delete user")
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await apiFetch<any>(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      })
      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        setSelectedUser(null)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update role")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-error-100 text-error-700">Admin</span>
      case 'teacher':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">Teacher</span>
      case 'student':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-700">Student</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
             {defaultRole === 'teacher' ? 'Teacher Management' : defaultRole === 'student' ? 'Student Management' : 'User Management'}
          </h1>
          <p className="text-secondary-600">Manage {defaultRole}s, roles, and permissions</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add {defaultRole === 'all' ? 'User' : defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)}
        </button>
      </div>

      {showAddForm && (
        <div className="card p-5 border-l-4 border-primary-500">
           <h3 className="text-lg font-semibold mb-3">Add New {defaultRole === 'all' ? 'User' : defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)}</h3>
           <div className="flex gap-4">
              <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="input flex-1" />
              <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="input flex-1" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="input flex-1">
                 <option value="student">Student</option>
                 <option value="teacher">Teacher</option>
                 <option value="admin">Admin</option>
              </select>
              <button onClick={handleAddUser} className="btn-primary">Save User</button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
           </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-visible pb-20">
        {loading ? (
           <div className="p-8 text-center text-secondary-500">Loading users...</div>
        ) : (
        <div className="overflow-visible">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Joined</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-secondary-500">No users found.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{user.name}</p>
                        <p className="text-sm text-secondary-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className={`input py-1 px-2 text-sm border font-medium max-w-[110px] ${
                        user.role === 'admin' ? 'bg-error-50 text-error-700 border-error-200' :
                        user.role === 'teacher' ? 'bg-primary-50 text-primary-700 border-primary-200' :
                        'bg-accent-50 text-accent-700 border-accent-200'
                      }`}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span className="flex items-center gap-1 text-accent-600"><UserCheck className="w-4 h-4" /> Active</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-secondary-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                        className="p-2 hover:bg-secondary-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-secondary-400" />
                      </button>

                      {selectedUser === user.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                          <button onClick={() => handleDeleteUser(user.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50">
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
