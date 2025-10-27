import { query, transaction } from "../utils/db.js";
import { updateCreditScore } from "../services/creditService.js";

/**
 * Process deposit payment for a borrow request
 */
export const processDepositPayment = async (req, res, next) => {
  try {
    const { borrow_id, payment_method, card_details } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    const user_id = userResult.rows[0].id;

    // Get borrow request details
    const borrowResult = await query(
      `SELECT ib.*, i.title, i.deposit_amount, i.owner_id, i.daily_rate
       FROM item_borrows ib
       JOIN items i ON ib.item_id = i.id
       WHERE ib.id = $1 AND ib.borrower_id = $2 AND ib.status = 'approved'`,
      [borrow_id, user_id]
    );

    if (borrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Borrow request not found or not approved" },
      });
    }

    const borrow = borrowResult.rows[0];

    // Validate payment method
    const validMethods = [
      "credit_card",
      "debit_card",
      "bank_account",
      "digital_wallet",
      "mock",
    ];
    const finalPaymentMethod = validMethods.includes(payment_method)
      ? payment_method
      : "mock";

    // TODO: In production, integrate with a payment processor (Stripe, Square, etc.)
    // For now, we'll simulate successful payment processing
    if (
      finalPaymentMethod === "credit_card" ||
      finalPaymentMethod === "debit_card"
    ) {
      if (
        !card_details ||
        !card_details.number ||
        !card_details.expiry ||
        !card_details.cvv
      ) {
        return res.status(400).json({
          success: false,
          error: { message: "Card details required for card payments" },
        });
      }
    }

    const result = await transaction(async (client) => {
      // Create payment record
      const paymentResult = await client.query(
        `INSERT INTO marketplace_payments 
         (borrow_id, borrower_id, owner_id, item_id, amount, payment_type, status, payment_method, transaction_id)
         VALUES ($1, $2, $3, $4, $5, 'deposit', 'completed', $6, $7)
         RETURNING *`,
        [
          borrow_id,
          user_id,
          borrow.owner_id,
          borrow.item_id,
          borrow.deposit_amount,
          finalPaymentMethod,
          `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ]
      );

      // Update borrow record with deposit paid
      await client.query(
        `UPDATE item_borrows 
         SET status = 'active', deposit_paid = $1, borrow_start_date = CURRENT_DATE
         WHERE id = $2`,
        [borrow.deposit_amount, borrow_id]
      );

      // Update item status to borrowed
      await client.query(`UPDATE items SET status = 'borrowed' WHERE id = $1`, [
        borrow.item_id,
      ]);

      // Update credit score for successful payment
      await updateCreditScore(
        user_id,
        "marketplace_deposit_paid",
        5,
        null,
        client
      );

      return paymentResult.rows[0];
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Deposit payment processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund when item is returned
 */
export const processRefund = async (req, res, next) => {
  try {
    const { borrow_id } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    const user_id = userResult.rows[0].id;

    // Get borrow details
    const borrowResult = await query(
      `SELECT ib.*, i.title, i.owner_id
       FROM item_borrows ib
       JOIN items i ON ib.item_id = i.id
       WHERE ib.id = $1 AND ib.owner_id = $2 AND ib.status = 'returned'`,
      [borrow_id, user_id]
    );

    if (borrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Borrow request not found or not returned" },
      });
    }

    const borrow = borrowResult.rows[0];

    const result = await transaction(async (client) => {
      // Create refund record
      const refundResult = await client.query(
        `INSERT INTO marketplace_payments 
         (borrow_id, borrower_id, owner_id, item_id, amount, payment_type, status, payment_method, transaction_id)
         VALUES ($1, $2, $3, $4, $5, 'refund', 'completed', 'mock', $6)
         RETURNING *`,
        [
          borrow_id,
          borrow.borrower_id,
          user_id,
          borrow.item_id,
          borrow.deposit_paid,
          `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ]
      );

      // Update borrow record with refund
      await client.query(
        `UPDATE item_borrows 
         SET deposit_refunded = $1, status = 'completed'
         WHERE id = $2`,
        [borrow.deposit_paid, borrow_id]
      );

      // Update item status back to available
      await client.query(
        `UPDATE items SET status = 'available' WHERE id = $1`,
        [borrow.item_id]
      );

      // Update credit score for successful return
      await updateCreditScore(
        borrow.borrower_id,
        "marketplace_item_returned",
        10,
        null,
        client
      );

      return refundResult.rows[0];
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Refund processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment history for a user
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    const user_id = userResult.rows[0].id;

    const result = await query(
      `SELECT mp.*, ib.id as borrow_id, i.title as item_title, 
              u_borrower.name as borrower_name, u_owner.name as owner_name
       FROM marketplace_payments mp
       JOIN item_borrows ib ON mp.borrow_id = ib.id
       JOIN items i ON mp.item_id = i.id
       JOIN users u_borrower ON mp.borrower_id = u_borrower.id
       JOIN users u_owner ON mp.owner_id = u_owner.id
       WHERE mp.borrower_id = $1 OR mp.owner_id = $1
       ORDER BY mp.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending payments (deposits that need to be paid)
 */
export const getPendingPayments = async (req, res, next) => {
  try {
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    const user_id = userResult.rows[0].id;

    const result = await query(
      `SELECT ib.*, i.title, i.deposit_amount, i.daily_rate, u.name as owner_name
       FROM item_borrows ib
       JOIN items i ON ib.item_id = i.id
       JOIN users u ON ib.owner_id = u.id
       WHERE ib.borrower_id = $1 AND ib.status = 'approved' AND ib.deposit_paid IS NULL
       ORDER BY ib.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
