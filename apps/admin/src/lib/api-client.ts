import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns { success: true, data: ... } format
    return response;
  },
  (error: AxiosError) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Extract error message from response
      const errorData = error.response.data as { message?: string; error?: string };
      const errorMessage = errorData?.message || errorData?.error || 'An error occurred';
      
      return Promise.reject({
        status,
        message: errorMessage,
        data: errorData,
      });
    }
    
    // Network error
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
    });
  }
);

export default apiClient;

