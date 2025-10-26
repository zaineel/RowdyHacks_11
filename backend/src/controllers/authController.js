import { query } from '../utils/db.js';

/**
 * Register a new user after Auth0 authentication
 */
export const register = async (req, res, next) => {
  try {
    const { name, phone_number, language_preference = 'en' } = req.body;
    const auth0_id = req.auth.sub;

    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: existingUser.rows[0],
        message: 'User already registered'
      });
    }

    // Create new user - convert empty phone number to null to avoid unique constraint violation
    const phoneValue = phone_number && phone_number.trim() !== '' ? phone_number : null;
    const result = await query(
      `INSERT INTO users (auth0_id, name, phone_number, language_preference)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [auth0_id, name, phoneValue, language_preference]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const auth0_id = req.auth.sub;

    const result = await query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
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
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const auth0_id = req.auth.sub;
    const { name, phone_number, language_preference } = req.body;

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (name) {
      updates.push(`name = $${paramCounter++}`);
      values.push(name);
    }
    if (phone_number) {
      updates.push(`phone_number = $${paramCounter++}`);
      values.push(phone_number);
    }
    if (language_preference) {
      updates.push(`language_preference = $${paramCounter++}`);
      values.push(language_preference);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No fields to update', status: 400 }
      });
    }

    values.push(auth0_id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE auth0_id = $${paramCounter} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
