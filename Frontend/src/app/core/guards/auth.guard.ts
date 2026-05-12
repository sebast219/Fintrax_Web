import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si está logueado, permitir acceso
  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no está logueado, redirigir a login
  // Guardar la URL a la que intentaba acceder para redirigir después del login
  return router.createUrlTree(['/auth/login'], {
    queryParams: { 
      returnUrl: state.url 
    }
  });
};
