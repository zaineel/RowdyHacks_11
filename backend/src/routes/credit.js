import express from 'express';
import { checkJwt } from '../middleware/auth.js';
import * as creditController from '../controllers/creditController.js';

const router = express.Router();

/**
 * @route   GET /api/credit/:userId
 * @desc    Get credit score and details for user
 * @access  Private
 */
router.get('/:userId', checkJwt, creditController.getCreditScore);

/**
 * @route   GET /api/credit/:userId/history
 * @desc    Get full credit history for user
 * @access  Private
 */
router.get('/:userId/history', checkJwt, creditController.getCreditHistory);

/**
 * @route   GET /api/credit/:userId/report
 * @desc    Generate credit report for user
 * @access  Private
 */
router.get('/:userId/report', checkJwt, creditController.generateCreditReport);

export default router;
