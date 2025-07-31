import { Request, Response } from 'express';

export abstract class BaseController {
  
  /**
   * Send success response
   */
  protected static sendSuccess(
    res: Response, 
    data: any = null, 
    message: string = 'Success', 
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send error response
   */
  protected static sendError(
    res: Response, 
    message: string = 'An error occurred', 
    statusCode: number = 400, 
    error?: string
  ): void {
    res.status(statusCode).json({
      success: false,
      message,
      ...(error && { error }),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send validation error response
   */
  protected static sendValidationError(
    res: Response, 
    message: string = 'Validation failed', 
    errors?: any[]
  ): void {
    res.status(422).json({
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send not found response
   */
  protected static sendNotFound(
    res: Response, 
    message: string = 'Resource not found'
  ): void {
    res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send internal server error response
   */
  protected static sendInternalError(
    res: Response, 
    error?: any
  ): void {
    console.error('Internal Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Parse integer parameter
   */
  protected static parseIntParam(param: string): number | null {
    const parsed = parseInt(param, 10);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Validate required fields
   */
  protected static validateRequiredFields(
    data: any, 
    requiredFields: string[]
  ): string[] {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  /**
   * Async handler wrapper to catch errors
   */
  protected static asyncHandler(
    fn: (req: Request, res: Response) => Promise<void>
  ) {
    return (req: Request, res: Response): void => {
      Promise.resolve(fn(req, res)).catch((error) => {
        console.error('Async Handler Error:', error);
        BaseController.sendInternalError(res, error);
      });
    };
  }
}
