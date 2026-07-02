import { useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'

const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'student',
    status: 'active',
    courses: 5,
    progress: 72,
    joined: '2023-10-15',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: 2,
    name: 'Dr. Bob Smith',
    email: 'bob@example.com',
    role: 'teacher',
    status: 'active',
    courses: 3,
    students: 234,
    joined: '2023-08-20',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: 3,
    name: 'Carol White',
    email: 'carol@example.com',
    role: 'student',
    status: 'inactive',
    courses: 2,
    progress: 45,
    joined: '2024-01-10',
    avatar: null,
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david@example.com',
    role: 'student',
    status: 'active',
    courses: 8,
    progress: 88,
    joined: '2023-09-05',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: 5,
    name: 'Prof. Emily Davis',
    email: 'emily@example.com',
    role: 'teacher',
    status: 'active',
    courses: 5,
    students: 567,
    joined: '2023-07-12',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
]

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
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

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? <span className="flex items-center gap-1 text-accent-600"><UserCheck className="w-4 h-4" /> Active</span>
      : <span className="flex items-center gap-1 text-secondary-500"><UserX className="w-4 h-4" /> Inactive</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">User Management</h1>
          <p className="text-secondary-600">Manage all users, roles, and permissions</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Activity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Joined</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-secondary-900">{user.name}</p>
                        <p className="text-sm text-secondary-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-4 px-4 text-sm">{getStatusBadge(user.status)}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      {user.role === 'teacher' ? (
                        <span>{user.courses} courses, {user.students} students</span>
                      ) : (
                        <span>{user.courses} courses, {user.progress}% avg progress</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-secondary-500">
                    {new Date(user.joined).toLocaleDateString()}
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
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                            <Mail className="w-4 h-4" />
                            Email
                          </button>
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                            <Shield className="w-4 h-4" />
                            Change Role
                          </button>
                          <hr className="my-1 border-secondary-200" />
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50">
                            <Trash2 className="w-4 h-4" />
                            Delete
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-secondary-200">
          <p className="text-sm text-secondary-600">Showing {filteredUsers.length} of {users.length} users</p>
          <div className="flex items-center gap-2">
            <button className="btn-sm btn-secondary" disabled>Previous</button>
            <button className="btn-sm btn-secondary">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
