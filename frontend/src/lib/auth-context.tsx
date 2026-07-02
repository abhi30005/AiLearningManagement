import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile as updateFirebaseProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from './firebase'
import { supabase, User } from './supabase'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: (role?: 'student' | 'teacher' | 'admin') => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher' | 'admin') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (mounted && !error && data) {
        setUser(data as User)
      } else if (mounted && error) {
        // Handle error or lack of profile data if needed
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return

      setFirebaseUser(user)

      if (user) {
        // In a real scenario, you might have Firebase UID match Supabase UUID, 
        // or you create a Supabase profile when signing up with Firebase.
        await fetchProfile(user.uid)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher' | 'admin') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update Firebase display name
      await updateFirebaseProfile(userCredential.user, { displayName: fullName })

      // Create profile in Supabase mapping Firebase UID to Supabase Profile ID.
      // Note: Supabase ID usually expects UUID, but Firebase UID is an alphanumeric string.
      // We will assume the profile table id accepts the string or we generate one.
      const { error } = await supabase.from('profiles').insert([
        {
          id: userCredential.user.uid,
          email,
          full_name: fullName,
          role,
          language: 'en'
        }
      ])
      
      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signInWithGoogle = async (role: 'student' | 'teacher' | 'admin' = 'student') => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user

      // Check if profile exists, if not, create it
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firebaseUser.uid)
        .single()

      if (!existingProfile) {
        const { error } = await supabase.from('profiles').insert([
          {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName || 'Google User',
            role,
            language: 'en'
          }
        ])
        if (error) throw error
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setFirebaseUser(null)
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setUser({ ...user, ...updates })
    }

    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
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
