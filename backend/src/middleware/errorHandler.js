/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error status and message
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      status
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.error.status = 400;
    errorResponse.error.message = 'Validation Error';
    errorResponse.error.details = err.details || err.errors;
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse.error.status = 401;
    errorResponse.error.message = 'Unauthorized - Invalid or missing token';
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    errorResponse.error.status = 409;
    errorResponse.error.message = 'Resource already exists';
  }

  res.status(errorResponse.error.status).json(errorResponse);
};
