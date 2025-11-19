import type { Request, Response } from 'express'
import { authService } from './auth.service'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
} from './auth.validation'

/**
 * Auth Controller - Handles HTTP requests for authentication
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = registerSchema.parse(req.body) as RegisterInput

      // Register user
      const result = await authService.register(data)

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message,
          })
          return
        }
      }

      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      })
    }
  }

  /**
   * POST /api/auth/login
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = loginSchema.parse(req.body) as LoginInput

      // Login user
      const result = await authService.login(data)

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      })
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = refreshTokenSchema.parse(req.body) as RefreshTokenInput

      // Refresh token
      const result = await authService.refreshAccessToken(data.refreshToken)

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
      })
    }
  }

  /**
   * GET /api/auth/me
   * Get current user (requires authentication)
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // User ID is set by auth middleware
      const userId = (req as any).user?.userId

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const user = await authService.getUserById(userId)

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'User not found',
      })
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal mainly)
   */
  async logout(_req: Request, res: Response): Promise<void> {
    // With JWT, logout is mainly client-side (remove tokens)
    // Here we just acknowledge the logout
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    })
  }
}

export const authController = new AuthController()
