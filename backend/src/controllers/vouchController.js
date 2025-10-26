import { query } from '../utils/db.js';
import { updateCreditScore } from '../services/creditService.js';

export const createVouch = async (req, res, next) => {
  try {
    const { circle_id, vouchee_id, trust_level = 5, notes } = req.body;
    const auth0_id = req.auth.sub;

    // Get voucher ID
    const userResult = await query('SELECT id FROM users WHERE auth0_id = $1', [auth0_id]);
    const voucher_id = userResult.rows[0].id;

    // Check if user has already vouched for this person in this circle
    const existingVouch = await query(
      'SELECT * FROM vouches WHERE circle_id = $1 AND voucher_id = $2 AND vouchee_id = $3',
      [circle_id, voucher_id, vouchee_id]
    );

    if (existingVouch.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'You have already vouched for this member',
          status: 409
        }
      });
    }

    const result = await query(
      `INSERT INTO vouches (circle_id, voucher_id, vouchee_id, trust_level, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [circle_id, voucher_id, vouchee_id, trust_level, notes]
    );

    // Update credit scores
    await updateCreditScore(voucher_id, 'vouch_given', 5, circle_id);
    await updateCreditScore(vouchee_id, 'vouch_received', 15, circle_id);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Vouch created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserVouches = async (req, res, next) => {
  try {
    const { circleId, userId } = req.params;

    const result = await query(
      `SELECT v.*, u.name as voucher_name, u.credit_score as voucher_credit_score
       FROM vouches v
       JOIN users u ON v.voucher_id = u.id
       WHERE v.circle_id = $1 AND v.vouchee_id = $2 AND v.status = 'active'
       ORDER BY v.created_at DESC`,
      [circleId, userId]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
};

export const revokeVouch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE vouches SET status = 'revoked' WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Vouch revoked'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyVouchesInCircle = async (req, res, next) => {
  try {
    const { circleId } = req.params;
    const auth0_id = req.auth.sub;

    // Get voucher ID
    const userResult = await query('SELECT id FROM users WHERE auth0_id = $1', [auth0_id]);
    const voucher_id = userResult.rows[0].id;

    const result = await query(
      `SELECT v.*, u.name as vouchee_name
       FROM vouches v
       JOIN users u ON v.vouchee_id = u.id
       WHERE v.circle_id = $1 AND v.voucher_id = $2 AND v.status = 'active'
       ORDER BY v.created_at DESC`,
      [circleId, voucher_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
