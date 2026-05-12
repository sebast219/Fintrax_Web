import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FinancialStateDetailed,
  GoalStateDetailed,
  AllocationResult,
  DeallocationResult,
  FinancialRecommendation,
  TransactionMetrics
} from './financial-state-v2.interface';

// Re-exportar tipos para uso en componentes
export type { FinancialStateDetailed, GoalStateDetailed, AllocationResult, DeallocationResult, FinancialRecommendation, TransactionMetrics };

@Injectable({
  providedIn: 'root'
})
export class FinancialLogicV2Service {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtener estado financiero completo del usuario
   */
  getFinancialStateDetailed(): Observable<FinancialStateDetailed> {
    return this.http.get<FinancialStateDetailed>(`${this.baseUrl}/financial-v2/state`);
  }

  /**
   * Obtener recomendaciones financieras inteligentes
   */
  getFinancialRecommendations(): Observable<FinancialRecommendation[]> {
    return this.http.get<FinancialRecommendation[]>(`${this.baseUrl}/financial-v2/recommendations`);
  }

  /**
   * Obtener métricas detalladas de transacciones
   */
  getTransactionMetrics(): Observable<TransactionMetrics> {
    return this.http.get<TransactionMetrics>(`${this.baseUrl}/financial-v2/metrics`);
  }

  /**
   * Asignar fondos a una meta con validaciones exhaustivas
   */
  allocateToGoal(
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Observable<AllocationResult> {
    return this.http.post<AllocationResult>(`${this.baseUrl}/financial-v2/allocate-goal`, {
      amount,
      goalId,
      accountId,
      note
    });
  }

  /**
   * Retirar fondos de una meta con validaciones exhaustivas
   */
  deallocateFromGoal(
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Observable<DeallocationResult> {
    return this.http.post<DeallocationResult>(`${this.baseUrl}/financial-v2/deallocate-goal`, {
      amount,
      goalId,
      accountId,
      note
    });
  }

  /**
   * Métodos de conveniencia para validaciones
   */

  /**
   * Calcular si hay fondos suficientes para asignar a meta
   */
  canAllocateToGoal(
    amount: number,
    currentState: FinancialStateDetailed
  ): boolean {
    return amount <= currentState.confirmedBalance.availableBalance;
  }

  /**
   * Calcular si hay fondos suficientes para retirar de meta
   */
  canDeallocateFromGoal(
    amount: number,
    goalCurrentAmount: number
  ): boolean {
    return amount <= goalCurrentAmount;
  }

  /**
   * Obtener monto máximo que se puede asignar a una meta
   */
  getMaxAllocatable(
    currentState: FinancialStateDetailed,
    goalTargetAmount: number,
    goalCurrentAmount: number
  ): number {
    const remainingInGoal = goalTargetAmount - goalCurrentAmount;
    const availableInBalance = currentState.confirmedBalance.availableBalance;
    return Math.min(remainingInGoal, availableInBalance);
  }

  /**
   * Obtener monto máximo que se puede retirar de una meta
   */
  getMaxDeallocatable(goalCurrentAmount: number): number {
    return goalCurrentAmount;
  }

  /**
   * Formatear montos para display
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  /**
   * Calcular progreso en porcentaje
   */
  calculateProgressPercentage(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  }

  /**
   * Obtener color según estado financiero
   */
  getBalanceColor(state: FinancialStateDetailed): string {
    if (state.alerts.isNegativeBalance) return '#EF4444'; // rojo
    if (state.savingsRate.confirmed < 10) return '#F59E0B'; // ámbar
    if (state.savingsRate.confirmed >= 30) return '#10B981'; // verde
    return '#3B82F6'; // azul
  }

  /**
   * Obtener severidad de alerta
   */
  getAlertSeverity(recommendation: FinancialRecommendation): 'low' | 'medium' | 'high' | 'critical' {
    return recommendation.severity.toLowerCase() as any;
  }

  /**
   * Obtener icono según tipo de alerta
   */
  getAlertIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'NEGATIVE_BALANCE': '🔴',
      'PENDING_TRANSACTIONS': '⏳',
      'FAILED_TRANSACTIONS': '❌',
      'GOAL_OFF_TRACK': '🎯',
      'GOAL_DEADLINE_SOON': '⏰',
      'LOW_SAVINGS_RATE': '📉',
      'HIGH_EXPENSE_RATE': '💸'
    };
    return iconMap[type] || '📊';
  }

  /**
   * Agrupar transacciones por estado
   */
  groupTransactionsByStatus(transactions: any[]): {
    pending: any[];
    completed: any[];
    failed: any[];
  } {
    return {
      pending: transactions.filter(t => t.status === 'PENDING'),
      completed: transactions.filter(t => t.status === 'COMPLETED'),
      failed: transactions.filter(t => t.status === 'FAILED')
    };
  }

  /**
   * Calcular balance esperado vs confirmado
   */
  calculateBalancesDifference(state: FinancialStateDetailed): {
    totalDifference: number;
    availableDifference: number;
    percentageDifference: number;
  } {
    const totalDifference = state.expectedBalance.totalBalance - state.confirmedBalance.totalBalance;
    const availableDifference = state.expectedBalance.availableBalance - state.confirmedBalance.availableBalance;
    
    const percentageDifference = state.confirmedBalance.totalBalance !== 0
      ? Math.round((totalDifference / Math.abs(state.confirmedBalance.totalBalance)) * 100)
      : 0;

    return {
      totalDifference,
      availableDifference,
      percentageDifference
    };
  }

  /**
   * Determinar si el usuario necesita atención urgente
   */
  needsUrgentAttention(state: FinancialStateDetailed): boolean {
    return state.alerts.isNegativeBalance || 
           state.alerts.failedTransactions > 0 ||
           state.savingsRate.confirmed < 0;
  }

  /**
   * Obtener mensaje de estado resumido
   */
  getFinancialSummary(state: FinancialStateDetailed): {
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    action?: string;
  } {
    if (state.alerts.isNegativeBalance) {
      return {
        message: 'Tu balance es negativo. Necesitas atención inmediata.',
        type: 'error',
        action: 'Agregar ingresos o reducir gastos urgentemente'
      };
    }

    if (state.savingsRate.confirmed < 10) {
      return {
        message: `Tu tasa de ahorro es baja (${state.savingsRate.confirmed}%).`,
        type: 'warning',
        action: 'Revisa tus gastos y busca oportunidades de ahorro'
      };
    }

    if (state.alerts.pendingTransactions > 0) {
      return {
        message: `Tienes ${state.alerts.pendingTransactions} transacción(es) pendiente(s).`,
        type: 'info',
        action: 'Verifica el estado de tus transacciones'
      };
    }

    if (state.savingsRate.confirmed >= 30) {
      return {
        message: `¡Excelente! Tu tasa de ahorro es del ${state.savingsRate.confirmed}%.`,
        type: 'success',
        action: 'Considera invertir el excedente para mayor crecimiento'
      };
    }

    return {
      message: 'Tu estado financiero es estable.',
      type: 'info'
    };
  }

  /**
   * Calcular métricas de progreso de metas
   */
  getGoalsProgressSummary(goals: GoalStateDetailed[]): {
    total: number;
    completed: number;
    onTrack: number;
    offTrack: number;
    averageProgress: number;
  } {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'COMPLETED').length;
    const onTrack = goals.filter(g => g.timeline.isOnTrack).length;
    const offTrack = total - completed - onTrack;
    
    const averageProgress = total > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress.percentage, 0) / total)
      : 0;

    return {
      total,
      completed,
      onTrack,
      offTrack,
      averageProgress
    };
  }
}
