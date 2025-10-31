import apiClient from './client';
import { ApiResponse, Buyer, BuyerFormData } from '@/types';

export interface BuyerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  country?: string;
}

export const buyersService = {
  /**
   * Get all buyers with optional filters
   */
  getAll: async (params?: BuyerQueryParams): Promise<ApiResponse<Buyer[]>> => {
    const response = await apiClient.get<ApiResponse<Buyer[]>>('/buyers', { params });
    return response.data;
  },

  /**
   * Get buyer by ID
   */
  getById: async (id: string): Promise<ApiResponse<Buyer>> => {
    const response = await apiClient.get<ApiResponse<Buyer>>(`/buyers/${id}`);
    return response.data;
  },

  /**
   * Create new buyer
   */
  create: async (data: BuyerFormData): Promise<ApiResponse<Buyer>> => {
    const response = await apiClient.post<ApiResponse<Buyer>>('/buyers', data);
    return response.data;
  },

  /**
   * Update buyer
   */
  update: async (id: string, data: Partial<BuyerFormData>): Promise<ApiResponse<Buyer>> => {
    const response = await apiClient.patch<ApiResponse<Buyer>>(`/buyers/${id}`, data);
    return response.data;
  },

  /**
   * Delete buyer
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/buyers/${id}`);
    return response.data;
  },

  /**
   * Search buyers by name or email
   */
  search: async (query: string): Promise<ApiResponse<Buyer[]>> => {
    const response = await apiClient.get<ApiResponse<Buyer[]>>('/buyers/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get buyer statistics
   */
  getStats: async (id: string): Promise<ApiResponse<{
    totalInvoices: number;
    totalAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
  }>> => {
    const response = await apiClient.get(`/buyers/${id}/stats`);
    return response.data;
  },
};
