import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  
  features = [
    {
      icon: '📊',
      title: 'Dashboard en Tiempo Real',
      description: 'Visualiza tus finanzas con gráficos interactivos y actualizaciones al instante',
      benefits: ['KPIs en vivo', 'Gráficos dinámicos', 'Alertas inteligentes']
    },
    {
      icon: '💳',
      title: 'Gestión de Tarjetas',
      description: 'Controla todas tus tarjetas de crédito y débito en un solo lugar',
      benefits: ['Límites personalizables', 'Notificaciones de gastos', 'Reportes detallados']
    },
    {
      icon: '📈',
      title: 'Análisis de Gastos',
      description: 'Entiende tus hábitos de consumo con análisis detallados por categoría',
      benefits: ['Categorización automática', 'Tendencias mensuales', 'Presupuestos inteligentes']
    },
    {
      icon: '🎯',
      title: 'Metas Financieras',
      description: 'Establece y sigue tus metas de ahorro con progreso visual',
      benefits: ['Seguimiento de progreso', 'Metas personalizadas', 'Recordatorios automáticos']
    },
    {
      icon: '📱',
      title: 'Multiplataforma',
      description: 'Accede desde cualquier dispositivo con sincronización automática',
      benefits: ['App móvil', 'Web responsive', 'Sincronización en la nube']
    },
    {
      icon: '🔒',
      title: 'Seguridad Total',
      description: 'Tus datos protegidos con encriptación de nivel bancario',
      benefits: ['Autenticación 2FA', 'Encriptación SSL', 'Copias de seguridad']
    }
  ];

  constructor() {}

  /**
   * Obtiene las características destacadas
   */
  getHighlightedFeatures() {
    return this.features.filter((_, index) => index < 3);
  }

  /**
   * Obtiene todas las características
   */
  getAllFeatures() {
    return this.features;
  }

  /**
   * TrackBy function for features
   */
  trackByFeature(index: number, feature: any) {
    return index;
  }

  /**
   * TrackBy function for benefits
   */
  trackByBenefit(index: number, benefit: string) {
    return index;
  }
}
