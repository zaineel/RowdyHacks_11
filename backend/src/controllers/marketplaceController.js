import { query, transaction } from "../utils/db.js";

/**
 * Get all available items in marketplace
 */
export const listItems = async (req, res, next) => {
  try {
    const { category, search, status = "available" } = req.query;

    let queryText = `
      SELECT i.*,
        u.name as owner_name,
        u.credit_score as owner_credit_score,
        (SELECT COUNT(*) FROM item_borrows WHERE item_id = i.id AND status = 'completed') as total_borrows
      FROM items i
      JOIN users u ON i.owner_id = u.id
      WHERE i.status = $1
    `;
    const params = [status];
    let paramCount = 2;

    if (category && category !== "all") {
      queryText += ` AND i.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += " ORDER BY i.created_at DESC LIMIT 50";

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single item by ID
 */
export const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT i.*,
        u.name as owner_name,
        u.credit_score as owner_credit_score,
        u.phone_number as owner_phone,
        (SELECT COUNT(*) FROM item_borrows WHERE item_id = i.id AND status = 'completed') as total_borrows,
        (SELECT AVG(EXTRACT(EPOCH FROM (actual_return_date::timestamp - borrow_start_date::timestamp))/86400)
         FROM item_borrows
         WHERE item_id = i.id AND status = 'completed' AND actual_return_date IS NOT NULL) as avg_borrow_days
       FROM items i
       JOIN users u ON i.owner_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Item not found", status: 404 },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new item listing
 */
export const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      daily_rate,
      deposit_amount,
      min_credit_score,
    } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found", status: 404 },
      });
    }
    const owner_id = userResult.rows[0].id;

    // Validate required fields
    if (!title || !deposit_amount) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Title and deposit amount are required",
          status: 400,
        },
      });
    }

    const result = await query(
      `INSERT INTO items (owner_id, title, description, category, condition, daily_rate, deposit_amount, min_credit_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        owner_id,
        title,
        description,
        category || "other",
        condition || "good",
        daily_rate || 0,
        deposit_amount,
        min_credit_score || 500,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Item listed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item listing
 */
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      condition,
      daily_rate,
      deposit_amount,
      min_credit_score,
      status,
    } = req.body;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found", status: 404 },
      });
    }
    const user_id = userResult.rows[0].id;

    // Check if user owns this item
    const itemResult = await query("SELECT owner_id FROM items WHERE id = $1", [
      id,
    ]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Item not found", status: 404 },
      });
    }

    if (itemResult.rows[0].owner_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: { message: "You do not own this item", status: 403 },
      });
    }

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (title) {
      updates.push(`title = $${paramCounter++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (category) {
      updates.push(`category = $${paramCounter++}`);
      values.push(category);
    }
    if (condition) {
      updates.push(`condition = $${paramCounter++}`);
      values.push(condition);
    }
    if (daily_rate !== undefined) {
      updates.push(`daily_rate = $${paramCounter++}`);
      values.push(daily_rate);
    }
    if (deposit_amount !== undefined) {
      updates.push(`deposit_amount = $${paramCounter++}`);
      values.push(deposit_amount);
    }
    if (min_credit_score !== undefined) {
      updates.push(`min_credit_score = $${paramCounter++}`);
      values.push(min_credit_score);
    }
    if (status) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "No fields to update", status: 400 },
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE items SET ${updates.join(
        ", "
      )} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: "Item updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete item listing
 */
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found", status: 404 },
      });
    }
    const user_id = userResult.rows[0].id;

    // Check if user owns this item
    const itemResult = await query(
      "SELECT owner_id, status FROM items WHERE id = $1",
      [id]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Item not found", status: 404 },
      });
    }

    if (itemResult.rows[0].owner_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: { message: "You do not own this item", status: 403 },
      });
    }

    // Check if item is currently borrowed
    if (itemResult.rows[0].status === "borrowed") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cannot delete item while it is borrowed",
          status: 400,
        },
      });
    }

    await query("DELETE FROM items WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's own listings
 */
export const getMyListings = async (req, res, next) => {
  try {
    const auth0_id = req.auth.sub;

    // Get user ID
    const userResult = await query("SELECT id FROM users WHERE auth0_id = $1", [
      auth0_id,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found", status: 404 },
      });
    }
    const user_id = userResult.rows[0].id;

    const result = await query(
      `SELECT i.*,
        (SELECT COUNT(*) FROM item_borrows WHERE item_id = i.id AND status = 'requested') as pending_requests,
        (SELECT COUNT(*) FROM item_borrows WHERE item_id = i.id AND status = 'active') as active_borrows,
        (SELECT COUNT(*) FROM item_borrows WHERE item_id = i.id AND status = 'completed') as total_borrows
       FROM items i
       WHERE i.owner_id = $1
       ORDER BY i.created_at DESC`,
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
