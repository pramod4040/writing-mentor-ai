import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppLoggerService } from '../logging/app-logger.service';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'apikey',
  'secret',
]);

function sanitizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[redacted]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeKeys(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      exception instanceof HttpException
        ? typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string | string[] })?.message ??
            exception.message
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const logMessage = Array.isArray(message) ? message.join('; ') : String(message);
    const trace = exception instanceof Error ? exception.stack : undefined;

    this.logger.logError('Request failed', 'AllExceptionsFilter', exception, {
      method: request.method,
      path: request.url,
      statusCode: status,
      queryKeys: Object.keys(request.query ?? {}),
      bodyKeys: Object.keys((request.body as Record<string, unknown>) ?? {}),
      body: sanitizeKeys((request.body as Record<string, unknown>) ?? {}),
    });

    const body =
      exception instanceof HttpException && typeof exceptionResponse === 'object'
        ? exceptionResponse
        : {
            statusCode: status,
            message: logMessage,
          };

    response.status(status).json(body);
  }
}
