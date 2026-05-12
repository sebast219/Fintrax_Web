import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  date: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'María González',
      role: 'Emprendedora',
      avatar: '👩‍💼',
      content: 'Fintrax ha transformado completamente la manera que gestiono mis finanzas. Ahora tengo control total de mis ingresos y gastos, y las metas de ahorro me mantienen motivada.',
      rating: 5,
      date: '2024-01-15'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      role: 'Freelance',
      avatar: '👨‍💻',
      content: 'Como freelancer, necesito controlar mis ingresos variables. Fintrax me ayuda a organizar mis facturas y gastos, y los reportes son perfectos para presentar a mi contador.',
      rating: 5,
      date: '2024-01-10'
    },
    {
      id: '3',
      name: 'Ana Martínez',
      role: 'Estudiante',
      avatar: '👩‍🎓',
      content: 'Estoy ahorrando para mi primer apartamento y Fintrax me está ayudando a mantenerme disciplinada. Las alertas de presupuesto son increíblemente útiles.',
      rating: 4,
      date: '2024-01-08'
    },
    {
      id: '4',
      name: 'Roberto Silva',
      role: 'Gerente de Proyectos',
      avatar: '👨‍💼',
      content: 'La integración con mis cuentas bancarias es perfecta. Puedo ver todas mis transacciones en tiempo real y las categorías automáticas me ahorran mucho tiempo.',
      rating: 5,
      date: '2024-01-05'
    },
    {
      id: '5',
      name: 'Laura Torres',
      role: 'Diseñadora Gráfica',
      avatar: '👩‍🎨',
      content: 'Los análisis visuales de Fintrax son espectaculares. Los gráficos interactivos me ayudan a entender rápidamente dónde estoy gastando mi dinero.',
      rating: 5,
      date: '2024-01-03'
    }
  ];

  constructor() {}

  /**
   * Obtiene las estrellas de calificación
   */
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index < rating ? 1 : 0);
  }

  /**
   * Obtiene el texto de la fecha formateado
   */
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
