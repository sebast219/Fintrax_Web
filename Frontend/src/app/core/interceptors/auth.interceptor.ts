import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, retry, timeout } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // Skip token for auth endpoints
  if (req.url.includes('/auth/') && !req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Add timeout for requests
  const timeoutValue = 30000; // 30 seconds

  return next(addToken(req, authService)).pipe(
    timeout(timeoutValue),
    retry(1), // Retry once on network errors
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid - attempt refresh
        return handle401Error(req, next, authService);
      }
      
      if (error.status === 403) {
        // Forbidden - user doesn't have permission
        authService.logout();
        return throwError(() => error);
      }

      // For other errors, just pass through
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<any>, authService: AuthService): HttpRequest<any> {
  const token = authService.getToken();
  
  // Debug: Log token presence
  console.log('AuthInterceptor - Token exists:', !!token);
  console.log('AuthInterceptor - Request URL:', req.url);
  
  if (token) {
    console.log('AuthInterceptor - Adding Bearer token');
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true // Important for httpOnly cookies
    });
  }

  console.log('AuthInterceptor - No token found');
  return req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
}

function handle401Error(
  req: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authService: AuthService
): Observable<HttpEvent<any>> {
  // Prevent infinite refresh loops
  if (req.url.includes('/auth/refresh')) {
    authService.logout();
    return throwError(() => new Error('Refresh token failed'));
  }

  return authService.refreshToken().pipe(
    switchMap(() => {
      // Retry the original request with new token
      return next(addToken(req, authService));
    }),
    catchError((error) => {
      // Refresh failed, logout user
      authService.logout();
      return throwError(() => error);
    })
  );
}
