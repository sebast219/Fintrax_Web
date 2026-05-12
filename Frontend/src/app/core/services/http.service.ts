import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  constructor() {}

  /**
   * Obtiene los headers base para las peticiones
   */
  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (includeAuth) {
      const token = localStorage.getItem('fintrax_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(includeAuth)
    });
  }

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, data: any, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    return this.http.post<T>(url, data, {
      headers: this.getHeaders(includeAuth)
    });
  }

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, data: any, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    return this.http.put<T>(url, data, {
      headers: this.getHeaders(includeAuth)
    });
  }

  /**
   * Realiza una petición PATCH
   */
  patch<T>(endpoint: string, data: any, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    return this.http.patch<T>(url, data, {
      headers: this.getHeaders(includeAuth)
    });
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    return this.http.delete<T>(url, {
      headers: this.getHeaders(includeAuth)
    });
  }

  /**
   * Realiza una petición con parámetros de query
   */
  getWithParams<T>(endpoint: string, params: { [key: string]: any }, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(includeAuth),
      params: params
    });
  }

  /**
   * Sube un archivo
   */
  upload<T>(endpoint: string, file: File, includeAuth: boolean = true): Observable<T> {
    const url = `${this.API_URL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    let headers = new HttpHeaders();
    if (includeAuth) {
      const token = localStorage.getItem('fintrax_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return this.http.post<T>(url, formData, {
      headers
    });
  }

  /**
   * Construye URL con parámetros de query
   */
  buildUrlWithParams(baseUrl: string, params: { [key: string]: any }): string {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  }
}
