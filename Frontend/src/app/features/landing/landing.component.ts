import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
    RouterLink,
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
   * Navega a una sección específica
   */
  navigateToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
