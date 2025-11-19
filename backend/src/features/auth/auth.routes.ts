import { Router } from 'express'
import { authController } from './auth.controller'
import { authMiddleware } from './auth.middleware'

const router = Router()

/**
 * Auth Routes
 * Base path: /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => authController.register(req, res))

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res) => authController.login(req, res))

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res) => authController.refresh(req, res))

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private (requires auth)
 */
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res))

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (requires auth)
 */
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res))

export default router
