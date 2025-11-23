import axios from 'axios';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: ValidationError[];
}

/**
 * Extract detailed error messages from API response
 */
export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    
    if (response?.data) {
      const data = response.data;
      
      // Handle validation errors
      if (data.errors && Array.isArray(data.errors)) {
        return {
          message: data.message || 'Validation failed',
          errors: data.errors.map((err: any) => ({
            field: err.field || err.path || 'unknown',
            message: err.message || err.msg || 'Invalid value',
          })),
        };
      }
      
      // Handle single error message
      if (data.message) {
        return {
          message: data.message,
        };
      }
    }
    
    // Handle network errors
    if (error.message) {
      return {
        message: error.message,
      };
    }
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'Đã xảy ra lỗi không xác định',
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors?: ValidationError[]): string {
  if (!errors || errors.length === 0) {
    return '';
  }
  
  return errors.map(err => `${err.field}: ${err.message}`).join('\n');
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[] | undefined, fieldName: string): string | undefined {
  if (!errors) return undefined;
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
}
