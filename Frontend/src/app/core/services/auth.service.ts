import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export interface SignUpDto {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private SESSION_KEY = 'fintrax_session';
  private TOKEN_KEY = 'fintrax_token';

  currentUser = signal<AuthUser | null>(this.loadSession());

  private loadSession(): AuthUser | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private saveSession(user: AuthUser, token: string): void {
    // Use localStorage instead of sessionStorage for persistence
    // In production, this should be httpOnly cookies
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUser.set(user);
  }

  async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; message: string }> {
    const dto: SignUpDto = { email, password, fullName };
    try {
      await firstValueFrom(this.http.post(`${this.API_URL}/signup`, dto));
      return { success: true, message: 'Cuenta creada exitosamente' };
    } catch (error: any) {
      const message = error.error?.message || 'Error al registrar usuario';
      return { success: false, message };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const dto: SignInDto = { email, password };
    try {
      const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.API_URL}/signin`, dto));
      const user: AuthUser = {
        id: response.user.id,
        name: response.user.fullName,
        email: response.user.email
      };
      this.saveSession(user, response.access_token);
      return { success: true, message: `Bienvenido ${user.name}` };
    } catch (error: any) {
      const message = error.error?.message || 'Correo o contraseña incorrectos';
      return { success: false, message };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    return this.signIn(email, password);
  }

  async register(name: string, email: string, password: string): Promise<{ success: boolean; message: string }> {
    return this.signUp(email, password, name);
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null && !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUserName(): string {
    return this.currentUser()?.name || '';
  }

  getCurrentUserEmail(): string {
    return this.currentUser()?.email || '';
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshToken(): Observable<{ success: boolean; message: string }> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {}).pipe(
      map(response => {
        const user: AuthUser = {
          id: response.user.id,
          name: response.user.fullName,
          email: response.user.email
        };
        this.saveSession(user, response.access_token);
        return { success: true, message: 'Token refreshed successfully' };
      }),
      catchError(error => {
        const message = error.error?.message || 'Failed to refresh token';
        return of({ success: false, message });
      })
    );
  }
}
