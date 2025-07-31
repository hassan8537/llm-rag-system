import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../types/user.types';
import { BaseController } from './base.controller';

export class UserController extends BaseController {
  
  /**
   * Create a new user
   */
  public static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;
      
      // Validate required fields
      const missingFields = UserController.validateRequiredFields(userData, [
        'firstName', 
        'lastName', 
        'email',
        'password'
      ]);

      if (missingFields.length > 0) {
        UserController.sendValidationError(
          res, 
          `Missing required fields: ${missingFields.join(', ')}`
        );
        return;
      }

      const result = await UserService.createUser(userData);
      
      if (result.success) {
        UserController.sendSuccess(res, result.data, result.message, 201);
      } else {
        UserController.sendError(res, result.message, 400, result.error);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }

  /**
   * Get all users
   */
  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await UserService.getAllUsers();
      
      if (result.success) {
        UserController.sendSuccess(res, result.data, result.message);
      } else {
        UserController.sendError(res, result.message, 400, result.error);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }

  /**
   * Get user by ID
   */
  public static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = UserController.parseIntParam(req.params.id);
      
      if (id === null) {
        UserController.sendValidationError(res, 'Invalid user ID');
        return;
      }

      const result = await UserService.getUserById(id);
      
      if (result.success) {
        UserController.sendSuccess(res, result.data, result.message);
      } else {
        UserController.sendNotFound(res, result.message);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }

  /**
   * Get user by email
   */
  public static async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const email = req.params.email;
      const result = await UserService.getUserByEmail(email);
      
      if (result.success) {
        UserController.sendSuccess(res, result.data, result.message);
      } else {
        UserController.sendNotFound(res, result.message);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }

  /**
   * Update user
   */
  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = UserController.parseIntParam(req.params.id);
      const userData: UpdateUserDto = req.body;
      
      if (id === null) {
        UserController.sendValidationError(res, 'Invalid user ID');
        return;
      }

      const result = await UserService.updateUser(id, userData);
      
      if (result.success) {
        UserController.sendSuccess(res, result.data, result.message);
      } else {
        UserController.sendNotFound(res, result.message);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }

  /**
   * Deactivate user
   */
  public static async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = UserController.parseIntParam(req.params.id);
      
      if (id === null) {
        UserController.sendValidationError(res, 'Invalid user ID');
        return;
      }

      const result = await UserService.deactivateUser(id);
      
      if (result.success) {
        UserController.sendSuccess(res, result.data, result.message);
      } else {
        UserController.sendNotFound(res, result.message);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }

  /**
   * Delete user
   */
  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = UserController.parseIntParam(req.params.id);
      
      if (id === null) {
        UserController.sendValidationError(res, 'Invalid user ID');
        return;
      }

      const result = await UserService.deleteUser(id);
      
      if (result.success) {
        UserController.sendSuccess(res, null, result.message);
      } else {
        UserController.sendNotFound(res, result.message);
      }
    } catch (error: any) {
      UserController.sendInternalError(res, error);
    }
  }
}
