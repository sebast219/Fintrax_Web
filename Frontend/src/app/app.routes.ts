import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Página de presentación
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component')
      .then(m => m.LandingComponent),
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
  {
    path: 'cards',
    loadComponent: () => import('./features/cards/cards/cards.component')
      .then(c => c.CardsComponent),
    canActivate: [authGuard]
  },
    {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard]
  },
  // Cualquier otra URL redirige al inicio
  {
    path: '**',
    redirectTo: '/'
  }
];
