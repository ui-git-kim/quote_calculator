import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import type { User, LoginData, RegisterData, AuthContextType } from '../types/auth.types'
import { toast } from 'sonner'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Auth Provider - Manages authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const storedUser = localStorage.getItem('user')

      if (storedAccessToken && storedRefreshToken && storedUser) {
        try {
          setAccessToken(storedAccessToken)
          setUser(JSON.parse(storedUser))

          // Verify token is still valid by fetching user
          const userData = await authApi.getMe()
          setUser(userData)
        } catch (error) {
          // Token expired, try to refresh
          try {
            await refreshToken()
          } catch (refreshError) {
            // Refresh failed, clear auth state
            clearAuthState()
          }
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  /**
   * Register a new user
   */
  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data)
      
      // Save tokens and user
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setAccessToken(response.accessToken)
      setUser(response.user)
      
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  /**
   * Login a user
   */
  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data)
      
      // Save tokens and user
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setAccessToken(response.accessToken)
      setUser(response.user)
      
      toast.success('Logged in successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  /**
   * Logout user
   */
  const logout = () => {
    clearAuthState()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  /**
   * Refresh access token
   */
  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (!storedRefreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authApi.refresh(storedRefreshToken)
      
      localStorage.setItem('accessToken', response.accessToken)
      setAccessToken(response.accessToken)
    } catch (error) {
      clearAuthState()
      throw error
    }
  }

  /**
   * Clear auth state
   */
  const clearAuthState = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setAccessToken(null)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook - Access auth context
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
