import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger();

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      // Handle HttpException (400, 401, 403, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message || exception.message
          : exception.message;
    } else {
      // Handle all other exceptions (500 errors)
      status = HttpStatus.INTERNAL_SERVER_ERROR;

      // Fix the undefined message issue
      if (exception && typeof exception === 'object') {
        message = exception.message || 'Internal server error';
      } else if (typeof exception === 'string') {
        message = exception;
      } else {
        message = 'Internal server error';
      }

      // Log the actual error for debugging
      this.logger.error(
        `Unhandled exception: ${message}`,
        exception?.stack || 'No stack trace available',
      );
    }

    // Log based on status
    if (status >= 200 && status < 400) {
      this.logger.log(
        `${request.method} ${request.originalUrl} ${status} Success: ${message}`,
      );
    } else {
      this.logger.error(
        `${request.method} ${request.originalUrl} ${status} Error: ${message}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
