import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  faqs = signal<FAQ[]>([
    {
      id: '1',
      question: '¿Es gratis usar Fintrax?',
      answer: 'Sí, nuestro plan Starter es completamente gratuito y hasta 50 transacciones mensuales. Perfecto para quienes comienzan. Nuestro plan Pro ($9.99/mes) incluye transacciones ilimitadas, reportes avanzados y sincronización bancaria. El plan Business ($29.99/mes) añade soporte prioritario y API para equipos.',
      category: 'general'
    },
    {
      id: '2',
      question: '¿Cómo protegen mis datos personales?',
      answer: 'Implementamos seguridad de nivel enterprise: encriptación AES-256, certificación ISO 27001, cumplimiento SOC 2 Type II, y autenticación 2FA. Nuestros servidores están en AWS con copias de seguridad automáticas cada 6 horas. Nunca vendemos datos y cumplimos con GDPR y CCPA.',
      category: 'seguridad'
    },
    {
      id: '3',
      question: '¿Qué diferencia a Fintrax de YNAB o Mint?',
      answer: 'Fintrax está diseñado específicamente para el mercado latinoamericano con soporte para múltiples monedas, impuestos locales y categorías regionales. A diferencia de YNAB, ofrecemos IA para predicción de gastos y, a diferencia de Mint, no compartimos tus datos con terceros para publicidad.',
      category: 'competitiva'
    },
    {
      id: '4',
      question: '¿Puedo conectar mis cuentas bancarias?',
      answer: 'Sí, mediante Plaid y API bancaria segura. Conectamos 200+ bancos en 6 países clave: Argentina (BBVA Francés, Santander, Galicia), Brasil (Itaú, Bradesco, Banco do Brasil), México (BBVA México, Banorte, Santander), Colombia (Bancolombia, Daviplata), Chile (Banco de Chile, Santander), Perú (BCP, Interbank). Soporte para ARS, BRL, MXN, COP, CLP, PEN.',
      category: 'funcionalidades'
    },
    {
      id: '5',
      question: '¿Qué tipo de reportes puedo generar?',
      answer: 'Genera +30 tipos de reportes: análisis de flujo de caja, proyecciones con IA, reportes de impuestos, análisis por categoría personalizados, comparativos año-año, y reportes de inversión. Exporta en PDF, Excel o compite directamente con tu contador.',
      category: 'funcionalidades'
    },
    {
      id: '6',
      question: '¿Hay una aplicación móvil?',
      answer: 'Sí, apps nativas para iOS (iPhone/iPad) y Android con biometría facial/huella. Sincronización offline perfecta y notificaciones inteligentes de presupuesto. Calificación 4.8★ con más de 100,000 descargas.',
      category: 'general'
    },
    {
      id: '7',
      question: '¿Cómo funciona el soporte técnico?',
      answer: 'Soporte multicanal 24/7: chat en vivo (respuesta < 2 min), email (respuesta < 4 horas), y teléfono para planes Business. Base de conocimientos con 200+ tutoriales y webinars semanales gratuitos. 99.9% de satisfacción del cliente.',
      category: 'soporte'
    },
    {
      id: '8',
      question: '¿Puedo exportar mis datos?',
      answer: 'Totalmente. Exporta en CSV, Excel, PDF, JSON o QIF. Incluye auditoría completa de cambios y puedes importar desde otras plataformas (YNAB, Mint, Quicken). Garantizamos portabilidad total según GDPR Art. 20.',
      category: 'funcionalidades'
    },
    {
      id: '9',
      question: '¿Qué garantías ofrecen?',
      answer: '30 días de garantía de devolución del dinero sin preguntas. Uptime 99.9% garantizado. Recuperación de datos ante desastres en menos de 1 hora. Cumplimiento regulatorio y auditorías de seguridad trimestrales por terceros.',
      category: 'garantias'
    },
    {
      id: '10',
      question: '¿Para empresas hay funcionalidades especiales?',
      answer: 'Sí, plan Business incluye: gestión multi-usuario con permisos, integración contable (QuickBooks, Xero), reportes fiscales automáticos, API personalizada, y entrenamiento dedicado. Ideal para PYMES y freelancers.',
      category: 'empresas'
    },
    {
      id: '11',
      question: '¿Cómo funciona la inteligencia artificial?',
      answer: 'Nuestra IA utiliza algoritmos de machine learning entrenados con 100K+ transacciones para lograr 95% de precisión en categorización automática. Predice gastos con margen de error ±5%, detecta anomalías en tiempo real, y optimiza presupuestos basados en tus patrones históricos. Auditoría externa disponible.',
      category: 'ia'
    },
    {
      id: '12',
      question: '¿Aceptan criptomonedas?',
      answer: 'Sí, soporte completo para Bitcoin, Ethereum, y 50+ criptomonedas principales. Conecta wallets como Coinbase, Binance, o MetaMask. Reportes de ganancias/pérdidas para declaración de impuestos y seguimiento de portafolio en tiempo real.',
      category: 'cripto'
    }
  ]);

  categories = ['general', 'seguridad', 'funcionalidades', 'soporte', 'competitiva', 'garantias', 'empresas', 'ia', 'cripto'];
  selectedCategory = signal<string>('todos');

  constructor() {}

  /**
   * Alterna la expansión de una pregunta
   */
  toggleFAQ(faqId: string): void {
    this.faqs.update(faqs => 
      faqs.map(faq => 
        faq.id === faqId 
          ? { ...faq, expanded: !faq.expanded }
          : faq
      )
    );
  }

  /**
   * Filtra las FAQs por categoría
   */
  getFilteredFAQs(): FAQ[] {
    if (this.selectedCategory() === 'todos') {
      return this.faqs();
    }
    return this.faqs().filter(faq => faq.category === this.selectedCategory());
  }

  /**
   * Establece la categoría seleccionada
   */
  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  /**
   * Expande o colapsa todas las FAQs
   */
  toggleAll(expanded: boolean): void {
    this.faqs.update(faqs => 
      faqs.map(faq => ({ ...faq, expanded }))
    );
  }

  /**
   * Busca en las FAQs
   */
  searchFAQs(query: string): void {
    if (!query) {
      this.setCategory('todos');
      return;
    }

    this.faqs.update(faqs => 
      faqs.map(faq => ({
        ...faq,
        expanded: faq.question.toLowerCase().includes(query.toLowerCase()) ||
                 faq.answer.toLowerCase().includes(query.toLowerCase())
      }))
    );
  }

  /**
   * TrackBy function for categories
   */
  trackByCategory(index: number, category: string) {
    return index;
  }

  /**
   * TrackBy function for FAQs
   */
  trackByFaq(index: number, faq: FAQ) {
    return faq.id;
  }
}
