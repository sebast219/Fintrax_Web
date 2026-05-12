import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BalanceCardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  previousMonthBalance?: number;
}

@Component({
  selector: 'app-balance-card-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-card.component.html',
  styleUrl: './balance-card.component.scss'
})
export class BalanceCardWidgetComponent {
  // Inputs reactivos
  data = input.required<BalanceCardData>();
  
  // Estado interno
  lastUpdated = new Date();

  // Estados derivados
  netIncome = computed(() => {
    const d = this.data();
    return d.monthlyIncome - d.monthlyExpense;
  });

  balanceChange = computed(() => {
    const d = this.data();
    if (d.previousMonthBalance === undefined) return 0;
    return d.totalBalance - d.previousMonthBalance;
  });

  balanceChangePercentage = computed(() => {
    const d = this.data();
    if (d.previousMonthBalance === undefined || d.previousMonthBalance === 0) return 0;
    return ((d.totalBalance - d.previousMonthBalance) / Math.abs(d.previousMonthBalance)) * 100;
  });

  savingsStatus = computed(() => {
    const rate = this.data().savingsRate;
    if (rate >= 20) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 10) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 0) return { status: 'neutral', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'negative', color: 'text-red-600', bg: 'bg-red-100' };
  });

  constructor() {}

  /**
   * Actualiza los datos del widget
   */
  refreshData(): void {
    this.lastUpdated = new Date();
    // Aquí podrías agregar lógica para recargar datos desde un servicio
  }

  /**
   * Formatea valor como moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Obtiene el color según el cambio
   */
  getChangeColor(): string {
    const change = this.balanceChange();
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  /**
   * Obtiene el ícono según el cambio
   */
  getChangeIcon(): string {
    const change = this.balanceChange();
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  }

  /**
   * Obtiene el texto de cambio
   */
  getChangeText(): string {
    const change = this.balanceChange();
    const percentage = Math.abs(this.balanceChangePercentage());
    
    if (change > 0) {
      return `+${this.formatCurrency(Math.abs(change))} (+${percentage.toFixed(1)}%)`;
    }
    if (change < 0) {
      return `-${this.formatCurrency(Math.abs(change))} (-${percentage.toFixed(1)}%)`;
    }
    return 'Sin cambios';
  }

  /**
   * Obtiene el icono según el estado de ahorro
   */
  getSavingsIcon(): string {
    const status = this.savingsStatus().status;
    switch (status) {
      case 'excellent': return '🎯';
      case 'good': return '✅';
      case 'neutral': return '⚖️';
      case 'negative': return '⚠️';
      default: return '📊';
    }
  }

  /**
   * Obtiene el texto del estado de ahorro
   */
  getSavingsText(): string {
    const status = this.savingsStatus().status;
    const rate = this.data().savingsRate;
    
    switch (status) {
      case 'excellent': return `Excelente: ${rate.toFixed(1)}% de ahorro`;
      case 'good': return `Bueno: ${rate.toFixed(1)}% de ahorro`;
      case 'neutral': return `Neutral: ${rate.toFixed(1)}% de ahorro`;
      case 'negative': return `Alerta: Gastos exceden ingresos`;
      default: return `${rate.toFixed(1)}% de ahorro`;
    }
  }

  /**
   * Verifica si el balance es positivo
   */
  isPositiveBalance(): boolean {
    return this.data().totalBalance >= 0;
  }

  /**
   * Obtiene la clase CSS para el balance
   */
  getBalanceClass(): string {
    const isPositive = this.isPositiveBalance();
    return isPositive ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Obtiene el fondo del balance
   */
  getBalanceBackground(): string {
    const isPositive = this.isPositiveBalance();
    return isPositive ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600';
  }
}
