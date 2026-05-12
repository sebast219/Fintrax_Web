import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';

export const cacheInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const cache = new Map<string, { response: HttpEvent<any>; expiry: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Skip caching for auth endpoints and dynamic data
  if (req.url.includes('/auth/') || req.url.includes('/dashboard/')) {
    return next(req);
  }

  const cacheKey = generateCacheKey(req);
  const cachedResponse = getCachedResponse(cacheKey, cache);

  if (cachedResponse) {
    return of(cachedResponse);
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        setCachedResponse(cacheKey, event, cache, CACHE_DURATION);
      }
    }),
    catchError(error => {
      // Clear cache on error
      cache.delete(cacheKey);
      return throwError(() => error);
    }),
    shareReplay(1) // Share response among multiple subscribers
  );
};

function generateCacheKey(req: HttpRequest<any>): string {
  // Include URL and relevant params for cache key
  const url = req.urlWithParams;
  const headers = req.headers.keys()
    .filter(key => key.toLowerCase().includes('cache'))
    .map(key => `${key}:${req.headers.get(key)}`)
    .join('|');

  return `${url}:${headers}`;
}

function getCachedResponse(
  cacheKey: string, 
  cache: Map<string, { response: HttpEvent<any>; expiry: number }>
): HttpEvent<any> | null {
  const cached = cache.get(cacheKey);
  
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiry) {
    cache.delete(cacheKey);
    return null;
  }

  return cached.response;
}

function setCachedResponse(
  cacheKey: string, 
  response: HttpResponse<any>, 
  cache: Map<string, { response: HttpEvent<any>; expiry: number }>,
  CACHE_DURATION: number
): void {
  const expiry = Date.now() + CACHE_DURATION;
  cache.set(cacheKey, { response, expiry });

  // Clean up expired entries periodically
  cleanupExpiredEntries(cache);
}

function cleanupExpiredEntries(
  cache: Map<string, { response: HttpEvent<any>; expiry: number }>
): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiry) {
      cache.delete(key);
    }
  }
}
