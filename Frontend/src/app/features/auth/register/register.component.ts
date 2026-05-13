import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formulario de registro con validación
  registerForm: FormGroup;

  // Estados reactivos
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [Validators.requiredTrue]
    }, {
      validators: [
        this.passwordMatchValidator
      ]
    });

    // Si ya está logueado, redirigir al dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Validador personalizado para confirmación de contraseña
   */
  private passwordMatchValidator(form: FormGroup) {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const password = form.get('password')?.value;
      return control.value !== password ? { passwordMismatch: true } : null;
    };
  }

  /**
   * Obtiene los errores de un campo específico
   */
  getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);
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
      if (errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
      if (errors['pattern']) {
        return 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales';
      }
    }
    return null;
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggle para mostrar/ocultar confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Verifica la fortaleza de la contraseña
   */
  getPasswordStrength(): { score: number; message: string; color: string } {
    const password = this.registerForm.get('password')?.value || '';
    let score = 0;
    let message = '';
    let color = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) {
      message = 'Débil';
      color = 'text-red-500';
    } else if (score <= 3) {
      message = 'Media';
      color = 'text-yellow-500';
    } else {
      message = 'Fuerte';
      color = 'text-green-500';
    }

    return { score, message, color };
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formData: RegisterFormData = this.registerForm.value;
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const result = await this.authService.signUp(fullName, formData.email, formData.password);

      if (result.success) {
        this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo al dashboard...');
        
        // Intentar login automático
        try {
          const loginResult = await this.authService.signIn(formData.email, formData.password);
          if (loginResult.success) {
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          } else {
            // Si el login automático falla, redirigir a login
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          }
        } catch (error) {
          // Si hay error en login automático, redirigir a login
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        }
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error al crear cuenta');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navega a la página de login
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el formulario es válido
   */
  get isFormValid(): boolean {
    return this.registerForm.valid;
  }

  /**
   * Obtiene el valor actual de un campo
   */
  getFieldValue(fieldName: keyof RegisterFormData): any {
    return this.registerForm.get(fieldName)?.value;
  }

  /**
   * Limpia los mensajes de error
   */
  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
