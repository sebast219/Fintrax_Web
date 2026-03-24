import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private USERS_KEY = 'fintrax_users';
  private SESSION_KEY = 'fintrax_session';

  currentUser = signal<AuthUser | null>(this.loadSession());

  private loadUsers(): User[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private loadSession(): AuthUser | null {
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  register(name: string, email: string, password: string) {
    const users = this.loadUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'El correo ya está registrado.' };
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password
    };
    
    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'Cuenta creada exitosamente.' };
  }

  login(email: string, password: string) {
    const user = this.loadUsers().find(
      u => u.email === email && u.password === password
    );
    
    if (!user) {
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }
    
    const session: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.currentUser.set(session);
    
    return { success: true, message: `Bienvenido ${user.name}` };
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUserName(): string {
    return this.currentUser()?.name || '';
  }

  getCurrentUserEmail(): string {
    return this.currentUser()?.email || '';
  }
}
