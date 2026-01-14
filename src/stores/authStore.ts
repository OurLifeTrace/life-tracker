import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (email: string, password: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          set({
            user: profile as User,
            isAuthenticated: true,
            isLoading: false
          })
          return
        }
      }

      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          set({ user: profile as User, isAuthenticated: true })
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false })
      }
    })
  },

  login: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  register: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get()
    if (!user) {
      return { error: new Error('Not authenticated') }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      set({ user: { ...user, ...updates } })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  resetPassword: async (email: string) => {
    try {
      // Build redirect URL from current location, preserving base path
      const currentUrl = new URL(window.location.href)
      currentUrl.pathname = currentUrl.pathname.replace(/\/auth\/.*$|\/app\/.*$/, '') + '/auth/reset-password'
      currentUrl.search = ''
      currentUrl.hash = ''

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: currentUrl.toString(),
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}))
