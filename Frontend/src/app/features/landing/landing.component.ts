import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
