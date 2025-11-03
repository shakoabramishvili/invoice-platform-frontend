import apiClient from './client';
import { ApiResponse, DashboardStats, TopBuyer, EmployeeInvoiceStats, CurrencyRates, Invoice } from '@/types';

export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (params?: DashboardQueryParams): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', {
      params,
    });
    return response.data;
  },

  /**
   * Get revenue over time
   */
  getRevenueOverTime: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
  }): Promise<ApiResponse<Array<{ date: string; revenue: number }>>> => {
    const response = await apiClient.get('/dashboard/revenue-over-time', { params });
    return response.data;
  },

  /**
   * Get invoice status distribution
   */
  getStatusDistribution: async (params?: DashboardQueryParams): Promise<ApiResponse<Array<{
    status: string;
    count: number;
    percentage: number;
  }>>> => {
    const response = await apiClient.get('/dashboard/status-distribution', { params });
    return response.data;
  },

  /**
   * Get top buyers
   */
  getTopBuyers: async (params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TopBuyer[]>> => {
    const response = await apiClient.get('/dashboard/top-buyers', { params });
    return response.data;
  },

  /**
   * Get top sellers
   */
  getTopSellers: async (params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    totalInvoices: number;
    totalAmount: number;
  }>>> => {
    const response = await apiClient.get('/dashboard/top-sellers', { params });
    return response.data;
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (params?: {
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    user: string;
    action: string;
    resource: string;
    timestamp: string;
  }>>> => {
    const response = await apiClient.get('/dashboard/recent-activities', { params });
    return response.data;
  },

  /**
   * Get Employee Invoice Activity
   */
  getInvoicesPerEmployee: async (): Promise<ApiResponse<EmployeeInvoiceStats[]>> => {
    const response = await apiClient.get('/dashboard/invoices-per-employee');
    return response.data;
  },

  /**
   * Get currency exchange rates
   */
  getCurrencyRates: async (): Promise<ApiResponse<CurrencyRates>> => {
    const response = await apiClient.get('/dashboard/currency-rates');
    return response.data;
  },

  /**
   * Get recent invoices
   */
  getRecentInvoices: async (params?: { limit?: number }): Promise<ApiResponse<Invoice[]>> => {
    const response = await apiClient.get('/dashboard/recent-invoices', { params });
    return response.data;
  },
};
