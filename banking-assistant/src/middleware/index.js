import { ZodError } from 'zod';

/**
 * Validation middleware factory
 * @param {Object} schemas - Object containing validation schemas
 * @param {import('zod').ZodSchema} [schemas.params] - Parameters schema
 * @param {import('zod').ZodSchema} [schemas.query] - Query parameters schema
 * @param {import('zod').ZodSchema} [schemas.body] - Request body schema
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schemas) => (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    
    return next(error);
  }
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 handler middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
    path: req.path,
  });
};
