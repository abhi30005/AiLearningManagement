import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { useLanguage } from '../../lib/language-context'
import { Mail, ArrowLeft, Send } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-cyan-300/20 ring-1 ring-cyan-100/30 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-cyan-100" />
        </div>
        <h2 className="text-xl font-bold text-white">Check Your Email</h2>
        <p className="text-cyan-50/75">{t('auth.emailSent')}</p>
        <Link to="/login" className="btn bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white hover:from-cyan-300 hover:to-blue-500 focus:ring-cyan-300 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('auth.signIn')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Account recovery</p>
        <h1 className="text-3xl font-bold text-white">{t('auth.resetPasswordTitle')}</h1>
        <p className="mt-2 text-cyan-50/75">{t('auth.resetPasswordSubtitle')}</p>
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
              <Send className="w-4 h-4" />
              {t('common.submit')}
            </span>
          )}
        </button>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-cyan-200 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')} to {t('common.login')}
      </Link>
    </div>
  )
}
