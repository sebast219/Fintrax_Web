import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  selectedPlan = signal<string>('professional');

  plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 0,
      period: 'para siempre',
      description: 'Perfecto para empezar a controlar tus finanzas personales',
      features: [
        'Dashboard básico',
        'Hasta 5 tarjetas',
        'Reportes mensuales',
        'Soporte por email'
      ]
    },
    {
      id: 'professional',
      name: 'Profesional',
      price: 9.99,
      period: 'por mes',
      description: 'Ideal para freelancers y profesionales que necesitan control total',
      features: [
        'Dashboard completo',
        'Tarjetas ilimitadas',
        'Reportes en tiempo real',
        'Análisis de gastos',
        'Metas financieras',
        'Soporte prioritario',
        'Exportación de datos'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 29.99,
      period: 'por mes',
      description: 'Solución completa para empresas y equipos grandes',
      features: [
        'Todo lo profesional',
        'Usuarios ilimitados',
        'API personalizada',
        'Integraciones bancarias',
        'Reportes personalizados',
        'Soporte 24/7',
        'SLA garantizado',
        'Entorno privado'
      ],
      highlighted: true
    }
  ];

  constructor() {}

  /**
   * Selecciona un plan
   */
  selectPlan(planId: string): void {
    this.selectedPlan.set(planId);
  }

  /**
   * Obtiene el plan seleccionado
   */
  getSelectedPlan(): PricingPlan | undefined {
    return this.plans.find(plan => plan.id === this.selectedPlan());
  }

  /**
   * Navega al registro con el plan seleccionado
   */
  navigateToRegister(): void {
    // Aquí podrías pasar el plan seleccionado como parámetro
    // this.router.navigate(['/auth/register'], { 
    //   queryParams: { plan: this.selectedPlan() } 
    // });
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return price === 0 ? 'Gratis' : `$${price.toFixed(2)}`;
  }

  /**
   * Obtiene el descuento anual
   */
  getAnnualDiscount(plan: PricingPlan): number {
    if (plan.period === 'por mes') {
      const monthlyPrice = plan.price;
      const annualPrice = monthlyPrice * 12;
      const discountPrice = annualPrice * 0.8; // 20% de descuento
      return Math.round((annualPrice - discountPrice) / annualPrice * 100);
    }
    return 0;
  }

  /**
   * TrackBy function for features
   */
  trackByFeature(index: number, feature: string) {
    return index;
  }
}
