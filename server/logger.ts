import type { Request } from 'express';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
} as const;

const LOG_LABELS = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
} as const;

const RESET = '\x1b[0m';

const currentLogLevel = (() => {
  const level = process.env.LOG_LEVEL?.toUpperCase();
  switch (level) {
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    default: return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }
})();

function formatTimestamp(): string {
  return new Date().toISOString();
}

function shouldLog(level: LogLevel): boolean {
  return level >= currentLogLevel;
}

interface LogContext {
  requestId?: string;
  userId?: number;
  method?: string;
  path?: string;
  duration?: number;
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = formatTimestamp();
  const label = LOG_LABELS[level];
  const color = LOG_COLORS[level];

  let contextStr = '';
  if (context && Object.keys(context).length > 0) {
    const contextParts = Object.entries(context)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
    contextStr = ` [${contextParts.join(' ')}]`;
  }

  return `${color}${timestamp} [${label}]${RESET} ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.log(formatMessage(LogLevel.DEBUG, message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.INFO)) {
      console.log(formatMessage(LogLevel.INFO, message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage(LogLevel.WARN, message, context));
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatMessage(LogLevel.ERROR, message, context));
      if (error instanceof Error) {
        console.error(`  Stack: ${error.stack}`);
      } else if (error) {
        console.error(`  Details: ${JSON.stringify(error)}`);
      }
    }
  },

  request(req: Request, statusCode: number, duration: number): void {
    const level = statusCode >= 500 ? LogLevel.ERROR :
                  statusCode >= 400 ? LogLevel.WARN :
                  LogLevel.INFO;

    if (shouldLog(level)) {
      const userId = (req.user as { id?: number })?.id;
      console.log(formatMessage(level, `${req.method} ${req.path} ${statusCode}`, {
        method: req.method,
        path: req.path,
        duration,
        userId,
        ip: req.ip,
      }));
    }
  },
};

export type Logger = typeof logger;
