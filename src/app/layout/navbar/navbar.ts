import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
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
