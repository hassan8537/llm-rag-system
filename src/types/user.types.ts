import { User } from '../models/user.model';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserResponse {
  success: boolean;
  data?: User | User[] | any;
  message: string;
  error?: string;
}

export interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}
