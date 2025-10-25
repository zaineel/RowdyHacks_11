import express from 'express';
import { checkJwt } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user after Auth0 authentication
 * @access  Private
 */
router.post('/register', checkJwt, authController.register);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', checkJwt, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', checkJwt, authController.updateProfile);

export default router;
