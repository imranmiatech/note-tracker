import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
      }
      errorName = exception.name;
    } else if (exception?.name === 'CastError') {
      // Mongoose invalid ObjectId
      statusCode = HttpStatus.BAD_REQUEST;
      message = `Invalid format for field '${exception.path}': ${exception.value}`;
      errorName = 'BadRequestException';
    } else if (exception?.code === 11000) {
      // Mongoose 11000 duplicate key error
      statusCode = HttpStatus.CONFLICT;
      const keys = Object.keys(exception.keyValue || {});
      const field = keys.length > 0 ? keys.join(', ') : 'field';
      message = `Duplicate value entered for ${field}.`;
      errorName = 'ConflictException';
    } else if (exception?.name === 'ValidationError') {
      // Mongoose validation error
      statusCode = HttpStatus.BAD_REQUEST;
      const errors = Object.values(exception.errors || {}).map(
        (err: any) => err.message,
      );
      message = errors.length > 0 ? errors : exception.message;
      errorName = 'BadRequestException';
    } else {
      this.logger.error(
        `Unhandled Error: ${exception?.message || exception}`,
        exception?.stack,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
