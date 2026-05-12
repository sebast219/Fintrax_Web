import { Component, input, computed, viewChild, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { CategoryExpense } from '../../../../core/models/dashboard.model';

export interface CategorySpending {
  id: string;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  previousAmount?: number;
}

export interface SpendingChartData {
  period: 'week' | 'month' | 'year';
  categories: CategorySpending[];
  totalExpense: number;
  previousPeriodTotal?: number;
  timestamp: Date;
}

@Component({
  selector: 'app-spending-chart-widget',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spending-chart.component.html',
  styleUrl: './spending-chart.component.scss'
})
export class SpendingChartWidgetComponent {
  
  // ============================================
  // ✅ INPUTS REACTIVOS
  // ============================================
  
  data = input.required<SpendingChartData>();
  
  // ============================================
  // ✅ VIEWCHILD PARA CANVAS
  // ============================================
  
  chartCanvas = viewChild<any>('spendingChartCanvas');
  private chart: Chart | null = null;
  
  // ============================================
  // ✅ COLORES PREDEFINIDOS
  // ============================================
  
  private readonly CATEGORY_COLORS = [
    '#FF6384', // Rosa - Comida
    '#36A2EB', // Azul - Transporte
    '#F59E0B', // Amarillo - Vivienda
    '#10B981', // Verde - Entretenimiento
    '#8B5CF6', // Púrpura - Salud
    '#EC4899', // Rosa fuerte - Compras
    '#06B6D4', // Cian - Servicios
    '#64748B'  // Gris - Otros
  ];
  
  // ============================================
  // ✅ COMPUTED SIGNALS
  // ============================================
  
  // Top 3 categorías por gasto
  topCategories = computed(() => {
    return this.data().categories
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  });
  
  // Cambio porcentual respecto período anterior
  expenseChangePercentage = computed(() => {
    const d = this.data();
    if (!d.previousPeriodTotal || d.previousPeriodTotal === 0) return 0;
    return ((d.totalExpense - d.previousPeriodTotal) / d.previousPeriodTotal) * 100;
  });
  
  // Indicador de tendencia general
  trendIndicator = computed(() => {
    const change = this.expenseChangePercentage();
    if (change > 10) return { text: 'Gastos aumentaron', color: 'text-red-600', icon: '📈' };
    if (change < -10) return { text: 'Gastos disminuyeron', color: 'text-green-600', icon: '📉' };
    return { text: 'Gastos estables', color: 'text-blue-600', icon: '➡️' };
  });
  
  // Categoría con mayor gasto
  topCategory = computed(() => {
    const categories = this.data().categories;
    return categories.length > 0 
      ? categories.reduce((max, curr) => curr.amount > max.amount ? curr : max)
      : null;
  });
  
  // ============================================
  // ✅ EFFECT PARA CREAR/ACTUALIZAR GRÁFICO
  // ============================================
  
  chartEffect = effect(() => {
    const data = this.data();
    const canvas = this.chartCanvas();
    
    if (!canvas?.nativeElement) return;
    
    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    // Crear nuevo gráfico
    this.createChart(canvas.nativeElement, data);
  });
  
  // ============================================
  // ✅ CREAR GRÁFICO CHART.JS
  // ============================================
  
  private createChart(canvasElement: HTMLCanvasElement, data: SpendingChartData) {
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    // Preparar datos con colores asignados
    const categoriesWithColors = data.categories.map((category, index) => ({
      ...category,
      color: category.color || this.CATEGORY_COLORS[index % this.CATEGORY_COLORS.length]
    }));
    
    const labels = categoriesWithColors.map(c => c.name);
    const amounts = categoriesWithColors.map(c => c.amount);
    const colors = categoriesWithColors.map(c => c.color);
    const borderColors = colors.map(color => this.lightenColor(color, 20));
    
    // Configuración del gráfico
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 2,
          borderRadius: 8,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12,
                weight: 500 as any
              },
              usePointStyle: true,
              pointStyle: 'circle',
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i] as number;
                    const percentage = ((value / data.totalExpense) * 100).toFixed(1);
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor[i] as string,
                      strokeStyle: dataset.borderColor as string,
                      lineWidth: dataset.borderWidth,
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            padding: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            borderColor: '#FFFFFF',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = ((value / data.totalExpense) * 100).toFixed(1);
                return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
              },
              afterLabel: (context: any) => {
                const categoryIndex = context.dataIndex;
                const category = categoriesWithColors[categoryIndex];
                const trendIcon = category.trend === 'up' ? '📈' : 
                                category.trend === 'down' ? '📉' : '➡️';
                return `Tendencia: ${trendIcon}`;
              }
            }
          }
        },
        animation: {
          duration: 750
        }
      }
    };
    
    // Crear gráfico
    this.chart = new Chart(ctx, config);
  }
  
  // ============================================
  // ✅ UTILIDADES
  // ============================================
  
  /**
   * Aclarar color (usada para borders)
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R : 255) * 0x10000 +
      (G < 255 ? G : 255) * 0x100 + (B < 255 ? B : 255))
      .toString(16).slice(1);
  }
  
  /**
   * Formatear moneda
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
   * Obtiene el texto del período
   */
  getPeriodText(period: string): string {
    const periodMap: { [key: string]: string } = {
      'week': 'Esta Semana',
      'month': 'Este Mes',
      'year': 'Este Año'
    };
    return periodMap[period] || period;
  }
  
  /**
   * Obtiene el icono de tendencia
   */
  getTrendIcon(trend: string): string {
    const trendIcons: { [key: string]: string } = {
      'up': '📈',
      'down': '📉',
      'stable': '➡️'
    };
    return trendIcons[trend] || '➡️';
  }
  
  /**
   * Obtiene el color de tendencia
   */
  getTrendColor(trend: string): string {
    const trendColors: { [key: string]: string } = {
      'up': 'text-red-600',
      'down': 'text-green-600',
      'stable': 'text-gray-600'
    };
    return trendColors[trend] || 'text-gray-600';
  }
  
  /**
   * Obtiene el texto de tendencia
   */
  getTrendText(trend: string): string {
    const trendTexts: { [key: string]: string } = {
      'up': 'Aumentó',
      'down': 'Disminuyó',
      'stable': 'Estable'
    };
    return trendTexts[trend] || 'Estable';
  }
  
  /**
   * Verifica si hay datos para mostrar
   */
  hasData(): boolean {
    return this.data().categories.length > 0;
  }
  
  /**
   * Obtiene el número de categorías
   */
  getCategoryCount(): number {
    return this.data().categories.length;
  }
  
  /**
   * Calcula el promedio por categoría
   */
  getAveragePerCategory(): number {
    const categories = this.data().categories;
    return categories.length > 0 ? this.data().totalExpense / categories.length : 0;
  }
}
