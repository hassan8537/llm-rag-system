import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error
  let message = 'Internal server error';
  let statusCode = 500;

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Validation error';
    const errors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    
    res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    const field = error.errors[0]?.path || 'unknown';
    
    res.status(statusCode).json({
      success: false,
      message: `${field} already exists`,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Sequelize foreign key constraint errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
    
    res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Sequelize connection errors
  if (error.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection error';
    
    res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Custom application errors
  if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
