import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 🏠 LANDING PAGE (Públicas)
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component')
      .then(m => m.LandingComponent),
    data: { title: 'Fintrax - Gestión Financiera Personal' }
  },
  
  // 🔐 AUTH ROUTES (Públicas)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent),
        data: { title: 'Inicia Sesión' }
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent),
        data: { title: 'Crear Cuenta' }
      }
    ]
  },
  
  // 💳 DASHBOARD (Protegidas)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { title: 'Dashboard' }
  },
  
  // 🎴 CARDS (Protegidas)
  {
    path: 'cards',
    loadComponent: () => import('./features/cards/cards/cards.component')
      .then(m => m.CardsComponent),
    canActivate: [authGuard],
    data: { title: 'Mis Tarjetas' }
  },
  
  // 📊 REPORTS (Protegidas)
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard],
    data: { title: 'Reportes' }
  },

  // ⚙️ SETTINGS (Protegidas)
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component')
      .then(m => m.SettingsComponent),
    canActivate: [authGuard],
    data: { title: 'Ajustes' }
  },
  
  // 🔴 ERROR PAGES
  {
    path: 'not-found',
    loadComponent: () => import('./features/landing/landing.component')
      .then(m => m.LandingComponent),
    data: { title: 'Página No Encontrada' }
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
