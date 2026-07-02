import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { apiFetch } from '../../lib/api'
import { useLanguage } from '../../lib/language-context'
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Camera,
  Save,
  Shield,
  Trash2,
} from 'lucide-react'

const languages = [
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'hi', label: 'Hindi', flag: 'IN' },
  { code: 'bn', label: 'Bengali', flag: 'BD' },
]

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const [activeTab, setActiveTab] = useState('profile')
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState({
    email: true,
    quizzes: true,
    assignments: true,
    updates: false,
  })
  const [loading, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) {
      // Fetch settings
      apiFetch<any>(`/users/${user.id}/settings`).then(res => {
        if (res?.settings) {
          setNotifications(prev => ({ ...prev, ...res.settings.notifications }))
        }
      }).catch(console.error)
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName })
      if (user?.id) {
        await apiFetch(`/users/${user.id}/settings`, {
          method: 'PUT',
          body: JSON.stringify({ notifications })
        })
      }
    } catch(e) {
      console.error(e)
    }
    setSaving(false)
  }

  const tabs = [
    { id: 'profile', label: t('profile.editProfile'), icon: User },
    { id: 'security', label: t('profile.changePassword'), icon: Shield },
    { id: 'notifications', label: t('profile.notifications'), icon: Bell },
    { id: 'appearance', label: t('profile.theme'), icon: Palette },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">{t('profile.editProfile')}</h1>
        <p className="text-secondary-600">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-4">
            {/* Avatar */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-secondary-600 hover:bg-secondary-50">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mt-3 font-semibold text-secondary-900">{user?.full_name}</h3>
              <p className="text-sm text-secondary-500 capitalize">{user?.role}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-secondary-900">{t('profile.editProfile')}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="label">{t('common.fullName')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">{t('common.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="input pl-10 bg-secondary-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">{t('profile.language')}</label>
                    <div className="flex gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'bn')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                            language === lang.code
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-secondary-200 hover:border-secondary-300'
                          }`}
                        >
                          <span className="font-medium">{lang.flag}</span>
                          <span className="text-sm">{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveProfile} className="btn-primary" disabled={loading}>
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-secondary-900">{t('profile.changePassword')}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="label">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input pl-10"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input pl-10"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input pl-10"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <button className="btn-primary">
                  <Lock className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-secondary-900">{t('profile.notifications')}</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 rounded-lg border border-secondary-200">
                    <div>
                      <p className="font-medium text-secondary-900">Email Notifications</p>
                      <p className="text-sm text-secondary-600">Receive updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-secondary-200">
                    <div>
                      <p className="font-medium text-secondary-900">Quiz Results</p>
                      <p className="text-sm text-secondary-600">Get notified when quiz results are ready</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.quizzes}
                      onChange={(e) => setNotifications({ ...notifications, quizzes: e.target.checked })}
                      className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-secondary-200">
                    <div>
                      <p className="font-medium text-secondary-900">Assignment Reminders</p>
                      <p className="text-sm text-secondary-600">Get reminders about due assignments</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.assignments}
                      onChange={(e) => setNotifications({ ...notifications, assignments: e.target.checked })}
                      className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-lg border border-secondary-200">
                    <div>
                      <p className="font-medium text-secondary-900">Course Updates</p>
                      <p className="text-sm text-secondary-600">Get notified when courses are updated</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.updates}
                      onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                      className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-secondary-900">{t('profile.theme')}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-700 mb-3 block">Color Theme</label>
                    <div className="flex gap-4">
                      {[
                        { name: 'Light', value: 'light', bg: 'bg-white' },
                        { name: 'Dark', value: 'dark', bg: 'bg-secondary-900' },
                        { name: 'System', value: 'system', bg: 'bg-gradient-to-r from-white to-secondary-900' },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-secondary-200 hover:border-secondary-300 transition-colors"
                        >
                          <div className={`w-12 h-12 rounded-lg ${theme.bg} border border-secondary-200`} />
                          <span className="text-sm text-secondary-700">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <h3 className="text-lg font-semibold text-error-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-secondary-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn-danger">
                <Trash2 className="w-4 h-4" />
                {t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
