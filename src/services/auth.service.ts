import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { TokenBlacklistService } from './token-blacklist.service';

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignOutData {
  userId: number;
  token: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Sign out user (invalidate token on server side)
   */
  async signOut(data: SignOutData): Promise<{ message: string }> {
    // Verify user exists and is active
    const user = await User.findByPk(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Decode token to get expiration time
    try {
      const decoded = jwt.verify(data.token, this.jwtSecret) as jwt.JwtPayload;
      const expiresAt = new Date(decoded.exp! * 1000); // Convert to milliseconds
      
      // Add token to blacklist
      TokenBlacklistService.addToBlacklist(data.token, expiresAt);
      
      console.log(`Token blacklisted for user ${user.email}`);
    } catch (error) {
      // Token is already invalid, but that's okay
      console.log('Token was already invalid');
    }

    return {
      message: 'Successfully signed out - token invalidated'
    };
  }

  /**
   * Sign in user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    // Find user by email
    const user = await User.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  /**
   * Verify JWT token and check blacklist
   */
  verifyToken(token: string): { userId: number } {
    try {
      // Check if token is blacklisted first
      if (TokenBlacklistService.isBlacklisted(token)) {
        throw new Error('Token has been invalidated');
      }

      const decoded = jwt.verify(token, this.jwtSecret) as { userId: number };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: number): string {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
    );
  }
}
