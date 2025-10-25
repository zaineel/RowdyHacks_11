import express from 'express';
import { checkJwt } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', checkJwt, userController.getUserById);

/**
 * @route   GET /api/users/:id/circles
 * @desc    Get all circles for a user
 * @access  Private
 */
router.get('/:id/circles', checkJwt, userController.getUserCircles);

/**
 * @route   GET /api/users/:id/credit-history
 * @desc    Get credit history for a user
 * @access  Private
 */
router.get('/:id/credit-history', checkJwt, userController.getCreditHistory);

export default router;
