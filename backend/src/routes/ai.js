import express from 'express';
import { checkJwt } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

/**
 * @route   POST /api/ai/assess-risk
 * @desc    Assess risk for a new member joining circle
 * @access  Private
 */
router.post('/assess-risk', checkJwt, aiController.assessRisk);

/**
 * @route   POST /api/ai/detect-fraud
 * @desc    Analyze payment patterns for fraud
 * @access  Private
 */
router.post('/detect-fraud', checkJwt, aiController.detectFraud);

/**
 * @route   GET /api/ai/risk-history/:userId
 * @desc    Get risk assessment history for user
 * @access  Private
 */
router.get('/risk-history/:userId', checkJwt, aiController.getRiskHistory);

export default router;
