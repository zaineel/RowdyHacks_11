import { query, transaction } from '../utils/db.js';
import crypto from 'crypto';

/**
 * Generate unique invite code
 */
const generateInviteCode = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase();
};

/**
 * Create a new circle
 */
export const createCircle = async (req, res, next) => {
  try {
    const { name, description, monthly_amount, max_members = 20 } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_id = $1', [auth0_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }
    const admin_id = userResult.rows[0].id;

    const invite_code = generateInviteCode();

    // Create circle and add admin as first member
    const result = await transaction(async (client) => {
      // Create circle
      const circleResult = await client.query(
        `INSERT INTO circles (name, description, admin_id, monthly_amount, max_members, invite_code)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description, admin_id, monthly_amount, max_members, invite_code]
      );

      const circle = circleResult.rows[0];

      // Add admin as first member
      await client.query(
        `INSERT INTO circle_members (circle_id, user_id, status, role, position_in_cycle)
         VALUES ($1, $2, 'active', 'admin', 1)`,
        [circle.id, admin_id]
      );

      // Initialize payout order
      await client.query(
        `UPDATE circles SET payout_order = $1 WHERE id = $2`,
        [JSON.stringify([admin_id]), circle.id]
      );

      return circle;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Circle created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get circle by ID
 */
export const getCircleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, u.name as admin_name
       FROM circles c
       LEFT JOIN users u ON c.admin_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Circle not found', status: 404 }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a circle with invite code
 */
export const joinCircle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { invite_code } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_id = $1', [auth0_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }
    const user_id = userResult.rows[0].id;

    // Verify circle and invite code
    const circleResult = await query(
      'SELECT * FROM circles WHERE id = $1 AND invite_code = $2',
      [id, invite_code]
    );

    if (circleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invalid circle or invite code', status: 404 }
      });
    }

    const circle = circleResult.rows[0];

    // Check if circle is full
    if (circle.current_members >= circle.max_members) {
      return res.status(400).json({
        success: false,
        error: { message: 'Circle is full', status: 400 }
      });
    }

    // Check if user is already a member
    const memberCheck = await query(
      'SELECT * FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Already a member of this circle', status: 400 }
      });
    }

    // Add user as pending member
    const result = await query(
      `INSERT INTO circle_members (circle_id, user_id, status, role)
       VALUES ($1, $2, 'pending', 'member')
       RETURNING *`,
      [id, user_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Join request submitted. Waiting for approval.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get circle members
 */
export const getCircleMembers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT cm.*, u.name, u.credit_score, u.phone_number
       FROM circle_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.circle_id = $1
       ORDER BY cm.position_in_cycle`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update circle
 */
export const updateCircle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (name) {
      updates.push(`name = $${paramCounter++}`);
      values.push(name);
    }
    if (description) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (status) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No fields to update', status: 400 }
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE circles SET ${updates.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Circle updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disband a circle
 */
export const disbandCircle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE circles SET status = 'disbanded' WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Circle disbanded'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a pending member
 */
export const approveMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Update member status and assign position
    const result = await transaction(async (client) => {
      // Get current max position
      const maxPosition = await client.query(
        'SELECT COALESCE(MAX(position_in_cycle), 0) as max_pos FROM circle_members WHERE circle_id = $1',
        [id]
      );

      const newPosition = maxPosition.rows[0].max_pos + 1;

      // Update member
      const memberResult = await client.query(
        `UPDATE circle_members
         SET status = 'active', position_in_cycle = $1
         WHERE circle_id = $2 AND user_id = $3
         RETURNING *`,
        [newPosition, id, user_id]
      );

      // Update circle member count
      await client.query(
        'UPDATE circles SET current_members = current_members + 1 WHERE id = $1',
        [id]
      );

      // Update payout order
      const circle = await client.query('SELECT payout_order FROM circles WHERE id = $1', [id]);
      let payoutOrder = circle.rows[0].payout_order || [];
      payoutOrder.push(user_id);
      await client.query(
        'UPDATE circles SET payout_order = $1 WHERE id = $2',
        [JSON.stringify(payoutOrder), id]
      );

      return memberResult.rows[0];
    });

    res.json({
      success: true,
      data: result,
      message: 'Member approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout schedule
 */
export const getPayoutSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        cm.position_in_cycle,
        cm.has_received_payout,
        cm.payout_received_date,
        u.id as user_id,
        u.name as user_name,
        c.monthly_amount,
        c.current_cycle
       FROM circle_members cm
       JOIN users u ON cm.user_id = u.id
       JOIN circles c ON cm.circle_id = c.id
       WHERE cm.circle_id = $1 AND cm.status = 'active'
       ORDER BY cm.position_in_cycle`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a circle using only invite code
 */
export const joinCircleByInviteCode = async (req, res, next) => {
  try {
    const { invite_code } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_id = $1', [auth0_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }
    const user_id = userResult.rows[0].id;

    // Find circle by invite code
    const circleResult = await query(
      'SELECT * FROM circles WHERE invite_code = $1',
      [invite_code.toUpperCase()]
    );

    if (circleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invalid invite code', status: 404 }
      });
    }

    const circle = circleResult.rows[0];

    // Check if circle is full
    if (circle.current_members >= circle.max_members) {
      return res.status(400).json({
        success: false,
        error: { message: 'Circle is full', status: 400 }
      });
    }

    // Check if user is already a member
    const memberCheck = await query(
      'SELECT * FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circle.id, user_id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Already a member of this circle', status: 400 }
      });
    }

    // Add user as pending member
    const result = await query(
      `INSERT INTO circle_members (circle_id, user_id, status, role)
       VALUES ($1, $2, 'pending', 'member')
       RETURNING *`,
      [circle.id, user_id]
    );

    res.status(201).json({
      success: true,
      data: { ...result.rows[0], circle },
      message: 'Join request submitted. Waiting for approval.'
    });
  } catch (error) {
    next(error);
  }
};
