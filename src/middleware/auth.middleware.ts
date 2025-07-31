import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export class AuthMiddleware {
  private static authService = new AuthService();

  /**
   * Middleware to authenticate JWT token
   */
  static authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = AuthMiddleware.authService.verifyToken(token);
      
      // Get user from database
      const user = await AuthMiddleware.authService.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid token or user not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Optional authentication middleware (doesn't fail if no token)
   */
  static optionalAuthenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = AuthMiddleware.authService.verifyToken(token);
        const user = await AuthMiddleware.authService.getUserById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = user;
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
}
