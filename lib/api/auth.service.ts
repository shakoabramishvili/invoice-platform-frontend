import apiClient from './client';
import { ApiResponse, AuthResponse, User, LoginFormData, RegisterFormData } from '@/types';

export const authService = {
  /**
   * Login user
   */
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
};
