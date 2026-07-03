import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { useLanguage } from '../../lib/language-context'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(t('auth.invalidCredentials'))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Welcome back</p>
        <h1 className="text-3xl font-bold text-white">{t('auth.loginTitle')}</h1>
        <p className="mt-2 text-cyan-50/75">{t('auth.loginSubtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-950/70 border border-red-300/35 text-red-100 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-cyan-50/85">{t('common.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10 border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cyan-50/85">{t('common.password')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 pr-10 border-cyan-100/60 bg-white/90 text-secondary-950 shadow-sm focus:border-cyan-400 focus:ring-cyan-400/25"
              placeholder="********"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-cyan-200/60 text-cyan-500 focus:ring-cyan-400" />
            <span className="text-sm text-cyan-50/75">{t('auth.rememberMe')}</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-cyan-200 hover:text-white hover:underline">
            {t('auth.forgotPasswordText')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-300 hover:to-blue-500 focus:ring-cyan-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('common.loading')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              {t('auth.signIn')}
            </span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-cyan-50/75">
        {t('common.noAccount')}{' '}
        <Link to="/signup" className="text-cyan-200 font-semibold hover:text-white hover:underline">
          {t('common.signup')}
        </Link>
      </p>
    </div>
  )
}
