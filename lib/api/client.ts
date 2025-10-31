import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token refresh queue to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor - Add auth token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Received 401 error for:', originalRequest.url);

      if (isRefreshing) {
        // If already refreshing, queue the request
        console.log('Token refresh already in progress, queueing request');
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          console.error('No refresh token available in localStorage');
          throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh access token...');
        console.log('Refresh token (first 20 chars):', refreshToken.substring(0, 20) + '...');

        // Attempt to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Token refresh successful');

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        console.log('New access token stored');

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Notify all queued requests
        onTokenRefreshed(accessToken);
        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        isRefreshing = false;
        console.error('Token refresh failed:', refreshError);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login page
        if (typeof window !== 'undefined') {
          console.log('Redirecting to login due to failed token refresh');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
