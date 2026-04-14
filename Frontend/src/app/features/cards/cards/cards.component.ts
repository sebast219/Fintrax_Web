import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../layout/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './cards.component.html',
  styleUrl: './cards.scss'
})
export class CardsComponent implements OnInit, AfterViewInit {

  auth = inject(AuthService);

  // 🔥 Ahora cada tarjeta tiene gasto
  cards = [
    {
      number: '•••• •••• •••• 6175',
      name: 'Usuario Demo',
      balance: 47417,
      gasto: 300000,
      type: 'dark'
    },
    {
      number: '•••• •••• •••• 8891',
      name: 'Usuario Demo',
      balance: 584460,
      gasto: 700000,
      type: 'light'
    }
  ];

  totalGastado = 0;

  ngOnInit(): void {
    this.calcularTotal();
  }

  ngAfterViewInit(): void {
    this.crearGrafico();
  }

  calcularTotal() {
    this.totalGastado = this.cards
      .reduce((acc, c) => acc + c.gasto, 0);
  }

  crearGrafico() {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: this.cards.map(c => c.number),
        datasets: [{
          data: this.cards.map(c => c.gasto),
         backgroundColor: [
                '#1e293b', // slate-800 (oscuro)
                '#64748b', // slate-500 (medio)
                '#cbd5f5', // claro
                '#e2e8f0'  // muy claro
                ]
        }]
      }
    });
  }
}