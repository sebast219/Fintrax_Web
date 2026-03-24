import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirige la raíz al login
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },

  // Rutas públicas (sin autenticación)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },

  // Ruta privada: requiere estar logueado
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component')
      .then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },

  // Cualquier otra URL redirige al login
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];
