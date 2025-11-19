/**
 * Auth Feature - Barrel Export
 * 
 * Usage:
 * import { LoginPage, RegisterPage, useAuth, ProtectedRoute } from '@/features/auth'
 */

// Pages
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
export { default as DashboardPage } from './pages/DashboardPage'

// Components
export { ProtectedRoute } from './components/ProtectedRoute'

// Hooks
export { useAuth, AuthProvider } from './hooks/useAuth'

// API
export { authApi } from './api/authApi'

// Types
export type * from './types/auth.types'
