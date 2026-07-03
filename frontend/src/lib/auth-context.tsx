import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiFetch } from './api'

export interface User {
  id: string
  email: string
  full_name?: string
  name?: string
  role: 'student' | 'teacher' | 'admin'
  language?: string
  xp?: number
  streak?: number
  badges?: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: (role?: 'student' | 'teacher' | 'admin') => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher' | 'admin') => Promise<{ error: Error | null }>
  signUpStudent: (email: string, password: string, fullName: string, department: string, course: string) => Promise<{ error: Error | null }>
  signUpTeacher: (email: string, password: string, fullName: string, department: string, subject: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const handleAuthChanged = () => {
      if (mounted && !localStorage.getItem('token')) {
        setUser(null)
      }
    }

    window.addEventListener('auth:changed', handleAuthChanged)

    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const data = await apiFetch<User>('/users/me')
          if (mounted) {
            setUser(data)
          }
        } catch (error) {
          localStorage.removeItem('token')
          if (mounted) setUser(null)
        }
      } else {
        if (mounted) setUser(null)
      }
      if (mounted) setLoading(false)
    }

    loadUser()

    return () => {
      mounted = false
      window.removeEventListener('auth:changed', handleAuthChanged)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      
      if (res.success && res.token) {
        localStorage.setItem('token', res.token)
        setUser(res.user)
        return { error: null }
      }
      return { error: new Error("Login failed") }
    } catch (error: any) {
      return { error }
    }
  }

  const signUpStudent = async (email: string, password: string, fullName: string, department: string, course: string) => {
    try {
      const res = await apiFetch<any>('/auth/register/student', {
        method: 'POST',
        body: JSON.stringify({ email, password, name: fullName, department, course })
      })

      if (res.success && res.token) {
        localStorage.setItem('token', res.token)
        setUser(res.user)
        return { error: null }
      }
      return { error: new Error(res.detail || "Signup failed") }
    } catch (error: any) {
      return { error }
    }
  }

  const signUpTeacher = async (email: string, password: string, fullName: string, department: string, subject: string) => {
    try {
      const res = await apiFetch<any>('/auth/register/teacher', {
        method: 'POST',
        body: JSON.stringify({ email, password, name: fullName, department, subject })
      })

      if (res.success && res.token) {
        localStorage.setItem('token', res.token)
        setUser(res.user)
        return { error: null }
      }
      return { error: new Error(res.detail || "Signup failed") }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher' | 'admin') => {
    return { error: new Error("Deprecated: Use signUpStudent or signUpTeacher") }
  }

  const signInWithGoogle = async (role: 'student' | 'teacher' | 'admin' = 'student') => {
    try {
      const res = await apiFetch<any>('/auth/google', {
        method: 'POST',
      })
      if (res.success && res.token) {
        localStorage.setItem('token', res.token)
        setUser(res.user)
        return { error: null }
      }
      return { error: new Error("Google login failed") }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    // In a real app, you would call an API endpoint here
    return { error: new Error("Not implemented yet") }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const res = await apiFetch<any>(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      if (res.success) {
        setUser({ ...user, ...res.user })
        return { error: null }
      }
      return { error: new Error("Profile update failed") }
    } catch (error: any) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signUpStudent,
        signUpTeacher,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
