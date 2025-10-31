import apiClient from './client';
import { ApiResponse, Seller, SellerFormData } from '@/types';

export interface SellerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  country?: string;
}

export const sellersService = {
  /**
   * Get all sellers with optional filters
   */
  getAll: async (params?: SellerQueryParams): Promise<ApiResponse<Seller[]>> => {
    const response = await apiClient.get<ApiResponse<Seller[]>>('/sellers', { params });
    return response.data;
  },

  /**
   * Get seller by ID
   */
  getById: async (id: string): Promise<ApiResponse<Seller>> => {
    const response = await apiClient.get<ApiResponse<Seller>>(`/sellers/${id}`);
    return response.data;
  },

  /**
   * Create new seller
   */
  create: async (data: SellerFormData | FormData): Promise<ApiResponse<Seller>> => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    const response = await apiClient.post<ApiResponse<Seller>>('/sellers', data, config);
    return response.data;
  },

  /**
   * Update seller
   */
  update: async (id: string, data: Partial<SellerFormData> | FormData): Promise<ApiResponse<Seller>> => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    const response = await apiClient.patch<ApiResponse<Seller>>(`/sellers/${id}`, data, config);
    return response.data;
  },

  /**
   * Delete seller
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/sellers/${id}`);
    return response.data;
  },

  /**
   * Search sellers by name or email
   */
  search: async (query: string): Promise<ApiResponse<Seller[]>> => {
    const response = await apiClient.get<ApiResponse<Seller[]>>('/sellers/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get seller statistics
   */
  getStats: async (id: string): Promise<ApiResponse<{
    totalInvoices: number;
    totalAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
  }>> => {
    const response = await apiClient.get(`/sellers/${id}/stats`);
    return response.data;
  },
};
