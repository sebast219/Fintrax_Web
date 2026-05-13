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
      answer: 'Sí, ofrecemos un plan gratuito con características básicas perfectas para empezar a gestionar tus finanzas. También tenemos planes de pago con funcionalidades avanzadas.',
      category: 'general'
    },
    {
      id: '2',
      question: '¿Cómo protegen mis datos personales?',
      answer: 'Utilizamos encriptación de nivel bancario y seguimos las mejores prácticas de seguridad. Todos tus datos están protegidos y nunca los compartimos con terceros sin tu consentimiento.',
      category: 'seguridad'
    },
    {
      id: '3',
      question: '¿Puedo conectar mis cuentas bancarias?',
      answer: 'Sí, en nuestros planes profesionales y empresariales puedes conectar tus cuentas bancarias de forma segura para sincronizar transacciones automáticamente.',
      category: 'funcionalidades'
    },
    {
      id: '4',
      question: '¿Qué tipo de reportes puedo generar?',
      answer: 'Puedes generar reportes de gastos, ingresos, balance general, análisis por categoría, tendencias mensuales y reportes personalizados según tus necesidades.',
      category: 'funcionalidades'
    },
    {
      id: '5',
      question: '¿Hay una aplicación móvil?',
      answer: 'Sí, Fintrax está disponible para iOS y Android. Puedes sincronizar tus datos entre dispositivos y acceder a tu información desde cualquier lugar.',
      category: 'general'
    },
    {
      id: '6',
      question: '¿Cómo funciona el soporte técnico?',
      answer: 'Ofrecemos soporte por email para todos los planes. Los usuarios de planes pagados tienen soporte prioritario y el plan empresarial incluye soporte 24/7.',
      category: 'soporte'
    },
    {
      id: '7',
      question: '¿Puedo exportar mis datos?',
      answer: 'Sí, puedes exportar todos tus datos en formato CSV, JSON o PDF en cualquier momento. Creemos en la portabilidad de tus datos.',
      category: 'funcionalidades'
    },
    {
      id: '8',
      question: '¿Cómo cancelo mi suscripción?',
      answer: 'Puedes cancelar tu suscripción en cualquier momento desde tu configuración de cuenta. No hay penalizaciones y mantienes acceso hasta el final del período facturado.',
      category: 'general'
    }
  ]);

  categories = ['general', 'seguridad', 'funcionalidades', 'soporte'];
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
