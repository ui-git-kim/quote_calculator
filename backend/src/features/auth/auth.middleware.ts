import type { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
      }
    }
  }
}

/**
 * Auth Middleware - Protects routes by verifying JWT access tokens
 * 
 * Usage:
 * router.get('/protected', authMiddleware, controller.handler)
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyAccessToken(token)

    // Attach user to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
    }

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

/**
 * Optional Auth Middleware - Doesn't fail if no token, just sets user if valid
 * 
 * Usage:
 * router.get('/optional-auth', optionalAuthMiddleware, controller.handler)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = authService.verifyAccessToken(token)

      req.user = {
        userId: payload.userId,
        email: payload.email,
      }
    }
  } catch (error) {
    // Silently fail - user remains undefined
  }

  next()
}
