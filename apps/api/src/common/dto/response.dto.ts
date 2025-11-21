export class ApiResponse<T = any> {
  success!: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

export class ErrorResponse {
  success: boolean = false;
  message!: string;
  errors: Array<{ field?: string; message: string }> = [];
}

