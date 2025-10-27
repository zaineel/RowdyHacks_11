import { query, transaction } from "../utils/db.js";
import { updateCreditScore } from "../services/creditService.js";

/**
 * Process a payout for a circle
 * Transfers pooled funds to designated recipient and advances to next cycle
 */
export const processPayout = async (req, res, next) => {
  try {
    const { circle_id, recipient_id, amount } = req.body;

    const result = await transaction(async (client) => {
      // Get circle info
      const circleResult = await client.query(
        "SELECT * FROM circles WHERE id = $1",
        [circle_id]
      );

      if (circleResult.rows.length === 0) {
        throw new Error("Circle not found");
      }

      const circle = circleResult.rows[0];

      // Verify recipient is the designated payout user for this cycle
      if (recipient_id && circle.next_payout_user_id !== recipient_id) {
        throw new Error("Recipient does not match scheduled payout user");
      }

      // Use provided amount or circle's current pool
      const payoutAmount = amount || circle.current_pool_amount;

      if (payoutAmount <= 0) {
        throw new Error("No funds available for payout");
      }

      // Create payout record
      const payoutResult = await client.query(
        `INSERT INTO payouts (circle_id, recipient_id, amount, cycle_number, status)
         VALUES ($1, $2, $3, $4, 'completed')
         RETURNING *`,
        [
          circle_id,
          recipient_id || circle.next_payout_user_id,
          payoutAmount,
          circle.current_cycle,
        ]
      );

      // Mark member as having received payout
      await client.query(
        `UPDATE circle_members
         SET has_received_payout = TRUE, payout_received_date = CURRENT_DATE
         WHERE circle_id = $1 AND user_id = $2`,
        [circle_id, recipient_id || circle.next_payout_user_id]
      );

      // Reset pool and advance to next cycle
      await client.query(
        `UPDATE circles
         SET current_pool_amount = 0,
             current_cycle = current_cycle + 1
         WHERE id = $1`,
        [circle_id]
      );

      // Update next payout user (find next member who hasn't received payout)
      const nextMemberResult = await client.query(
        `SELECT user_id FROM circle_members 
         WHERE circle_id = $1 AND status = 'active' AND has_received_payout = FALSE
         ORDER BY position_in_cycle ASC
         LIMIT 1`,
        [circle_id]
      );

      if (nextMemberResult.rows.length > 0) {
        await client.query(
          `UPDATE circles 
           SET next_payout_user_id = $1, next_payout_date = CURRENT_DATE + INTERVAL '1 month'
           WHERE id = $2`,
          [nextMemberResult.rows[0].user_id, circle_id]
        );
      } else {
        // All members have received payouts, circle is complete
        await client.query(
          `UPDATE circles 
           SET status = 'completed', next_payout_user_id = NULL, next_payout_date = NULL
           WHERE id = $1`,
          [circle_id]
        );
      }

      // Update credit score for recipient
      await updateCreditScore(
        recipient_id || circle.next_payout_user_id,
        "payout_received",
        5,
        circle_id,
        client
      );

      return payoutResult.rows[0];
    });

    res.json({
      success: true,
      data: result,
      message: "Payout processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout history for a circle
 */
export const getCirclePayouts = async (req, res, next) => {
  try {
    const { circleId } = req.params;

    const result = await query(
      `SELECT p.*, u.name as recipient_name
       FROM payouts p
       JOIN users u ON p.recipient_id = u.id
       WHERE p.circle_id = $1
       ORDER BY p.created_at DESC`,
      [circleId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get circles that are due for payout
 * Used by Cloudflare Worker for automated processing
 */
export const getPayoutsDue = async (req, res, next) => {
  try {
    // Find circles where:
    // 1. All active members have paid for current cycle, OR
    // 2. next_payout_date has passed
    const result = await query(
      `SELECT c.*,
              u.name as next_recipient_name,
              (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id AND status = 'active') as total_active_members,
              (SELECT COUNT(DISTINCT user_id) FROM payments WHERE circle_id = c.id AND cycle_number = c.current_cycle AND status = 'completed') as members_paid
       FROM circles c
       LEFT JOIN users u ON c.next_payout_user_id = u.id
       WHERE c.status = 'active'
         AND c.next_payout_user_id IS NOT NULL
         AND (
           c.next_payout_date <= CURRENT_DATE
           OR c.current_pool_amount >= (c.monthly_amount * c.current_members * 0.8)
         )`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current pool status for a circle
 */
export const getPoolStatus = async (req, res, next) => {
  try {
    const { circleId } = req.params;

    const result = await query(
      `SELECT c.id,
              c.current_pool_amount,
              c.monthly_amount,
              c.current_members,
              c.current_cycle,
              c.next_payout_date,
              u.name as next_recipient_name,
              u.id as next_recipient_id,
              (SELECT COUNT(DISTINCT user_id) FROM payments WHERE circle_id = c.id AND cycle_number = c.current_cycle AND status = 'completed') as members_paid,
              (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id AND status = 'active') as total_active_members
       FROM circles c
       LEFT JOIN users u ON c.next_payout_user_id = u.id
       WHERE c.id = $1`,
      [circleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Circle not found", status: 404 },
      });
    }

    const pool = result.rows[0];
    const expectedPoolAmount = pool.monthly_amount * pool.total_active_members;
    const poolProgress = (pool.current_pool_amount / expectedPoolAmount) * 100;

    // Get detailed member payment status
    const memberPaymentsResult = await query(
      `SELECT 
         cm.user_id,
         u.name as user_name,
         p.id as payment_id,
         p.created_at as payment_date,
         p.status as payment_status
       FROM circle_members cm
       JOIN users u ON cm.user_id = u.id
       LEFT JOIN payments p ON cm.user_id = p.user_id 
         AND p.circle_id = $1 
         AND p.cycle_number = $2 
         AND p.status = 'completed'
       WHERE cm.circle_id = $1 AND cm.status = 'active'
       ORDER BY u.name`,
      [circleId, pool.current_cycle]
    );

    const memberPayments = memberPaymentsResult.rows.map((row) => ({
      user_id: row.user_id,
      user_name: row.user_name,
      has_paid: !!row.payment_id,
      payment_date: row.payment_date,
      payment_status: row.payment_status,
    }));

    res.json({
      success: true,
      data: {
        ...pool,
        expected_pool_amount: expectedPoolAmount,
        pool_progress: Math.min(poolProgress, 100),
        is_ready_for_payout:
          pool.members_paid >= pool.total_active_members || poolProgress >= 80,
        member_payments: memberPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout history for a user
 */
export const getUserPayouts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT p.*, c.name as circle_name
       FROM payouts p
       JOIN circles c ON p.circle_id = c.id
       WHERE p.recipient_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

new
