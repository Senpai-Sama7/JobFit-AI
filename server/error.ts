import { type Request, type Response, type NextFunction } from 'express';
import { log } from './vite';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const body: Record<string, any> = { message };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
    console.error(err.stack);
  }

  log(`${status} ${message}`, 'error');
  res.status(status).json(body);
}
