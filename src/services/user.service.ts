import { User } from '../models/user.model';
import { CreateUserDto, UpdateUserDto, UserResponse } from '../types/user.types';
import bcrypt from 'bcryptjs';

export class UserService {
  
  /**
   * Create a new user
   */
  public static async createUser(userData: CreateUserDto): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User already exists with this email',
          message: 'Failed to create user',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        isActive: userData.isActive ?? true,
      });

      // Return user without password
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        data: userResponse,
        message: 'User created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create user',
      };
    }
  }

  /**
   * Get all users
   */
  public static async getAllUsers(): Promise<UserResponse> {
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']],
      });

      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve users',
      };
    }
  }

  /**
   * Get user by ID
   */
  public static async getUserById(id: number): Promise<UserResponse> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user',
      };
    }
  }

  /**
   * Get user by email
   */
  public static async getUserByEmail(email: string): Promise<UserResponse> {
    try {
      const user = await User.findByEmail(email);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user',
      };
    }
  }

  /**
   * Update user
   */
  public static async updateUser(id: number, userData: UpdateUserDto): Promise<UserResponse> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await user.update(userData);

      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update user',
      };
    }
  }

  /**
   * Delete user
   */
  public static async deleteUser(id: number): Promise<UserResponse> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await user.destroy();

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete user',
      };
    }
  }

  /**
   * Deactivate user
   */
  public static async deactivateUser(id: number): Promise<UserResponse> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await user.deactivate();

      return {
        success: true,
        data: user,
        message: 'User deactivated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to deactivate user',
      };
    }
  }
}
