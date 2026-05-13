import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  activeTab = signal<string>('profile');
  isLoading = signal<boolean>(false);
  saveMessage = signal<string>('');
  
  // Dropdown properties
  showCountryDropdown = signal<boolean>(false);
  showLanguageDropdown = signal<boolean>(false);
  showCurrencyDropdown = signal<boolean>(false);
  showTimezoneDropdown = signal<boolean>(false);
  showDateFormatDropdown = signal<boolean>(false);
  showThemeDropdown = signal<boolean>(false);
  
  profileForm: FormGroup;
  securityForm: FormGroup;
  notificationsForm: FormGroup;
  preferencesForm: FormGroup;
  subscriptionForm: FormGroup;
  showCancelModal = signal<boolean>(false);
  cancelReason = signal<string>('');
  isCancelling = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['Sebastian', Validators.required],
      lastName: ['Test', Validators.required],
      email: ['sebastian.test@fintrax.com', [Validators.required, Validators.email]],
      phone: ['+54 9 11 1234-5678'],
      birthDate: ['1990-01-01'],
      country: ['Argentina', Validators.required]
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      budgetAlerts: [true],
      weeklyReports: [true],
      marketingEmails: [false]
    });

    this.preferencesForm = this.fb.group({
      language: ['es', Validators.required],
      currency: ['ARS', Validators.required],
      timezone: ['America/Argentina/Buenos_Aires', Validators.required],
      dateFormat: ['DD/MM/YYYY'],
      theme: ['dark']
    });

    this.subscriptionForm = this.fb.group({
      plan: ['premium'],
      status: ['active'],
      nextBilling: ['2024-12-01'],
      amount: ['$14.99']
    });

    // Initialize dropdown options
    this.countryOptions = [
      { value: 'Argentina', label: '🇦🇷 Argentina', icon: '🇦🇷' },
      { value: 'Brasil', label: '🇧🇷 Brasil', icon: '🇧🇷' },
      { value: 'México', label: '🇲🇽 México', icon: '🇲🇽' },
      { value: 'Colombia', label: '🇨🇴 Colombia', icon: '🇨🇴' },
      { value: 'Chile', label: '🇨🇱 Chile', icon: '🇨🇱' },
      { value: 'Perú', label: '🇵🇪 Perú', icon: '🇵🇪' }
    ];

    this.languageOptions = [
      { value: 'es', label: '🇪🇸 Español', icon: '🇪🇸' },
      { value: 'en', label: '🇬🇧 English', icon: '🇬🇧' },
      { value: 'pt', label: '🇧🇷 Português', icon: '🇧🇷' }
    ];

    this.currencyOptions = [
      { value: 'ARS', label: '🇦🇷 ARS - Peso Argentino', icon: '🇦🇷' },
      { value: 'BRL', label: '🇧🇷 BRL - Real Brasileño', icon: '🇧🇷' },
      { value: 'MXN', label: '🇲🇽 MXN - Peso Mexicano', icon: '🇲🇽' },
      { value: 'COP', label: '🇨🇴 COP - Peso Colombiano', icon: '🇨🇴' },
      { value: 'CLP', label: '🇨🇱 CLP - Peso Chileno', icon: '🇨🇱' },
      { value: 'PEN', label: '🇵🇪 PEN - Sol Peruano', icon: '🇵🇪' },
      { value: 'USD', label: '🇺🇸 USD - Dólar Americano', icon: '🇺🇸' },
      { value: 'EUR', label: '🇪🇺 EUR - Euro', icon: '🇪🇺' }
    ];

    this.timezoneOptions = [
      { value: 'America/Argentina/Buenos_Aires', label: '🇦🇷 Argentina (GMT-3)', icon: '🇦🇷' },
      { value: 'America/Sao_Paulo', label: '🇧🇷 Brasil (GMT-3)', icon: '🇧🇷' },
      { value: 'America/Mexico_City', label: '🇲🇽 México (GMT-6)', icon: '🇲🇽' },
      { value: 'America/Bogota', label: '🇨🇴 Colombia (GMT-5)', icon: '🇨🇴' },
      { value: 'America/Santiago', label: '🇨🇱 Chile (GMT-4)', icon: '🇨🇱' },
      { value: 'America/Lima', label: '🇵🇪 Perú (GMT-5)', icon: '🇵🇪' }
    ];

    this.dateFormatOptions = [
      { value: 'DD/MM/YYYY', label: '📅 DD/MM/YYYY', icon: '📅' },
      { value: 'MM/DD/YYYY', label: '📆 MM/DD/YYYY', icon: '📆' },
      { value: 'YYYY-MM-DD', label: '📋 YYYY-MM-DD', icon: '📋' }
    ];

    this.themeOptions = [
      { value: 'dark', label: '🌙 Oscuro', icon: '🌙' },
      { value: 'light', label: '☀️ Claro', icon: '☀️' },
      { value: 'auto', label: '🔄 Automático', icon: '🔄' }
    ];
  }

  // Dropdown options
  countryOptions: any[] = [];
  languageOptions: any[] = [];
  currencyOptions: any[] = [];
  timezoneOptions: any[] = [];
  dateFormatOptions: any[] = [];
  themeOptions: any[] = [];

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.saveMessage.set('Perfil actualizado exitosamente');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } catch (error) {
      this.saveMessage.set('Error al actualizar perfil');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } finally {
      this.isLoading.set(false);
    }
  }

  async changePassword(): Promise<void> {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.securityForm.value;
    if (newPassword !== confirmPassword) {
      this.saveMessage.set('Las contraseñas no coinciden');
      setTimeout(() => this.saveMessage.set(''), 3000);
      return;
    }

    this.isLoading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.saveMessage.set('Contraseña actualizada exitosamente');
      this.securityForm.reset();
      setTimeout(() => this.saveMessage.set(''), 3000);
    } catch (error) {
      this.saveMessage.set('Error al actualizar contraseña');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveNotifications(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.saveMessage.set('Preferencias de notificación actualizadas');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } catch (error) {
      this.saveMessage.set('Error al actualizar notificaciones');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } finally {
      this.isLoading.set(false);
    }
  }

  async savePreferences(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.saveMessage.set('Preferencias guardadas exitosamente');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } catch (error) {
      this.saveMessage.set('Error al guardar preferencias');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  openCancelModal(): void {
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.cancelReason.set('');
  }

  setCancelReason(reason: string): void {
    this.cancelReason.set(reason);
  }

  async cancelSubscription(): Promise<void> {
    if (!this.cancelReason()) {
      this.saveMessage.set('Por favor, selecciona un motivo de cancelación');
      setTimeout(() => this.saveMessage.set(''), 3000);
      return;
    }

    this.isCancelling.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update subscription status
      this.subscriptionForm.patchValue({
        status: 'cancelled',
        plan: 'free'
      });

      this.saveMessage.set('Suscripción cancelada exitosamente. Mantendrás acceso hasta el final del período facturado.');
      this.closeCancelModal();
      
      setTimeout(() => {
        this.saveMessage.set('');
        // Optionally redirect to dashboard after cancellation
        // this.router.navigate(['/dashboard']);
      }, 5000);
    } catch (error) {
      this.saveMessage.set('Error al cancelar suscripción. Por favor, contacta a soporte.');
      setTimeout(() => this.saveMessage.set(''), 3000);
    } finally {
      this.isCancelling.set(false);
    }
  }

  getSubscriptionStatus(): string {
    return this.subscriptionForm.get('status')?.value || 'active';
  }

  isSubscriptionActive(): boolean {
    return this.getSubscriptionStatus() === 'active';
  }

  // Dropdown methods
  toggleDropdown(dropdownName: string): void {
    // Close all dropdowns first
    this.showCountryDropdown.set(false);
    this.showLanguageDropdown.set(false);
    this.showCurrencyDropdown.set(false);
    this.showTimezoneDropdown.set(false);
    this.showDateFormatDropdown.set(false);
    this.showThemeDropdown.set(false);
    
    // Open the selected dropdown
    switch (dropdownName) {
      case 'country':
        this.showCountryDropdown.set(!this.showCountryDropdown());
        break;
      case 'language':
        this.showLanguageDropdown.set(!this.showLanguageDropdown());
        break;
      case 'currency':
        this.showCurrencyDropdown.set(!this.showCurrencyDropdown());
        break;
      case 'timezone':
        this.showTimezoneDropdown.set(!this.showTimezoneDropdown());
        break;
      case 'dateFormat':
        this.showDateFormatDropdown.set(!this.showDateFormatDropdown());
        break;
      case 'theme':
        this.showThemeDropdown.set(!this.showThemeDropdown());
        break;
    }
  }

  closeAllDropdowns(): void {
    this.showCountryDropdown.set(false);
    this.showLanguageDropdown.set(false);
    this.showCurrencyDropdown.set(false);
    this.showTimezoneDropdown.set(false);
    this.showDateFormatDropdown.set(false);
    this.showThemeDropdown.set(false);
  }

  selectDropdownOption(dropdownName: string, value: string): void {
    switch (dropdownName) {
      case 'country':
        this.profileForm.patchValue({ country: value });
        break;
      case 'language':
        this.preferencesForm.patchValue({ language: value });
        break;
      case 'currency':
        this.preferencesForm.patchValue({ currency: value });
        break;
      case 'timezone':
        this.preferencesForm.patchValue({ timezone: value });
        break;
      case 'dateFormat':
        this.preferencesForm.patchValue({ dateFormat: value });
        break;
      case 'theme':
        this.preferencesForm.patchValue({ theme: value });
        break;
    }
    this.closeAllDropdowns();
  }

  getSelectedLabel(options: any[], currentValue: string): string {
    const option = options.find(opt => opt.value === currentValue);
    return option ? option.label : 'Seleccionar opción';
  }

  trackByOption(index: number, option: any): string {
    return option.value;
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.closeAllDropdowns();
    }
  }
}
