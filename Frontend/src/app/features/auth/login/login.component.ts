import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  error = signal('');
  success = signal('');

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.isLoading = true;
    this.error.set('');
    this.success.set('');

    try {
      const result = await this.auth.login(this.email, this.password);
      
      if (result.success) {
        this.success.set(result.message);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
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
