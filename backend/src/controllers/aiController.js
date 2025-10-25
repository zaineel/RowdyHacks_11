import { assessMemberRisk, detectFraudPatterns } from '../services/geminiService.js';
import { query } from '../utils/db.js';

export const assessRisk = async (req, res, next) => {
  try {
    const { circle_id, user_id } = req.body;

    // Get user data
    const userResult = await query(
      `SELECT u.*,
        (SELECT COUNT(*) FROM circle_members WHERE user_id = u.id) as circles_count,
        (SELECT COUNT(*) FROM payments WHERE user_id = u.id AND status = 'completed') as completed_payments,
        (SELECT COUNT(*) FROM payments WHERE user_id = u.id AND status = 'failed') as failed_payments
       FROM users u
       WHERE u.id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
      });
    }

    const userData = userResult.rows[0];

    // Get vouches for this user in this circle
    const vouchesResult = await query(
      'SELECT COUNT(*) as vouch_count FROM vouches WHERE circle_id = $1 AND vouchee_id = $2 AND status = \'active\'',
      [circle_id, user_id]
    );

    const vouchCount = vouchesResult.rows[0].vouch_count;

    // Call AI service
    const assessment = await assessMemberRisk({
      userId: user_id,
      circleId: circle_id,
      creditScore: userData.credit_score,
      totalCircles: userData.circles_count,
      completedPayments: userData.completed_payments,
      failedPayments: userData.failed_payments,
      vouchCount: parseInt(vouchCount)
    });

    // Save assessment to database
    await query(
      `INSERT INTO risk_assessments (user_id, circle_id, assessment_type, risk_score, risk_level, factors, ai_model_version, recommendations)
       VALUES ($1, $2, 'join_request', $3, $4, $5, 'gemini-1.5', $6)`,
      [user_id, circle_id, assessment.riskScore, assessment.riskLevel, JSON.stringify(assessment.factors), assessment.recommendations]
    );

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

export const detectFraud = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    // Get payment history
    const paymentsResult = await query(
      `SELECT p.*, c.name as circle_name
       FROM payments p
       JOIN circles c ON p.circle_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [user_id]
    );

    // Get circle memberships
    const circlesResult = await query(
      `SELECT c.*, cm.status as member_status
       FROM circles c
       JOIN circle_members cm ON c.id = cm.circle_id
       WHERE cm.user_id = $1`,
      [user_id]
    );

    // Call AI service
    const fraudAnalysis = await detectFraudPatterns({
      userId: user_id,
      payments: paymentsResult.rows,
      circles: circlesResult.rows
    });

    res.json({
      success: true,
      data: fraudAnalysis
    });
  } catch (error) {
    next(error);
  }
};

export const getRiskHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT ra.*, c.name as circle_name
       FROM risk_assessments ra
       LEFT JOIN circles c ON ra.circle_id = c.id
       WHERE ra.user_id = $1
       ORDER BY ra.created_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
