/**
 * 404 Not Found middleware
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      status: 404
    }
  });
};
