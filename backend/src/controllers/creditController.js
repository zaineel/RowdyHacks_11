import { query } from '../utils/db.js';

export const getCreditScore = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT
        credit_score,
        total_payments_made,
        total_circles_joined,
        total_vouches_given,
        created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getCreditHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT ch.*, c.name as circle_name
       FROM credit_history ch
       LEFT JOIN circles c ON ch.circle_id = c.id
       WHERE ch.user_id = $1
       ORDER BY ch.created_at DESC
       LIMIT 100`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const generateCreditReport = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get user info
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }

    const user = userResult.rows[0];

    // Get circles
    const circlesResult = await query(
      `SELECT c.name, cm.status, cm.total_contributions, cm.missed_payments
       FROM circle_members cm
       JOIN circles c ON cm.circle_id = c.id
       WHERE cm.user_id = $1`,
      [userId]
    );

    // Get payment stats
    const paymentsResult = await query(
      `SELECT
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as on_time_payments,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_payments
       FROM payments
       WHERE user_id = $1`,
      [userId]
    );

    const report = {
      user: {
        name: user.name,
        credit_score: user.credit_score,
        member_since: user.created_at
      },
      circles: circlesResult.rows,
      payment_history: paymentsResult.rows[0],
      score_breakdown: {
        payment_reliability: Math.min(100, user.total_payments_made * 5),
        community_trust: Math.min(100, user.total_vouches_given * 10),
        longevity: Math.min(100, Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)))
      }
    };

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
