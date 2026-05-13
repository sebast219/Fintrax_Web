import { Component } from '@angular/core';

// Importar sub-componentes
import { HeroComponent } from './sections/hero/hero.component';
import { FeaturesComponent } from './sections/features/features.component';
import { PricingComponent } from './sections/pricing/pricing.component';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { FaqComponent } from './sections/faq/faq.component';
import { CtaComponent } from './sections/cta/cta.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    PricingComponent,
    TestimonialsComponent,
    FaqComponent,
    CtaComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  
  constructor() {}

  /**
   * Hace scroll al inicio de la página
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navega a una sección específica con scroll animado visible
   */
  navigateToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 64; // Altura del header fijo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Smooth scroll animado personalizado con duración controlada
   */
  smoothScrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const headerHeight = 64; // Altura del header fijo
    const startPosition = window.pageYOffset;
    const targetPosition = element.getBoundingClientRect().top + startPosition - headerHeight;
    const distance = targetPosition - startPosition;
    const duration = 800; // Duración del scroll en milisegundos

    let start: number | null = null;

    function animation(currentTime: number) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t: number, b: number, c: number, d: number): number {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }
}
