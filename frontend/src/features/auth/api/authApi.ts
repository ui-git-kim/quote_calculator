import { api } from '@/lib/api'
import type { RegisterData, LoginData, AuthResponse } from '../types/auth.types'

/**
 * Auth API Client
 * Communicates with backend auth endpoints
 */

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', data)
    return response.data.data
  },

  /**
   * Login a user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', data)
    return response.data.data
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post<{ data: { accessToken: string } }>('/auth/refresh', {
      refreshToken,
    })
    return response.data.data
  },

  /**
   * Get current user
   */
  getMe: async () => {
    const response = await api.get<{ data: any }>('/auth/me')
    return response.data.data
  },

  /**
   * Logout (client-side mainly, backend just acknowledges)
   */
  logout: async () => {
    await api.post('/auth/logout')
  },
}
