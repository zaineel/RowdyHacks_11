import express from "express";
import { checkJwt } from "../middleware/auth.js";
import * as marketplaceController from "../controllers/marketplaceController.js";
import * as borrowController from "../controllers/borrowController.js";
import * as paymentController from "../controllers/marketplacePaymentController.js";

const router = express.Router();

/**
 * @route   GET /api/marketplace
 * @desc    Get all available items in marketplace
 * @access  Private
 */
router.get("/", checkJwt, marketplaceController.listItems);

/**
 * @route   GET /api/marketplace/my-listings
 * @desc    Get user's own item listings
 * @access  Private
 */
router.get("/my-listings", checkJwt, marketplaceController.getMyListings);

/**
 * @route   GET /api/marketplace/my-borrows
 * @desc    Get user's borrow history
 * @access  Private
 */
router.get("/my-borrows", checkJwt, borrowController.getMyBorrows);

/**
 * @route   GET /api/marketplace/pending-requests
 * @desc    Get pending borrow requests for owner's items
 * @access  Private
 */
router.get("/pending-requests", checkJwt, borrowController.getPendingRequests);

/**
 * @route   GET /api/marketplace/:id
 * @desc    Get single item by ID
 * @access  Private
 */
router.get("/:id", checkJwt, marketplaceController.getItemById);

/**
 * @route   POST /api/marketplace
 * @desc    Create new item listing
 * @access  Private
 */
router.post("/", checkJwt, marketplaceController.createItem);

/**
 * @route   PUT /api/marketplace/:id
 * @desc    Update item listing
 * @access  Private (owner only)
 */
router.put("/:id", checkJwt, marketplaceController.updateItem);

/**
 * @route   DELETE /api/marketplace/:id
 * @desc    Delete item listing
 * @access  Private (owner only)
 */
router.delete("/:id", checkJwt, marketplaceController.deleteItem);

/**
 * @route   POST /api/marketplace/:id/borrow
 * @desc    Request to borrow an item
 * @access  Private
 */
router.post("/:id/borrow", checkJwt, borrowController.requestBorrow);

/**
 * @route   POST /api/marketplace/borrows/:borrowId/approve
 * @desc    Approve a borrow request (owner only)
 * @access  Private
 */
router.post(
  "/borrows/:borrowId/approve",
  checkJwt,
  borrowController.approveBorrow
);

/**
 * @route   POST /api/marketplace/borrows/:borrowId/reject
 * @desc    Reject a borrow request (owner only)
 * @access  Private
 */
router.post(
  "/borrows/:borrowId/reject",
  checkJwt,
  borrowController.rejectBorrow
);

/**
 * @route   POST /api/marketplace/borrows/:borrowId/return
 * @desc    Mark item as returned (borrower)
 * @access  Private
 */
router.post(
  "/borrows/:borrowId/return",
  checkJwt,
  borrowController.markReturned
);

/**
 * @route   POST /api/marketplace/borrows/:borrowId/complete
 * @desc    Complete borrow transaction (owner confirms, refunds deposit, awards credit)
 * @access  Private
 */
router.post(
  "/borrows/:borrowId/complete",
  checkJwt,
  borrowController.completeBorrow
);

/**
 * @route   POST /api/marketplace/payments/deposit
 * @desc    Process deposit payment for approved borrow request
 * @access  Private
 */
router.post(
  "/payments/deposit",
  checkJwt,
  paymentController.processDepositPayment
);

/**
 * @route   POST /api/marketplace/payments/refund
 * @desc    Process refund when item is returned
 * @access  Private
 */
router.post("/payments/refund", checkJwt, paymentController.processRefund);

/**
 * @route   GET /api/marketplace/payments/history
 * @desc    Get payment history for user
 * @access  Private
 */
router.get("/payments/history", checkJwt, paymentController.getPaymentHistory);

/**
 * @route   GET /api/marketplace/payments/pending
 * @desc    Get pending payments (approved borrows needing deposit payment)
 * @access  Private
 */
router.get("/payments/pending", checkJwt, paymentController.getPendingPayments);

export default router;
