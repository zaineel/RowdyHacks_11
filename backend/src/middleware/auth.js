import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';
import { query } from '../utils/db.js';

dotenv.config();

/**
 * Auth0 JWT validation middleware
 */
export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER}.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER,
  algorithms: ['RS256'],
  credentialsRequired: true
});

/**
 * Optional JWT validation (doesn't fail if no token)
 */
export const optionalJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER}.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER,
  algorithms: ['RS256'],
  credentialsRequired: false
});

/**
 * Check if user has specific role
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', status: 401 }
      });
    }

    const userRoles = req.auth.permissions || req.auth['https://payitforward.com/roles'] || [];

    if (!userRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Forbidden - Requires ${role} role`,
          status: 403
        }
      });
    }

    next();
  };
};

/**
 * Check if user is circle admin
 */
export const requireCircleAdmin = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized - Authentication required', status: 401 }
      });
    }

    const auth0_id = req.auth.sub;
    const circleId = req.params.id || req.params.circleId;

    if (!circleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Circle ID is required', status: 400 }
      });
    }

    // Query to check if user is an admin of this circle
    const result = await query(
      `SELECT cm.role, cm.status
       FROM circle_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.circle_id = $1 AND u.auth0_id = $2`,
      [circleId, auth0_id]
    );

    // Check if user is a member
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden - You are not a member of this circle', status: 403 }
      });
    }

    const membership = result.rows[0];

    // Check if member status is active
    if (membership.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: { message: `Forbidden - Your membership status is ${membership.status}`, status: 403 }
      });
    }

    // Check if user has admin role
    if (membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden - Admin privileges required', status: 403 }
      });
    }

    // User is authorized as admin
    next();
  } catch (error) {
    console.error('Error in requireCircleAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error', status: 500 }
    });
  }
};

/**
 * Check if user is circle member
 */
export const requireCircleMember = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized - Authentication required', status: 401 }
      });
    }

    const auth0_id = req.auth.sub;
    const circleId = req.params.id || req.params.circleId;

    if (!circleId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Circle ID is required', status: 400 }
      });
    }

    // Query to check if user is a member of this circle
    const result = await query(
      `SELECT cm.status
       FROM circle_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.circle_id = $1 AND u.auth0_id = $2`,
      [circleId, auth0_id]
    );

    // Check if user is a member
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden - You are not a member of this circle', status: 403 }
      });
    }

    const membership = result.rows[0];

    // Check if member status is active
    if (membership.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: { message: `Forbidden - Your membership status is ${membership.status}`, status: 403 }
      });
    }

    // User is authorized as member
    next();
  } catch (error) {
    console.error('Error in requireCircleMember middleware:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error', status: 500 }
    });
  }
};
