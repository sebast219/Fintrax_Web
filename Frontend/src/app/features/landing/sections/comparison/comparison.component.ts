import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Competitor {
  name: string;
  logo: string;
  plans: {
    free: string;
    paid: string;
  };
  features: {
    [key: string]: 'yes' | 'no' | 'partial' | 'premium' | 'limited';
  };
  pros: string[];
  cons: string[];
  rating: number;
  users: string;
}

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.scss'
})
export class ComparisonComponent {
  competitors = signal<Competitor[]>([
    {
      name: 'Fintrax',
      logo: '💎',
      plans: {
        free: 'Hasta 50 transacciones/mes',
        paid: '$14.99/mes (ilimitado)'
      },
      features: {
        'IA Predictiva': 'yes',
        'Criptomonedas': 'yes',
        'Soporte LATAM': 'yes',
        'Reportes Avanzados': 'yes',
        'Sincronización Bancaria': 'yes',
        'API Empresarial': 'premium',
        'Privacidad de Datos': 'yes',
        'Multi-Moneda': 'yes'
      },
      pros: [
        'Diseñado para LATAM',
        'IA 95% precisión (100K+ transacciones)',
        'Sin venta de datos',
        'Soporte español 24/7',
        '200+ bancos en 6 países'
      ],
      cons: [
        'Más nuevo que competidores'
      ],
      rating: 4.8,
      users: '50K+'
    },
    {
      name: 'YNAB',
      logo: '📊',
      plans: {
        free: 'Prueba 34 días',
        paid: '$14.99/mes'
      },
      features: {
        'IA Predictiva': 'no',
        'Criptomonedas': 'no',
        'Soporte LATAM': 'limited',
        'Reportes Avanzados': 'yes',
        'Sincronización Bancaria': 'yes',
        'API Empresarial': 'no',
        'Privacidad de Datos': 'yes',
        'Multi-Moneda': 'partial'
      },
      pros: [
        'Metodología probada',
        'Comunidad activa',
        'Educación financiera'
      ],
      cons: [
        'Sin IA predictiva',
        'Enfoque solo US/Canadá',
        'Sin criptomonedas'
      ],
      rating: 4.4,
      users: '10M+'
    },
    {
      name: 'Mint',
      logo: '🌱',
      plans: {
        free: 'Con publicidad',
        paid: '$4.99/mes'
      },
      features: {
        'IA Predictiva': 'partial',
        'Criptomonedas': 'no',
        'Soporte LATAM': 'limited',
        'Reportes Avanzados': 'partial',
        'Sincronización Bancaria': 'yes',
        'API Empresarial': 'no',
        'Privacidad de Datos': 'no',
        'Multi-Moneda': 'no'
      },
      pros: [
        'Gratis (con ads)',
        'Intuit/TurboTax integración',
        'Score de crédito'
      ],
      cons: [
        'Vende tus datos a terceros',
        'Limitado fuera de US',
        'Sin criptomonedas'
      ],
      rating: 3.8,
      users: '25M+'
    },
    {
      name: 'Notion Finance',
      logo: '📝',
      plans: {
        free: 'Básico',
        paid: '$10/mes'
      },
      features: {
        'IA Predictiva': 'partial',
        'Criptomonedas': 'no',
        'Soporte LATAM': 'no',
        'Reportes Avanzados': 'partial',
        'Sincronización Bancaria': 'no',
        'API Empresarial': 'yes',
        'Privacidad de Datos': 'yes',
        'Multi-Moneda': 'no'
      },
      pros: [
        'Personalizable',
        'Integración workspace',
        'Colaboración en equipo'
      ],
      cons: [
        'No es app financiera pura',
        'Sin sincronización bancaria',
        'Curva de aprendizaje alta'
      ],
      rating: 4.2,
      users: '30M+'
    }
  ]);

  features = [
    { key: 'IA Predictiva', name: 'IA Predictiva', description: '95% precisión (100K+ transacciones)' },
    { key: 'Criptomonedas', name: 'Criptomonedas', description: '50+ criptomonedas principales' },
    { key: 'Soporte LATAM', name: 'Soporte LATAM', description: '6 países, 200+ bancos locales' },
    { key: 'Reportes Avanzados', name: 'Reportes Avanzados', description: '+30 tipos de reportes' },
    { key: 'Sincronización Bancaria', name: 'Sincronización Bancaria', description: '200+ bancos via Plaid' },
    { key: 'API Empresarial', name: 'API Empresarial', description: 'Integraciones personalizadas' },
    { key: 'Privacidad de Datos', name: 'Privacidad de Datos', description: 'Sin venta de datos a terceros' },
    { key: 'Multi-Moneda', name: 'Multi-Moneda', description: 'ARS, BRL, MXN, COP, CLP, PEN' }
  ];

  selectedFeature = signal<string>('all');

  constructor() {}

  getFeatureIcon(value: string): string {
    switch (value) {
      case 'yes': return '✅';
      case 'no': return '❌';
      case 'partial': return '⚡';
      case 'premium': return '👑';
      default: return '❓';
    }
  }

  getFeatureText(value: string): string {
    switch (value) {
      case 'yes': return 'Incluido';
      case 'no': return 'No disponible';
      case 'partial': return 'Limitado';
      case 'premium': return 'Premium';
      default: return 'N/A';
    }
  }

  getFeatureClass(value: string): string {
    switch (value) {
      case 'yes': return 'text-green-400 bg-green-400/10';
      case 'no': return 'text-red-400 bg-red-400/10';
      case 'partial': return 'text-yellow-400 bg-yellow-400/10';
      case 'premium': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  }

  filterByFeature(feature: string): void {
    this.selectedFeature.set(feature);
  }

  getFilteredCompetitors(): Competitor[] {
    const feature = this.selectedFeature();
    if (feature === 'all') {
      return this.competitors();
    }
    return this.competitors().filter(comp => 
      comp.features[feature] === 'yes' || comp.features[feature] === 'premium'
    );
  }

  trackByFeature(index: number, feature: any) {
    return feature.key || index;
  }

  trackByCompetitor(index: number, competitor: Competitor) {
    return competitor.name;
  }

  trackByPro(index: number, pro: string) {
    return index;
  }

  trackByCon(index: number, con: string) {
    return index;
  }
}
