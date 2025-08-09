import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { AuthService, SignInData, SignOutData } from '../services/auth.service';

export class AuthController extends BaseController {
  private static authService = new AuthService();

  /**
   * Sign in user
   */
  static signIn = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate required fields
    const requiredFields = ['email', 'password'];
    const missingFields = BaseController.validateRequiredFields(req.body, requiredFields);

    if (missingFields.length > 0) {
      BaseController.sendValidationError(res, 'Missing required fields', missingFields);
      return;
    }

    try {
      const signInData: SignInData = { email, password };
      const result = await AuthController.authService.signIn(signInData);
      
      BaseController.sendSuccess(res, result, 'Sign in successful');
    } catch (error: any) {
      if (error.message.includes('Invalid email or password') || error.message.includes('Account is deactivated')) {
        BaseController.sendError(res, error.message, 401);
      } else {
        BaseController.sendInternalError(res, error);
      }
    }
  });

  /**
   * Sign out user
   */
  static signOut = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Get user from auth middleware
    const user = (req as any).user;
    
    if (!user) {
      BaseController.sendError(res, 'User not authenticated', 401);
      return;
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      BaseController.sendError(res, 'Token not provided', 400);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const signOutData: SignOutData = { 
        userId: user.id,
        token: token
      };
      const result = await AuthController.authService.signOut(signOutData);
      
      BaseController.sendSuccess(res, result, 'Sign out successful');
    } catch (error: any) {
      BaseController.sendInternalError(res, error);
    }
  });

  /**
   * Get current user profile
   */
  static getProfile = BaseController.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // User is attached to request by auth middleware
    const user = (req as any).user;
    
    if (!user) {
      BaseController.sendError(res, 'User not found', 404);
      return;
    }

    BaseController.sendSuccess(res, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role || "user",
      isActive: user.isActive,
    }, 'Profile retrieved successfully');
  });
}
