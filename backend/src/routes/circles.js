import express from 'express';
import { checkJwt, requireCircleAdmin, requireCircleMember } from '../middleware/auth.js';
import * as circleController from '../controllers/circleController.js';

const router = express.Router();

/**
 * @route   POST /api/circles
 * @desc    Create a new circle
 * @access  Private
 */
router.post('/', checkJwt, circleController.createCircle);

/**
 * @route   GET /api/circles/:id
 * @desc    Get circle by ID
 * @access  Private
 */
router.get('/:id', checkJwt, circleController.getCircleById);

/**
 * @route   POST /api/circles/:id/join
 * @desc    Request to join a circle with invite code
 * @access  Private
 */
router.post('/:id/join', checkJwt, circleController.joinCircle);

/**
 * @route   GET /api/circles/:id/members
 * @desc    Get all members of a circle
 * @access  Private
 */
router.get('/:id/members', checkJwt, requireCircleMember, circleController.getCircleMembers);

/**
 * @route   PUT /api/circles/:id
 * @desc    Update circle details
 * @access  Private (Admin only)
 */
router.put('/:id', checkJwt, requireCircleAdmin, circleController.updateCircle);

/**
 * @route   DELETE /api/circles/:id
 * @desc    Disband a circle
 * @access  Private (Admin only)
 */
router.delete('/:id', checkJwt, requireCircleAdmin, circleController.disbandCircle);

/**
 * @route   POST /api/circles/:id/approve-member
 * @desc    Approve a pending member
 * @access  Private (Admin only)
 */
router.post('/:id/approve-member', checkJwt, requireCircleAdmin, circleController.approveMember);

/**
 * @route   GET /api/circles/:id/schedule
 * @desc    Get payout schedule for circle
 * @access  Private
 */
router.get('/:id/schedule', checkJwt, requireCircleMember, circleController.getPayoutSchedule);

export default router;
