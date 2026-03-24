import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  error = signal('');
  success = signal('');

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error.set('Completa todos los campos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isLoading = true;
    this.error.set('');
    this.success.set('');

    const result = this.auth.register(this.name, this.email, this.password);
    
    if (result.success) {
      this.success.set(result.message);
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.error.set(result.message);
    }
    
    this.isLoading = false;
  }
}
