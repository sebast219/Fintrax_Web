import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, user } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const delay = Date.now() - now;
          const userId = user?.sub || user?.id;

          this.logger.logApiRequest(method, url, userId, statusCode, delay);

          // Log slow requests
          if (delay > 1000) {
            this.logger.logPerformance(`${method} ${url}`, delay, {
              userAgent,
              ip,
              userId,
            });
          }
        },
        error: (error) => {
          const delay = Date.now() - now;
          const userId = user?.sub || user?.id;

          this.logger.error(
            `Request failed: ${method} ${url}`,
            error.stack,
            `${method} ${url}`,
          );
          
          this.logger.logApiRequest(method, url, userId, 500, delay);
        },
      }),
    );
  }
}
