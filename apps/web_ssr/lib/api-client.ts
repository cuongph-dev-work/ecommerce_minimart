import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

// Support both Vite (import.meta.env) and Next.js (process.env)
const API_URL = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8000/api';

// Create axios instance for web (public API)
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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

