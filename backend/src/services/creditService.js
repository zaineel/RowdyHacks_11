import { query } from '../utils/db.js';

/**
 * Update user credit score based on an event
 * @param {string} userId - User ID
 * @param {string} eventType - Type of event (payment_made, payment_missed, vouch_given, etc.)
 * @param {number} impact - Points to add/subtract
 * @param {string} circleId - Circle ID (optional)
 * @param {object} client - Database client (for transactions)
 */
export const updateCreditScore = async (userId, eventType, impact, circleId = null, client = null) => {
  const db = client || { query: query };

  // Get current credit score
  const userResult = await db.query(
    'SELECT credit_score FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const previousScore = userResult.rows[0].credit_score;
  const newScore = Math.max(300, Math.min(850, previousScore + impact)); // Keep score between 300-850

  // Update user's credit score
  await db.query(
    'UPDATE users SET credit_score = $1 WHERE id = $2',
    [newScore, userId]
  );

  // Record in credit history
  await db.query(
    `INSERT INTO credit_history (user_id, event_type, impact, previous_score, new_score, circle_id, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, eventType, impact, previousScore, newScore, circleId, getEventDescription(eventType, impact)]
  );

  // Update user stats
  if (eventType === 'payment_made') {
    await db.query(
      'UPDATE users SET total_payments_made = total_payments_made + 1 WHERE id = $1',
      [userId]
    );
  } else if (eventType === 'vouch_given') {
    await db.query(
      'UPDATE users SET total_vouches_given = total_vouches_given + 1 WHERE id = $1',
      [userId]
    );
  }

  return { previousScore, newScore, impact };
};

/**
 * Get description for credit event
 */
const getEventDescription = (eventType, impact) => {
  const descriptions = {
    payment_made: impact > 0 ? 'Made on-time payment' : 'Made late payment',
    payment_missed: 'Missed payment deadline',
    vouch_given: 'Vouched for a new member',
    vouch_received: 'Received vouch from member',
    payout_received: 'Received payout from circle',
    circle_joined: 'Joined a new lending circle',
    circle_completed: 'Successfully completed a circle cycle'
  };

  return descriptions[eventType] || eventType;
};

/**
 * Calculate credit score factors for a user
 */
export const getCreditFactors = async (userId) => {
  // Payment history (35% of score)
  const paymentResult = await query(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as missed
     FROM payments
     WHERE user_id = $1`,
    [userId]
  );

  // Circle participation (20% of score)
  const circleResult = await query(
    `SELECT
      COUNT(*) as total_circles,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_circles
     FROM circle_members
     WHERE user_id = $1`,
    [userId]
  );

  // Vouching history (15% of score)
  const vouchResult = await query(
    `SELECT COUNT(*) as vouches_given FROM vouches WHERE voucher_id = $1 AND status = 'active'
     UNION ALL
     SELECT COUNT(*) as vouches_received FROM vouches WHERE vouchee_id = $1 AND status = 'active'`,
    [userId, userId]
  );

  return {
    paymentHistory: paymentResult.rows[0],
    circleParticipation: circleResult.rows[0],
    vouchingHistory: {
      given: parseInt(vouchResult.rows[0]?.vouches_given || 0),
      received: parseInt(vouchResult.rows[1]?.vouches_received || 0)
    }
  };
};
