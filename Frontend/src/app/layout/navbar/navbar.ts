import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  showNotifications = false;
  showUserMenu = false;

  // Inyectar AuthService
  auth = inject(AuthService);
  private router = inject(Router);

  constructor() { }

  toggleNotifications() {
    console.log('toggleNotifications called');
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
    console.log('showNotifications:', this.showNotifications);
  }

  closeNotifications() {
    console.log('closeNotifications called');
    this.showNotifications = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  logout() {
    this.showUserMenu = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
