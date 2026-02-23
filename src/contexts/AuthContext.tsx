'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface User {
  _id: string
  username: string
  displayName: string
  role: 'admin' | 'viewer'
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (username: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Login mutation
  const loginMutation = useMutation(api.users.login)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const result = await loginMutation({ username, password })
      if (result.success) {
        const userData = result.user as User
        setUser(userData)
        sessionStorage.setItem('user', JSON.stringify(userData))
        return { success: true }
      }
      return { success: false, error: 'Credenciales inválidas' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesión' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName }),
      })

      const data = await result.json()
      if (data.success) {
        return { success: true }
      }
      return { success: false, error: data.error || 'Error al registrar' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrar' }
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        login,
        logout,
        register,
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
