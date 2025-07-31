export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any[];
  timestamp: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserQuery extends PaginationQuery {
  search?: string;
  isActive?: boolean;
  email?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
