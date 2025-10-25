import { query } from '../utils/db.js';

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);

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

export const getUserCircles = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, cm.status as member_status, cm.role
       FROM circles c
       JOIN circle_members cm ON c.id = cm.circle_id
       WHERE cm.user_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getCreditHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM credit_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
