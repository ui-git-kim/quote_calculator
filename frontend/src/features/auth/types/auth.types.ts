/**
 * Auth Types
 */

export interface User {
  id: string
  email: string
  name: string | null
  createdAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}
