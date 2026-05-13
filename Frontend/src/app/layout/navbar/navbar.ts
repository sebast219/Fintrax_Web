import { Component, inject, signal } from '@angular/core';
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

  // Dynamic notification timestamps
  notificationTimes = signal<string[]>([]);

  constructor() { 
    this.initializeNotificationTimes();
  }

  // Initialize notification times with dynamic timestamps
  private initializeNotificationTimes(): void {
    const now = new Date();
    const times = [
      this.formatNotificationTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // 2 hours ago
      this.formatNotificationTime(new Date(now.getTime() - 5 * 60 * 60 * 1000)), // 5 hours ago
      this.formatNotificationTime(new Date(now.getTime() - 24 * 60 * 60 * 1000)) // 1 day ago
    ];
    this.notificationTimes.set(times);
  }

  // Format notification time dynamically
  private formatNotificationTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Ahora mismo' : `Hace ${diffMins} minutos`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return `Hace ${diffDays} días`;
    }
  }

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
