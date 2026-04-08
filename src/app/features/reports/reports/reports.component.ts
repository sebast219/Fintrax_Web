import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../layout/navbar/navbar';

interface KPI {
  title: string;
  value: string;
  color: string;
}

interface Category {
  name: string;
  percentage: number;
  icon: string;
  color: string;
}

interface Insight {
  text: string;
  title: string;
}

interface CategoryDetail {
  name: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.scss'],
  standalone: true,
  imports: [CommonModule, Navbar]
})
export class ReportsComponent {

  selectedRange: string = '30';

  kpis: KPI[] = [
    { title: 'Gasto Promedio Diario', value: '$52.30', color: 'default' },
    { title: 'Categoría más costosa', value: 'Entretenimiento', color: 'danger' },
    { title: 'Gastos Hormiga', value: '$210', color: 'warning' }
  ];

  categories: Category[] = [
    { name: 'Alimentación', percentage: 35, icon: 'Alimentación', color: '#3B82F6' },
    { name: 'Transporte', percentage: 20, icon: 'Transporte', color: '#10B981' },
    { name: 'Entretenimiento', percentage: 25, icon: 'Entretenimiento', color: '#F59E0B' },
    { name: 'Servicios', percentage: 20, icon: 'Servicios', color: '#EF4444' }
  ];

  insights: Insight[] = [
    { title: 'Gastos de fin de semana', text: 'Estás gastando más los fines de semana (+32%)' },
    { title: 'Optimización de cafés', text: 'Reduciendo cafés diarios podrías ahorrar $90/mes' },
    { title: 'Reducción de gastos', text: 'Tu gasto total bajó un 8% comparado al mes anterior' }
  ];

  categoryDetails: CategoryDetail[] = [
    { name: 'Alimentación', amount: 1200, percentage: 35 },
    { name: 'Transporte', amount: 700, percentage: 20 },
    { name: 'Entretenimiento', amount: 900, percentage: 25 }
  ];

  formatMoney(value: number): string {
    return `$${value.toLocaleString()}`;
  }

  onRangeChange(event: any) {
    this.selectedRange = event.target.value;
    console.log('Rango seleccionado:', this.selectedRange);
  }

  exportPDF() {
    console.log('Exportando PDF...');
  }
}