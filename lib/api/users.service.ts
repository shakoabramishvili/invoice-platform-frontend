import apiClient from './client';
import { ApiResponse, User, UserFormData } from '@/types';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const usersService = {
  /**
   * Get all users with optional filters
   */
  getAll: async (params?: UserQueryParams): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: UserFormData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  update: async (id: string, data: Partial<UserFormData>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user status
   */
  updateStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Update user role
   */
  updateRole: async (id: string, role: 'ADMIN' | 'OPERATOR' | 'VIEWER'): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  /**
   * Reset user password (admin only)
   */
  resetPassword: async (id: string, newPassword: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/users/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  /**
   * Get user activity logs
   */
  getActivityLogs: async (id: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    action: string;
    resource: string;
    details?: string;
    timestamp: string;
  }>>> => {
    const response = await apiClient.get(`/users/${id}/activity`, { params });
    return response.data;
  },
};
