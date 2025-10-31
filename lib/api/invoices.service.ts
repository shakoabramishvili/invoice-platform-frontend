import apiClient from './client';
import { ApiResponse, Invoice, InvoiceFormData } from '@/types';

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  buyerId?: string;
  sellerId?: string;
}

export const invoicesService = {
  /**
   * Get all invoices with optional filters
   */
  getAll: async (params?: InvoiceQueryParams): Promise<ApiResponse<Invoice[]>> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices', { params });
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: string): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Create new invoice
   */
  create: async (data: InvoiceFormData): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
    return response.data;
  },

  /**
   * Update invoice
   */
  update: async (id: string, data: Partial<InvoiceFormData>): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data);
    return response.data;
  },

  /**
   * Delete invoice
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Cancel invoice
   */
  cancel: async (id: string, cancelReason: string): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/cancel`, {
      cancelReason,
    });
    return response.data;
  },

  /**
   * Get canceled invoices
   */
  getCanceled: async (params?: InvoiceQueryParams): Promise<ApiResponse<Invoice[]>> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices/canceled', { params });
    return response.data;
  },

  /**
   * Download invoice as PDF
   */
  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Update invoice status
   */
  updateStatus: async (id: string, status: string): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Duplicate invoice
   */
  duplicate: async (id: string): Promise<ApiResponse<Invoice>> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/duplicate`);
    return response.data;
  },

  /**
   * Send invoice via email
   */
  sendEmail: async (id: string, to: string, subject?: string, message?: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/invoices/${id}/send`, {
      to,
      subject,
      message,
    });
    return response.data;
  },

  /**
   * Export invoices to Excel
   */
  exportToExcel: async (params?: InvoiceQueryParams): Promise<Blob> => {
    const response = await apiClient.get('/invoices/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export canceled invoices to Excel
   */
  exportCanceledToExcel: async (params?: InvoiceQueryParams): Promise<Blob> => {
    const response = await apiClient.get('/invoices/canceled/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
