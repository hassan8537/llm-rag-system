import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for user creation
 */
export const validateCreateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email } = req.body;
  const errors: string[] = [];

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  if (req.body.phone && typeof req.body.phone === 'string') {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(req.body.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  if (errors.length > 0) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Validation middleware for user update
 */
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, phone } = req.body;
  const errors: string[] = [];

  if (firstName !== undefined) {
    if (typeof firstName !== 'string' || firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== 'string' || lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string') {
      errors.push('Email must be a string');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }
  }

  if (phone !== undefined && phone !== null) {
    if (typeof phone === 'string') {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        errors.push('Invalid phone number format');
      }
    } else {
      errors.push('Phone must be a string');
    }
  }

  if (errors.length > 0) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Validation middleware for ID parameters
 */
export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid ID parameter',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Validation middleware for email parameters
 */
export const validateEmailParam = (req: Request, res: Response, next: NextFunction): void => {
  const email = req.params.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email parameter',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};
