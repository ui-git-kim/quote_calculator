/**
 * Auth Feature - Barrel Export
 * 
 * Usage:
 * import { authRoutes, authMiddleware } from '@/features/auth'
 */

export { default as authRoutes } from './auth.routes'
export { authMiddleware, optionalAuthMiddleware } from './auth.middleware'
export { authService } from './auth.service'
export { authController } from './auth.controller'
export * from './auth.validation'
