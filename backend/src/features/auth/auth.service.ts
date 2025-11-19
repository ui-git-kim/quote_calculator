import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import type { RegisterInput, LoginInput } from './auth.validation'

const prisma = new PrismaClient()

interface TokenPayload {
  userId: string
  email: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthResponse extends AuthTokens {
  user: {
    id: string
    email: string
    name: string | null
  }
}

/**
 * Auth Service - Handles all authentication business logic
 */
export class AuthService {
  private readonly ACCESS_TOKEN_SECRET: string
  private readonly REFRESH_TOKEN_SECRET: string
  private readonly ACCESS_TOKEN_EXPIRY = '15m' // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = '7d' // 7 days

  constructor() {
    this.ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-this'
    this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this'

    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.warn('⚠️  WARNING: Using default JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env')
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Generate tokens
    const tokens = this.generateTokens({ userId: user.id, email: user.email })

    return {
      ...tokens,
      user,
    }
  }

  /**
   * Login a user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password)

    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Generate tokens
    const tokens = this.generateTokens({ userId: user.id, email: user.email })

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as TokenPayload

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Generate new access token
      const accessToken = this.generateAccessToken({ userId: user.id, email: user.email })

      return { accessToken }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Generate both access and refresh tokens
   */
  private generateTokens(payload: TokenPayload): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }

  /**
   * Generate access token (short-lived)
   */
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    })
  }

  /**
   * Generate refresh token (long-lived)
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    })
  }
}

export const authService = new AuthService()
