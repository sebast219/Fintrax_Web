import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  showNotifications = false;
  
  constructor() { }
  
  toggleNotifications() {
    console.log('toggleNotifications called');
    this.showNotifications = !this.showNotifications;
    console.log('showNotifications:', this.showNotifications);
  }
  
  closeNotifications() {
    console.log('closeNotifications called');
    this.showNotifications = false;
  }
}
