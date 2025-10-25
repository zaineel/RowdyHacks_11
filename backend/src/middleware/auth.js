import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

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
  // This will be implemented once we have database access
  // For now, just pass through
  next();
};

/**
 * Check if user is circle member
 */
export const requireCircleMember = async (req, res, next) => {
  // This will be implemented once we have database access
  // For now, just pass through
  next();
};
