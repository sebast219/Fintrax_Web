import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.createLogger();
  }

  private createLogger() {
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const logFormat = this.configService.get<string>('LOG_FORMAT', 'json');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ];

    if (nodeEnv === 'development' && logFormat !== 'json') {
      formats.push(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          return `${timestamp} [${level}] ${context ? `[${context}]` : ''}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }${trace ? `\n${trace}` : ''}`;
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(...formats),
      defaultMeta: {
        service: 'fintrax-api',
        version: '1.0.0',
      },
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true,
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          handleExceptions: true,
          handleRejections: true,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          handleExceptions: true,
          handleRejections: true,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
      exitOnError: false,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Métodos adicionales para logging estructurado
  logUserAction(userId: string, action: string, metadata?: any) {
    this.logger.info(`User action: ${action}`, {
      context: 'USER_ACTION',
      userId,
      action,
      metadata,
    });
  }

  logApiRequest(method: string, url: string, userId?: string, statusCode?: number, responseTime?: number) {
    this.logger.info(`API Request: ${method} ${url}`, {
      context: 'API_REQUEST',
      method,
      url,
      userId,
      statusCode,
      responseTime,
    });
  }

  logSecurityEvent(event: string, userId?: string, ip?: string, metadata?: any) {
    this.logger.warn(`Security event: ${event}`, {
      context: 'SECURITY',
      event,
      userId,
      ip,
      metadata,
    });
  }

  logTransaction(transactionId: string, action: string, metadata?: any) {
    this.logger.info(`Transaction ${action}: ${transactionId}`, {
      context: 'TRANSACTION',
      transactionId,
      action,
      metadata,
    });
  }

  logPerformance(operation: string, duration: number, metadata?: any) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.logger[level](`Performance: ${operation} took ${duration}ms`, {
      context: 'PERFORMANCE',
      operation,
      duration,
      metadata,
    });
  }
}
