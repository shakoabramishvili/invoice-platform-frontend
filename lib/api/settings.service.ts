import apiClient from './client';
import { ApiResponse, Settings, Activity } from '@/types';

export interface ActivityLogQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  timestamp: string;
}

export const settingsService = {
  /**
   * Get application settings
   */
  get: async (): Promise<ApiResponse<Settings>> => {
    const response = await apiClient.get<ApiResponse<Settings>>('/settings');
    return response.data;
  },

  /**
   * Update application settings
   */
  update: async (data: Partial<Settings>): Promise<ApiResponse<Settings>> => {
    const response = await apiClient.put<ApiResponse<Settings>>('/settings', data);
    return response.data;
  },

  /**
   * Upload company logo
   */
  uploadLogo: async (file: File): Promise<ApiResponse<{ logoUrl: string }>> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post<ApiResponse<{ logoUrl: string }>>(
      '/settings/logo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete company logo
   */
  deleteLogo: async (): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>('/settings/logo');
    return response.data;
  },

  /**
   * Get activity logs
   */
  getActivityLogs: async (params?: ActivityLogQueryParams): Promise<ApiResponse<Activity[]>> => {
    const response = await apiClient.get<ApiResponse<Activity[]>>('/settings/activity-logs', {
      params,
    });
    return response.data;
  },

  /**
   * Get login history
   */
  getLoginHistory: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<LoginHistoryEntry[]>> => {
    const response = await apiClient.get<ApiResponse<LoginHistoryEntry[]>>(
      '/settings/login-history',
      { params }
    );
    return response.data;
  },

  /**
   * Test SMTP configuration
   */
  testSmtp: async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/settings/test-smtp'
    );
    return response.data;
  },

  /**
   * Export activity logs
   */
  exportActivityLogs: async (params?: ActivityLogQueryParams): Promise<Blob> => {
    const response = await apiClient.get('/settings/activity-logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Clear activity logs
   */
  clearActivityLogs: async (beforeDate?: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>('/settings/activity-logs', {
      data: { beforeDate },
    });
    return response.data;
  },
};
