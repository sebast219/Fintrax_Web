import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancialState {
  availableBalance: number;
  allocatedBalance: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
}

export interface GoalAllocationResult {
  success: boolean;
  newState?: FinancialState;
  error?: string;
  allocationTransaction?: any;
  updatedGoal?: any;
}

export interface GoalDeallocationResult {
  success: boolean;
  newState?: FinancialState;
  error?: string;
  deallocationTransaction?: any;
  updatedGoal?: any;
}

export interface AccountBalance {
  id: string;
  name: string;
  balance: number;
  type: string;
  availableBalance: number;
  allocatedBalance: number;
}

export interface AccountBalancesResponse {
  accounts: AccountBalance[];
  totalAvailable: number;
  totalAllocated: number;
  totalBalance: number;
}

export interface GoalProgress {
  percentage: number;
  remaining: number;
  onTrack: boolean;
  daysRemaining: number;
  monthlyNeeded: number;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialLogicService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtener estado financiero completo del usuario
   */
  getFinancialState(): Observable<FinancialState> {
    return this.http.get<FinancialState>(`${this.baseUrl}/financial/state`);
  }

  /**
   * Obtener balance detallado por cuentas
   */
  getAccountBalances(): Observable<AccountBalancesResponse> {
    return this.http.get<AccountBalancesResponse>(`${this.baseUrl}/financial/accounts`);
  }

  /**
   * Asignar fondos a una meta
   */
  allocateToGoal(
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Observable<GoalAllocationResult> {
    return this.http.post<GoalAllocationResult>(`${this.baseUrl}/financial/allocate-goal`, {
      amount,
      goalId,
      accountId,
      note
    });
  }

  /**
   * Retirar fondos de una meta
   */
  deallocateFromGoal(
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Observable<GoalDeallocationResult> {
    return this.http.post<GoalDeallocationResult>(`${this.baseUrl}/financial/deallocate-goal`, {
      amount,
      goalId,
      accountId,
      note
    });
  }

  /**
   * Obtener progreso detallado de una meta
   */
  getGoalProgress(goalId: string): Observable<GoalProgress> {
    return this.http.get<GoalProgress>(`${this.baseUrl}/financial/goal-progress/${goalId}`);
  }

  /**
   * Métodos de conveniencia para operaciones comunes
   */

  /**
   * Calcular si hay fondos suficientes para asignar a meta
   */
  canAllocateToGoal(
    amount: number,
    currentState: FinancialState
  ): boolean {
    return amount <= currentState.availableBalance;
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
    currentState: FinancialState,
    goalTargetAmount: number,
    goalCurrentAmount: number
  ): number {
    const remainingInGoal = goalTargetAmount - goalCurrentAmount;
    const availableInBalance = currentState.availableBalance;
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
   * Determinar si el usuario está en buen camino con sus metas
   */
  isOnTrack(goalProgress: GoalProgress): boolean {
    return goalProgress.onTrack && goalProgress.percentage > 0;
  }

  /**
   * Obtener recomendación basada en estado financiero
   */
  getFinancialRecommendation(state: FinancialState): {
    type: 'good' | 'warning' | 'danger';
    message: string;
    action?: string;
  } {
    if (state.savingsRate >= 30) {
      return {
        type: 'good',
        message: '¡Excelente tasa de ahorro! Estás por encima del 30% recomendado.',
        action: 'Considera invertir el excedente para mayor crecimiento.'
      };
    }

    if (state.savingsRate >= 20) {
      return {
        type: 'good',
        message: 'Buena tasa de ahorro. Estás cerca del objetivo del 30%.',
        action: 'Pequeños ajustes pueden llevarte al 30%.'
      };
    }

    if (state.savingsRate >= 10) {
      return {
        type: 'warning',
        message: 'Tasa de ahorro mejorable. El objetivo es 30%.',
        action: 'Revisa tus gastos y busca oportunidades de ahorro.'
      };
    }

    if (state.savingsRate >= 0) {
      return {
        type: 'danger',
        message: 'Tasa de ahorro baja. Necesitas mejorar tus hábitos financieros.',
        action: 'Considera crear un presupuesto y reducir gastos no esenciales.'
      };
    }

    return {
      type: 'danger',
      message: 'Gastos superan ingresos. Requiere atención inmediata.',
      action: 'Identifica y elimina gastos innecesarios urgentemente.'
    };
  }
}
