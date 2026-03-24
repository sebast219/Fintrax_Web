import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private supabaseService: SupabaseService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.supabaseService.client.auth.getSession()).pipe(
      switchMap(({ data: { session } }) => {
        if (session?.access_token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
        }

        return next.handle(request);
      })
    );
  }
}
