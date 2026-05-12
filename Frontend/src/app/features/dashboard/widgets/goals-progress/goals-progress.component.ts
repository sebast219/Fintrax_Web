import { Component, input, computed, output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GoalProgress {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  deadline: Date;
  daysRemaining: number;
  category: string;
  color: string;
}

export interface GoalsData {
  goals: GoalProgress[];
  totalGoals: number;
  completedGoals: number;
  totalSaved: number;
  totalTarget: number;
}

@Component({
  selector: 'app-goals-progress-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goals-progress.component.html',
  styleUrl: './goals-progress.component.scss'
})
export class GoalsProgressWidgetComponent {
  
  // Inputs
  data = input.required<GoalsData>();
  maxGoals = input<number>(5);
  showCompleted = input<boolean>(true);
  
  // Outputs
  goalClick = output<GoalProgress>();
  contributeClick = output<GoalProgress>();
  addGoalClick = output<void>();
  
  // ============================================
  // ✅ COMPUTED SIGNALS
  // ============================================
  
  // Filtrar metas activas (no completadas)
  activeGoals = computed(() => {
    return this.data().goals
      .filter(goal => goal.percentage < 100)
      .slice(0, this.maxGoals());
  });
  
  // Metas completadas
  completedGoals = computed(() => {
    return this.data().goals
      .filter(goal => goal.percentage >= 100)
      .slice(0, 3); // Máximo 3 completadas
  });
  
  // Estadísticas generales
  overallProgress = computed(() => {
    const data = this.data();
    if (data.totalTarget === 0) return 0;
    return (data.totalSaved / data.totalTarget) * 100;
  });
  
  // Meta más cercana a completarse
  nextGoal = computed(() => {
    const active = this.activeGoals();
    if (active.length === 0) return null;
    
    return active.reduce((closest, current) => {
      const currentRemaining = 100 - current.percentage;
      const closestRemaining = 100 - closest.percentage;
      return currentRemaining < closestRemaining ? current : closest;
    });
  });
  
  // Meta con más días restantes
  longestTermGoal = computed(() => {
    const active = this.activeGoals();
    if (active.length === 0) return null;
    
    return active.reduce((longest, current) => 
      current.daysRemaining > longest.daysRemaining ? current : longest
    );
  });
  
  // Promedio de progreso
  averageProgress = computed(() => {
    const goals = this.activeGoals();
    if (goals.length === 0) return 0;
    
    const total = goals.reduce((sum, goal) => sum + goal.percentage, 0);
    return total / goals.length;
  });
  
  // Monto total restante
  totalRemaining = computed(() => {
    const data = this.data();
    return data.totalTarget - data.totalSaved;
  });
  
  // ============================================
  // ✅ MÉTODOS DE ACCIÓN
  // ============================================
  
  /**
   * Maneja el click en una meta
   */
  onGoalClick(goal: GoalProgress): void {
    this.goalClick.emit(goal);
  }
  
  /**
   * Maneja el click para contribuir
   */
  onContributeClick(goal: GoalProgress, event: Event): void {
    event.stopPropagation();
    this.contributeClick.emit(goal);
  }
  
  /**
   * Maneja el click para agregar nueva meta
   */
  onAddGoalClick(): void {
    this.addGoalClick.emit();
  }
  
  // ============================================
  // ✅ UTILIDADES DE FORMATEO
  // ============================================
  
  /**
   * Formatea moneda
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
   * Obtiene el color según el progreso
   */
  getProgressColor(percentage: number): string {
    if (percentage >= 100) return '#10B981'; // Verde - completado
    if (percentage >= 75) return '#3B82F6'; // Azul - casi completado
    if (percentage >= 50) return '#F59E0B'; // Amarillo - mitad
    if (percentage >= 25) return '#F97316'; // Naranja - empezando
    return '#EF4444'; // Rojo - poco progreso
  }
  
  /**
   * Obtiene el estado de urgencia
   */
  getUrgencyStatus(daysRemaining: number): { text: string; color: string; icon: string } {
    if (daysRemaining <= 7) {
      return { text: 'Urgente', color: 'text-red-600', icon: '🔥' };
    }
    if (daysRemaining <= 30) {
      return { text: 'Pronto', color: 'text-orange-600', icon: '⏰' };
    }
    if (daysRemaining <= 90) {
      return { text: 'A tiempo', color: 'text-blue-600', icon: '✅' };
    }
    return { text: 'Largo plazo', color: 'text-green-600', icon: '🕐' };
  }
  
  /**
   * Formatea días restantes
   */
  formatDaysRemaining(days: number): string {
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days < 0) return 'Vencida';
    if (days <= 7) return `${days} días`;
    if (days <= 30) return `${Math.floor(days / 7)} semanas`;
    return `${Math.floor(days / 30)} meses`;
  }
  
  /**
   * Verifica si hay metas activas
   */
  hasActiveGoals(): boolean {
    return this.activeGoals().length > 0;
  }
  
  /**
   * Verifica si hay metas completadas
   */
  hasCompletedGoals(): boolean {
    return this.completedGoals().length > 0 && this.showCompleted();
  }
  
  /**
   * Obtiene el número de metas activas
   */
  getActiveGoalsCount(): number {
    return this.activeGoals().length;
  }
  
  /**
   * Obtiene el número de metas completadas
   */
  getCompletedGoalsCount(): number {
    return this.completedGoals().length;
  }
  
  /**
   * Calcula el progreso de una meta individual
   */
  calculateGoalProgress(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  }
  
  /**
   * Obtiene el estilo del círculo de progreso
   */
  getProgressCircleStyle(percentage: number): object {
    const color = this.getProgressColor(percentage);
    const circumference = 2 * Math.PI * 45; // radio = 45
    const offset = circumference - (percentage / 100) * circumference;
    
    return {
      'stroke': color,
      'stroke-dasharray': `${circumference}`,
      'stroke-dashoffset': `${offset}`
    };
  }
  
  /**
   * Verifica si una meta está completada
   */
  isGoalCompleted(goal: GoalProgress): boolean {
    return goal.percentage >= 100;
  }
  
  /**
   * Obtiene el icono de estado
   */
  getStatusIcon(goal: GoalProgress): string {
    if (this.isGoalCompleted(goal)) return '✅';
    if (goal.daysRemaining <= 7) return '⚠️';
    return '🎯';
  }
  
  /**
   * Obtiene el texto de estado
   */
  getStatusText(goal: GoalProgress): string {
    if (this.isGoalCompleted(goal)) return 'Completada';
    if (goal.daysRemaining <= 0) return 'Vencida';
    return `${goal.percentage.toFixed(0)}%`;
  }
}
