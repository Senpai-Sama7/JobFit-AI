import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import { log } from './vite';

/**
 * Error codes for consistent API responses
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  AUTHORIZATION_DENIED = 'AUTHORIZATION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Custom application error with status code and error code
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create specific error types for common scenarios
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, ErrorCode.AUTHENTICATION_REQUIRED);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, ErrorCode.AUTHORIZATION_DENIED);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, ErrorCode.RESOURCE_NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`External service error: ${service}`, 502, ErrorCode.EXTERNAL_SERVICE_ERROR);
    this.name = 'ExternalServiceError';
    if (originalError) {
      this.details = { originalMessage: originalError.message };
    }
  }
}

/**
 * Format Zod validation errors for API response
 */
function formatZodError(error: ZodError): { field: string; message: string }[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Determine if error should be logged
 */
function shouldLogError(status: number): boolean {
  // Log 5xx errors and unexpected 4xx errors
  return status >= 500 || status === 400 || status === 404;
}

/**
 * Express error handler middleware
 * Catches all errors and formats them consistently
 */
export function errorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default error response
  let status = 500;
  let code = ErrorCode.INTERNAL_ERROR;
  let message = 'Internal Server Error';
  let details: unknown = undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    status = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = formatZodError(err);
  }
  // Handle custom application errors
  else if (err instanceof AppError) {
    status = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Handle Multer file upload errors
  else if (err.name === 'MulterError') {
    status = 400;
    code = ErrorCode.FILE_UPLOAD_ERROR;
    message = err.message;
  }
  // Handle other errors
  else {
    message = err.message || 'Internal Server Error';

    // Check for common HTTP error patterns
    if ('status' in err && typeof (err as Record<string, unknown>).status === 'number') {
      status = (err as Record<string, unknown>).status as number;
    } else if ('statusCode' in err && typeof (err as Record<string, unknown>).statusCode === 'number') {
      status = (err as Record<string, unknown>).statusCode as number;
    }
  }

  // Build response body
  const body: Record<string, unknown> = {
    error: {
      code,
      message,
    },
  };

  // Include details if available
  if (details) {
    body.error = { ...body.error as object, details };
  }

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.error = { ...body.error as object, stack: err.stack };
    console.error(err.stack);
  }

  // Log error
  if (shouldLogError(status)) {
    log(`${status} [${code}] ${message}`, 'error');
  }

  res.status(status).json(body);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
