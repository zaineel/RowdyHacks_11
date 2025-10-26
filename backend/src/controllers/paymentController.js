import { query, transaction } from '../utils/db.js';
import { updateCreditScore } from '../services/creditService.js';

export const makePayment = async (req, res, next) => {
  try {
    const { circle_id, amount, payment_method, card_details } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_id = $1', [auth0_id]);
    const user_id = userResult.rows[0].id;

    // Get circle info
    const circleResult = await query('SELECT current_cycle FROM circles WHERE id = $1', [circle_id]);
    const cycle_number = circleResult.rows[0].current_cycle;

    // Validate payment method
    const validMethods = ['credit_card', 'debit_card', 'bank_account', 'digital_wallet', 'mock'];
    const finalPaymentMethod = validMethods.includes(payment_method) ? payment_method : 'mock';

    // TODO: In production, integrate with a payment processor (Stripe, Square, etc.)
    // For now, we'll simulate successful payment processing
    if (finalPaymentMethod === 'credit_card' || finalPaymentMethod === 'debit_card') {
      // In production, you would:
      // 1. Tokenize card details with payment processor
      // 2. Process the payment
      // 3. Handle success/failure responses
      // For demo: validate that card_details were provided
      if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv) {
        return res.status(400).json({
          success: false,
          error: { message: 'Card details are required for card payments', status: 400 }
        });
      }
    }

    const result = await transaction(async (client) => {
      // Create payment record
      const paymentResult = await client.query(
        `INSERT INTO payments (circle_id, user_id, amount, cycle_number, due_date, status, payment_method)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, 'completed', $5)
         RETURNING *`,
        [circle_id, user_id, amount, cycle_number, finalPaymentMethod]
      );

      // Update member contribution total
      await client.query(
        `UPDATE circle_members
         SET total_contributions = total_contributions + $1
         WHERE circle_id = $2 AND user_id = $3`,
        [amount, circle_id, user_id]
      );

      // Add payment to current pool
      await client.query(
        `UPDATE circles
         SET current_pool_amount = current_pool_amount + $1
         WHERE id = $2`,
        [amount, circle_id]
      );

      // Update credit score
      await updateCreditScore(user_id, 'payment_made', 10, circle_id, client);

      return paymentResult.rows[0];
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCirclePayments = async (req, res, next) => {
  try {
    const { circleId } = req.params;

    const result = await query(
      `SELECT p.*, u.name as user_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.circle_id = $1
       ORDER BY p.created_at DESC`,
      [circleId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getUserPayments = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT p.*, c.name as circle_name
       FROM payments p
       JOIN circles c ON p.circle_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.*, u.name as user_name, c.name as circle_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN circles c ON p.circle_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Payment not found', status: 404 }
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingPayments = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT p.*, c.name as circle_name, c.monthly_amount
       FROM payments p
       JOIN circles c ON p.circle_id = c.id
       WHERE p.user_id = $1 AND p.status = 'pending' AND p.due_date >= CURRENT_DATE
       ORDER BY p.due_date ASC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
