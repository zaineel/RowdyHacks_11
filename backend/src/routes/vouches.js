import express from 'express';
import { checkJwt, requireCircleMember } from '../middleware/auth.js';
import * as vouchController from '../controllers/vouchController.js';

const router = express.Router();

/**
 * @route   POST /api/vouches
 * @desc    Vouch for a new member
 * @access  Private
 */
router.post('/', checkJwt, requireCircleMember, vouchController.createVouch);

/**
 * @route   GET /api/vouches/circle/:circleId/user/:userId
 * @desc    Get all vouches for a user in a circle
 * @access  Private
 */
router.get('/circle/:circleId/user/:userId', checkJwt, vouchController.getUserVouches);

/**
 * @route   GET /api/vouches/circle/:circleId/my-vouches
 * @desc    Get all vouches I've made in a circle
 * @access  Private
 */
router.get('/circle/:circleId/my-vouches', checkJwt, vouchController.getMyVouchesInCircle);

/**
 * @route   DELETE /api/vouches/:id
 * @desc    Revoke a vouch
 * @access  Private
 */
router.delete('/:id', checkJwt, vouchController.revokeVouch);

export default router;
