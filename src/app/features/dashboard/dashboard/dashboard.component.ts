import { Component, OnInit, AfterViewInit, Renderer2, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../../layout/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  showNotifications = false;
  
  // Inyectar AuthService
  auth = inject(AuthService);
  private router = inject(Router);
  
  constructor(private renderer: Renderer2, private el: ElementRef) { }
  
  ngOnInit() {
    this.updateBlurPosition();
  }
  
  ngAfterViewInit() {
    this.updateBlurPosition();
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => this.updateBlurPosition());
    window.addEventListener('scroll', () => this.updateBlurPosition());
  }
  
  updateBlurPosition() {
    // El dashboard ahora está protegido por AuthGuard, así que siempre hay usuario
    const chartSection = this.el.nativeElement.querySelector('.chart-section');
    const blurOverlay = this.el.nativeElement.querySelector('.blur-overlay');
    
    if (chartSection && blurOverlay) {
      const rect = chartSection.getBoundingClientRect();
      // Con position: fixed, usamos directamente la posición relativa a la viewport
      const topPosition = rect.top;
      
      this.renderer.setStyle(blurOverlay, 'top', `${topPosition}px`);
    }
  }
  
  toggleNotifications() {
    console.log('toggleNotifications called');
    this.showNotifications = !this.showNotifications;
    console.log('showNotifications:', this.showNotifications);
  }
  
  closeNotifications() {
    console.log('closeNotifications called');
    this.showNotifications = false;
  }
  
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
