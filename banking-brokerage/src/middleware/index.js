import { z } from 'zod';

/**
 * Request validation middleware
 * @param {Object} schemas - Validation schemas for different parts of the request
 * @param {z.ZodSchema} [schemas.params] - Parameters schema
 * @param {z.ZodSchema} [schemas.query] - Query parameters schema
 * @param {z.ZodSchema} [schemas.body] - Request body schema
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
};
