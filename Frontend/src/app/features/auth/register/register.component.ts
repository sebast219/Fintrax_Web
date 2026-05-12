import { Component, inject, OnInit, signal } from '@angular/core';
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
export class RegisterComponent implements OnInit {
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

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
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

    try {
      const result = await this.auth.register(this.name, this.email, this.password);
      
      if (result.success) {
        const signInResult = await this.auth.login(this.email, this.password);
        if (signInResult.success) {
          this.success.set('Cuenta creada. Redirigiendo al dashboard...');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        } else {
          this.success.set(result.message);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        }
      } else {
        this.error.set(result.message);
      }
    } catch (error: any) {
      this.error.set('Error de conexión con el servidor');
    } finally {
      this.isLoading = false;
    }
  }
}
