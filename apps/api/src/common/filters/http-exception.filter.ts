import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: any = {
      success: false,
      message: exception.message,
      errors: [],
    };

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      
      if (responseObj.message) {
        if (Array.isArray(responseObj.message)) {
          errorResponse.errors = responseObj.message.map((msg: string) => ({
            message: msg,
          }));
          errorResponse.message = 'Validation failed';
        } else {
          errorResponse.message = responseObj.message;
        }
      }
    }

    response.status(status).json(errorResponse);
  }
}

