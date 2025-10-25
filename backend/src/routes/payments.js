import express from 'express';
import { checkJwt, requireCircleMember } from '../middleware/auth.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

/**
 * @route   POST /api/payments
 * @desc    Make a payment contribution
 * @access  Private
 */
router.post('/', checkJwt, paymentController.makePayment);

/**
 * @route   GET /api/payments/circle/:circleId
 * @desc    Get all payments for a circle
 * @access  Private
 */
router.get('/circle/:circleId', checkJwt, requireCircleMember, paymentController.getCirclePayments);

/**
 * @route   GET /api/payments/user/:userId
 * @desc    Get all payments by a user
 * @access  Private
 */
router.get('/user/:userId', checkJwt, paymentController.getUserPayments);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', checkJwt, paymentController.getPaymentById);

/**
 * @route   GET /api/payments/upcoming/:userId
 * @desc    Get upcoming payments for user
 * @access  Private
 */
router.get('/upcoming/:userId', checkJwt, paymentController.getUpcomingPayments);

export default router;
