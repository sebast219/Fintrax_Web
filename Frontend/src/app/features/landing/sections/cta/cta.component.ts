import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent {
  private router = inject(Router);

  constructor() {}

  /**
   * Navega a la página de registro
   */
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navega a la página de login
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navega a la demo
   */
  navigateToDemo(): void {
    // Aquí podrías redirigir a una demo interactiva
    window.open('/demo', '_blank');
  }

  /**
   * Abre chat de soporte
   */
  openSupportChat(): void {
    // Aquí podrías integrar un chat de soporte
    window.open('https://wa.me/1234567890', '_blank');
  }
}
