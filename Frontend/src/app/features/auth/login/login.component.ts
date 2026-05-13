import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Formulario de login con validación
  loginForm: FormGroup;

  // Estados reactivos
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  
  // URL de retorno
  returnUrl: string = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Obtener URL de retorno de query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  /**
   * Obtiene los errores de un campo específico
   */
  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      const errors = field.errors;
      if (errors['required']) {
        return 'Este campo es requerido';
      }
      if (errors['email']) {
        return 'Email inválido';
      }
      if (errors['minlength']) {
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }
    }
    return null;
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formData: LoginFormData = this.loginForm.value;
      const result = await this.authService.signIn(formData.email, formData.password);

      if (result.success) {
        this.successMessage.set(result.message);
        
        // Esperar un poco antes de redirigir para mostrar el mensaje
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navega a la página de registro
   */
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navega a la página de recuperación de contraseña
   */
  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Verifica si el formulario es válido
   */
  get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  /**
   * Obtiene el valor actual de un campo
   */
  getFieldValue(fieldName: keyof LoginFormData): any {
    return this.loginForm.get(fieldName)?.value;
  }

  /**
   * Limpia los mensajes de error
   */
  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
