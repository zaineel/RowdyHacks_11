import { query, transaction } from '../utils/db.js';

/**
 * Request to borrow an item
 */
export const requestBorrow = async (req, res, next) => {
  try {
    const { id: item_id } = req.params;
    const { borrow_start_date, borrow_end_date, notes } = req.body;
    const auth0_id = req.auth.sub;

    // Get borrower info
    const borrowerResult = await query('SELECT id, credit_score FROM users WHERE auth0_id = $1', [auth0_id]);
    if (borrowerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }
    const borrower = borrowerResult.rows[0];

    // Get item details
    const itemResult = await query(
      'SELECT * FROM items WHERE id = $1',
      [item_id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Item not found', status: 404 }
      });
    }

    const item = itemResult.rows[0];

    // Validate borrower isn't the owner
    if (item.owner_id === borrower.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot borrow your own item', status: 400 }
      });
    }

    // Check item availability
    if (item.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: { message: 'Item is not available for borrowing', status: 400 }
      });
    }

    // Check credit score requirement
    if (borrower.credit_score < item.min_credit_score) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Your credit score (${borrower.credit_score}) is below the minimum required (${item.min_credit_score})`,
          status: 403
        }
      });
    }

    // Calculate rental fee
    const startDate = new Date(borrow_start_date);
    const endDate = new Date(borrow_end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const rental_fee = item.daily_rate * days;

    // Create borrow request
    const result = await query(
      `INSERT INTO item_borrows (item_id, borrower_id, owner_id, borrow_start_date, borrow_end_date, deposit_paid, rental_fee_paid, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'requested')
       RETURNING *`,
      [item_id, borrower.id, item.owner_id, borrow_start_date, borrow_end_date, item.deposit_amount, rental_fee, notes]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Borrow request sent successfully!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a borrow request (owner only)
 */
export const approveBorrow = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
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

    const result = await transaction(async (client) => {
      // Get borrow request
      const borrowResult = await client.query(
        'SELECT * FROM item_borrows WHERE id = $1',
        [borrowId]
      );

      if (borrowResult.rows.length === 0) {
        throw new Error('Borrow request not found');
      }

      const borrow = borrowResult.rows[0];

      // Verify owner
      if (borrow.owner_id !== user_id) {
        throw new Error('You are not the owner of this item');
      }

      // Verify status
      if (borrow.status !== 'requested') {
        throw new Error('This borrow request cannot be approved');
      }

      // Update borrow status
      const updateBorrow = await client.query(
        `UPDATE item_borrows SET status = 'approved' WHERE id = $1 RETURNING *`,
        [borrowId]
      );

      // Update item status
      await client.query(
        `UPDATE items SET status = 'borrowed' WHERE id = $1`,
        [borrow.item_id]
      );

      return updateBorrow.rows[0];
    });

    res.json({
      success: true,
      data: result,
      message: 'Borrow request approved!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a borrow request (owner only)
 */
export const rejectBorrow = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
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

    // Get borrow request
    const borrowResult = await query(
      'SELECT * FROM item_borrows WHERE id = $1',
      [borrowId]
    );

    if (borrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Borrow request not found', status: 404 }
      });
    }

    const borrow = borrowResult.rows[0];

    // Verify owner
    if (borrow.owner_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: { message: 'You are not the owner of this item', status: 403 }
      });
    }

    // Update status
    const result = await query(
      `UPDATE item_borrows SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [borrowId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Borrow request rejected'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark item as returned (borrower)
 */
export const markReturned = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
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

    const result = await query(
      `UPDATE item_borrows
       SET status = 'returned', actual_return_date = CURRENT_DATE
       WHERE id = $1 AND borrower_id = $2 AND status = 'approved'
       RETURNING *`,
      [borrowId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Borrow transaction not found or cannot be returned', status: 404 }
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Item marked as returned. Waiting for owner confirmation.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete borrow transaction (owner confirms return, refunds deposit, awards credit)
 */
export const completeBorrow = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
    const { item_condition_good = true } = req.body;
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

    const result = await transaction(async (client) => {
      // Get borrow transaction
      const borrowResult = await client.query(
        'SELECT * FROM item_borrows WHERE id = $1',
        [borrowId]
      );

      if (borrowResult.rows.length === 0) {
        throw new Error('Borrow transaction not found');
      }

      const borrow = borrowResult.rows[0];

      // Verify owner
      if (borrow.owner_id !== user_id) {
        throw new Error('You are not the owner of this item');
      }

      // Verify status
      if (borrow.status !== 'returned') {
        throw new Error('Item must be marked as returned first');
      }

      // Check if returned on time
      const returnDate = new Date(borrow.actual_return_date);
      const dueDate = new Date(borrow.borrow_end_date);
      const isLate = returnDate > dueDate;
      const daysLate = isLate ? Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)) : 0;

      // Calculate deposit refund
      const deposit_refund = item_condition_good ? borrow.deposit_paid : borrow.deposit_paid * 0.5;

      // Update borrow status
      const updateBorrow = await client.query(
        `UPDATE item_borrows
         SET status = 'completed', deposit_refunded = $1
         WHERE id = $2
         RETURNING *`,
        [deposit_refund, borrowId]
      );

      // Update item status back to available
      await client.query(
        `UPDATE items SET status = 'available' WHERE id = $1`,
        [borrow.item_id]
      );

      // Award credit points
      // Lender gets +10 points for successful lending
      await client.query(
        `UPDATE users SET credit_score = credit_score + 10 WHERE id = $1`,
        [borrow.owner_id]
      );

      // Borrower gets points based on performance
      let borrowerPoints = 15; // Base points for successful return
      if (isLate) {
        borrowerPoints -= Math.min(25, daysLate * 5); // Penalty for late return
      }
      if (!item_condition_good) {
        borrowerPoints -= 10; // Penalty for damage
      }

      if (borrowerPoints > 0) {
        await client.query(
          `UPDATE users SET credit_score = credit_score + $1 WHERE id = $2`,
          [borrowerPoints, borrow.borrower_id]
        );
      } else {
        await client.query(
          `UPDATE users SET credit_score = credit_score - $1 WHERE id = $2`,
          [Math.abs(borrowerPoints), borrow.borrower_id]
        );
      }

      // Record credit history for both parties
      await client.query(
        `INSERT INTO credit_history (user_id, event_type, impact, description)
         VALUES ($1, 'marketplace_lending', 10, 'Successfully lent item in marketplace')`,
        [borrow.owner_id]
      );

      await client.query(
        `INSERT INTO credit_history (user_id, event_type, impact, description)
         VALUES ($1, 'marketplace_borrowing', $2, $3)`,
        [borrow.borrower_id, borrowerPoints, `Borrowed and returned item${isLate ? ' (late)' : ''}${!item_condition_good ? ' (damaged)' : ''}`]
      );

      return {
        borrow: updateBorrow.rows[0],
        creditAwarded: {
          lender: 10,
          borrower: borrowerPoints
        },
        depositRefunded: deposit_refund
      };
    });

    res.json({
      success: true,
      data: result,
      message: `Transaction completed! Deposit refunded: $${result.depositRefunded}. Credit awarded.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's borrow history
 */
export const getMyBorrows = async (req, res, next) => {
  try {
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

    const result = await query(
      `SELECT ib.*,
        i.title as item_title,
        i.category as item_category,
        u.name as owner_name
       FROM item_borrows ib
       JOIN items i ON ib.item_id = i.id
       JOIN users u ON ib.owner_id = u.id
       WHERE ib.borrower_id = $1
       ORDER BY ib.created_at DESC`,
      [user_id]
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
 * Get pending borrow requests for owner's items
 */
export const getPendingRequests = async (req, res, next) => {
  try {
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

    const result = await query(
      `SELECT ib.*,
        i.title as item_title,
        i.category as item_category,
        u.name as borrower_name,
        u.credit_score as borrower_credit_score
       FROM item_borrows ib
       JOIN items i ON ib.item_id = i.id
       JOIN users u ON ib.borrower_id = u.id
       WHERE ib.owner_id = $1 AND ib.status = 'requested'
       ORDER BY ib.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
