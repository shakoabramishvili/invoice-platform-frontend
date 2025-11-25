import apiClient from './client';
import { ApiResponse, SalesReport, SalesReportFilters, SalesReportFormData } from '@/types';

export const salesReportService = {
  /**
   * Get all sales reports with optional filters
   */
  getAll: async (params?: SalesReportFilters): Promise<ApiResponse<SalesReport[]>> => {
    const response = await apiClient.get<ApiResponse<SalesReport[]>>('/sales-report', { params });
    return response.data;
  },

  /**
   * Get sales report by ID
   */
  getById: async (id: string): Promise<ApiResponse<SalesReport>> => {
    const response = await apiClient.get<ApiResponse<SalesReport>>(`/sales-report/${id}`);
    return response.data;
  },

  /**
   * Create new sales report
   */
  create: async (data: SalesReportFormData): Promise<ApiResponse<SalesReport>> => {
    const response = await apiClient.post<ApiResponse<SalesReport>>('/sales-report', data);
    return response.data;
  },

  /**
   * Update sales report
   */
  update: async (id: string, data: Partial<SalesReportFormData>): Promise<ApiResponse<SalesReport>> => {
    const response = await apiClient.put<ApiResponse<SalesReport>>(`/sales-report/${id}`, data);
    return response.data;
  },

  /**
   * Delete sales report (soft delete)
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/sales-report/${id}`);
    return response.data;
  },

  /**
   * Bulk update sales reports
   */
  bulkUpdate: async (ids: string[], data: Partial<SalesReportFormData>): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.patch<ApiResponse<{ count: number }>>('/sales-report/bulk/update', {
      ids,
      data,
    });
    return response.data;
  },

  /**
   * Bulk delete sales reports
   */
  bulkDelete: async (ids: string[]): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ count: number }>>('/sales-report', {
      data: { ids },
    });
    return response.data;
  },

  /**
   * Export sales reports to Excel
   */
  exportToExcel: async (params?: SalesReportFilters): Promise<Blob> => {
    const response = await apiClient.get('/sales-report/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
