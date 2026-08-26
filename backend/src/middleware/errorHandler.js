/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred while processing weather analytics.',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
