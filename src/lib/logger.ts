// ============= CENTRALIZED LOGGING SYSTEM =============
// Replaces console.log usage with a proper logging system

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    
    let formattedMessage = `${timestamp} ${levelStr} ${contextStr} ${message}`;
    
    if (data) {
      formattedMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context, data);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.log(formattedMessage);
        break;
    }
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // Helper methods for common patterns
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, 'API', data);
  }

  apiResponse(method: string, url: string, response: any): void {
    this.debug(`API ${method} ${url} response`, 'API', response);
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API ${method} ${url} failed`, 'API', error);
  }

  formSubmit(formName: string, data: any): void {
    this.debug(`Form submitted: ${formName}`, 'FORM', data);
  }

  formValidation(formName: string, errors: any): void {
    this.warn(`Form validation errors: ${formName}`, 'FORM', errors);
  }

  mutation(operation: string, data?: any): void {
    this.debug(`Mutation: ${operation}`, 'MUTATION', data);
  }

  mutationSuccess(operation: string, result?: any): void {
    this.info(`Mutation success: ${operation}`, 'MUTATION', result);
  }

  mutationError(operation: string, error: any): void {
    this.error(`Mutation error: ${operation}`, 'MUTATION', error);
  }
}

export const logger = new Logger();

// Convenience exports
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logDebug = logger.debug.bind(logger);