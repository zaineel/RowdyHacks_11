import express from 'express';
import { checkJwt, requireCircleAdmin, requireCircleMember } from '../middleware/auth.js';
import * as payoutController from '../controllers/payoutController.js';

const router = express.Router();

/**
 * @route   POST /api/payouts/process
 * @desc    Process a payout (manual trigger or automated)
 * @access  Private (Admin only or system)
 */
router.post('/process', checkJwt, payoutController.processPayout);

/**
 * @route   GET /api/payouts/circle/:circleId
 * @desc    Get all payouts for a circle
 * @access  Private
 */
router.get('/circle/:circleId', checkJwt, requireCircleMember, payoutController.getCirclePayouts);

/**
 * @route   GET /api/payouts/user/:userId
 * @desc    Get all payouts received by a user
 * @access  Private
 */
router.get('/user/:userId', checkJwt, payoutController.getUserPayouts);

/**
 * @route   GET /api/payouts/due
 * @desc    Get circles that are due for payout (for Cloudflare Worker)
 * @access  Private (System only)
 */
router.get('/due', payoutController.getPayoutsDue);

export default router;
