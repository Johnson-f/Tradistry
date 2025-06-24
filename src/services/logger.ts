import * as Sentry from '@sentry/react';

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  // Info level logging - replaces console.log
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
    
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      data: context,
      level: 'info',
    });
    
    Sentry.captureMessage(message, {
      level: 'info',
      tags: context,
    });
  }

  // Debug level logging - for detailed debugging
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
    
    Sentry.addBreadcrumb({
      category: 'debug',
      message,
      data: context,
      level: 'debug',
    });
  }

  // Warning level logging - replaces console.warn
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    
    Sentry.addBreadcrumb({
      category: 'warning',
      message,
      data: context,
      level: 'warning',
    });
    
    Sentry.captureMessage(message, {
      level: 'warning',
      tags: context,
    });
  }

  // Error level logging - replaces console.error
  error(message: string, error?: Error | any, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '', context || '');
    }
    
    Sentry.addBreadcrumb({
      category: 'error',
      message,
      data: { ...context, error: error?.message || error },
      level: 'error',
    });
    
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: context,
        extra: {
          message,
          ...context,
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        tags: context,
        extra: {
          error,
          ...context,
        },
      });
    }
  }

  // Set user context for better error tracking
  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  // Clear user context
  clearUser() {
    Sentry.setUser(null);
  }

  // Add breadcrumb for user actions
  addBreadcrumb(category: string, message: string, data?: LogContext) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  }
}

export const logger = new Logger();
export default logger; 