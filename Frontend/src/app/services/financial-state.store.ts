import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { 
  FinancialStateDetailed, 
  GoalStateDetailed, 
  FinancialRecommendation
} from '../core/services/financial-state-v2.interface';
import { FinancialLogicV2Service } from '../core/services/financial-logic-v2.service';
import { firstValueFrom } from 'rxjs';

// Definir Transaction localmente por ahora
interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  transactionDate: Date;
  isConfirmed: boolean;
}

/**
 * ✅ PATRÓN: Private Signals + Public Computed Properties + Controlled Methods
 * Asegura single source of truth y validaciones centralizadas
 */
@Injectable({ providedIn: 'root' })
export class FinancialStateStore {
  
  private readonly logic = inject(FinancialLogicV2Service);

  // =============================================
  // 🔴 PRIVATE STATE SIGNALS
  // =============================================
  
  // Raw data
  #transactions = signal<Transaction[]>([]);
  #goals = signal<any[]>([]);
  
  // Calculated state
  #financialState = signal<FinancialStateDetailed | null>(null);
  #goalsWithState = signal<GoalStateDetailed[]>([]);
  #recommendations = signal<FinancialRecommendation[]>([]);
  
  // UI State
  #loading = signal(false);
  #error = signal<string | null>(null);
  #selectedGoalId = signal<string | null>(null);

  // =============================================
  // 🟢 PUBLIC COMPUTED SELECTORS
  // =============================================
  
  // Loading and error
  readonly loading = this.#loading.asReadonly();
  readonly error = this.#error.asReadonly();

  // Main financial state
  readonly financialState = this.#financialState.asReadonly();
  
  // ✅ Balance metrics - CONFIRMED
  readonly totalBalance = computed(() => 
    this.#financialState()?.confirmedBalance.totalBalance ?? 0
  );
  
  readonly availableBalance = computed(() => 
    this.#financialState()?.confirmedBalance.availableBalance ?? 0
  );
  
  readonly allocatedBalance = computed(() => 
    this.#financialState()?.confirmedBalance.allocatedBalance ?? 0
  );

  // ✅ Expected balance (includes pending)
  readonly expectedTotalBalance = computed(() => 
    this.#financialState()?.expectedBalance.totalBalance ?? 0
  );
  
  readonly expectedAvailableBalance = computed(() => 
    this.#financialState()?.expectedBalance.availableBalance ?? 0
  );

  // ✅ Monthly metrics - CONFIRMED
  readonly monthlyIncome = computed(() => 
    this.#financialState()?.monthlyIncome.confirmed ?? 0
  );
  
  readonly monthlyExpense = computed(() => 
    this.#financialState()?.monthlyExpense.confirmed ?? 0
  );
  
  // ✅ Expected monthly (includes pending)
  readonly expectedMonthlyIncome = computed(() => 
    this.#financialState()?.monthlyIncome.expected ?? 0
  );
  
  readonly expectedMonthlyExpense = computed(() => 
    this.#financialState()?.monthlyExpense.expected ?? 0
  );

  // ✅ Savings rate
  readonly savingsRate = computed(() => 
    this.#financialState()?.savingsRate.confirmed ?? 0
  );
  
  readonly expectedSavingsRate = computed(() => 
    this.#financialState()?.savingsRate.expected ?? 0
  );

  // ✅ Alerts
  readonly isNegativeBalance = computed(() => 
    this.#financialState()?.alerts.isNegativeBalance ?? false
  );
  
  readonly pendingTransactionsCount = computed(() => 
    this.#financialState()?.alerts.pendingTransactions ?? 0
  );
  
  readonly failedTransactionsCount = computed(() => 
    this.#financialState()?.alerts.failedTransactions ?? 0
  );

  // ✅ Goals
  readonly goals = this.#goalsWithState.asReadonly();
  
  readonly completedGoals = computed(() => 
    this.#goalsWithState().filter(g => g.status === 'COMPLETED')
  );
  
  readonly activeGoals = computed(() => 
    this.#goalsWithState().filter(g => g.status === 'ACTIVE')
  );
  
  readonly offTrackGoals = computed(() => 
    this.#goalsWithState().filter(g => !g.timeline.isOnTrack && g.status === 'ACTIVE')
  );

  // ✅ Recommendations
  readonly recommendations = this.#recommendations.asReadonly();

  // ✅ Selected goal
  readonly selectedGoal = computed(() => {
    const goalId = this.#selectedGoalId();
    return goalId 
      ? this.#goalsWithState().find(g => g.id === goalId)
      : null;
  });

  // =============================================
  // 📊 DERIVED COMPUTED VALUES
  // =============================================

  readonly hasErrors = computed(() => !!this.#error());
  
  readonly hasPendingTransactions = computed(() => 
    this.pendingTransactionsCount() > 0
  );
  
  readonly hasGoals = computed(() => this.#goalsWithState().length > 0);
  
  readonly allGoalsCompleted = computed(() => 
    this.#goalsWithState().length > 0 && 
    this.completedGoals().length === this.#goalsWithState().length
  );

  constructor() {
    this.setupEffects();
  }

  // =============================================
  // 📡 EFFECTS (Side effects para logging)
  // =============================================
  
  private setupEffects(): void {
    // Log cuando el estado financiero cambia
    effect(() => {
      const state = this.#financialState();
      if (state) {
        console.log('💾 Financial State Updated', {
          balance: this.totalBalance(),
          savingsRate: this.savingsRate(),
          alerts: {
            negative: this.isNegativeBalance(),
            pending: this.pendingTransactionsCount()
          }
        });
      }
    });

    // Log de errores
    effect(() => {
      const error = this.#error();
      if (error) {
        console.error('❌ Financial Store Error:', error);
      }
    });
  }

  // =============================================
  // 🔄 PUBLIC API - STATE UPDATERS
  // =============================================

  /**
   * CARGAR ESTADO FINANCIERO COMPLETO
   * Endpoint: GET /api/v1/financial/state
   */
  async loadFinancialState(): Promise<void> {
    this.#setLoading(true);
    this.#clearError();
    
    try {
      // Llamar al endpoint que devuelve FinancialStateDetailed
      const state = await firstValueFrom(this.logic.getFinancialStateDetailed());
      
      // Guardar datos crudos
      this.#transactions.set([]); // Por ahora vacío hasta tener el endpoint
      this.#goals.set([]); // Por ahora vacío hasta tener el endpoint
      
      // Guardar estado calculado
      this.#financialState.set(state);
      
      // Enriquecer metas (por ahora vacío hasta tener datos de goals)
      this.#goalsWithState.set([]);
      
      // Generar recomendaciones
      const recs = await firstValueFrom(this.logic.getFinancialRecommendations());
      this.#recommendations.set(recs);
      
      this.#setLoading(false);
    } catch (error) {
      this.#setError('Error cargando estado financiero');
      this.#setLoading(false);
    }
  }

  /**
   * ASIGNAR DINERO A META
   * Validaciones exhaustivas integradas
   */
  async allocateToGoal(amount: number, goalId: string, accountId: string, note?: string): Promise<boolean> {
    const state = this.#financialState();
    if (!state) {
      this.#setError('Estado financiero no cargado');
      return false;
    }

    this.#setLoading(true);
    this.#clearError();
    
    try {
      // Validar lógica
      const result = await firstValueFrom(
        this.logic.allocateToGoal(amount, goalId, accountId, note)
      );

      if (!result.success) {
        this.#setError(result.error || 'Error en asignación');
        this.#setLoading(false);
        return false;
      }
      
      // Recargar estado
      await this.loadFinancialState();
      return true;
    } catch (error) {
      this.#setError('Error asignando a meta');
      this.#setLoading(false);
      return false;
    }
  }

  /**
   * RETROCEDER DINERO DE META
   */
  async deallocateFromGoal(amount: number, goalId: string, accountId: string, note?: string): Promise<boolean> {
    const state = this.#financialState();
    if (!state) {
      this.#setError('Estado financiero no cargado');
      return false;
    }

    this.#setLoading(true);
    this.#clearError();
    
    try {
      const result = await firstValueFrom(
        this.logic.deallocateFromGoal(amount, goalId, accountId, note)
      );

      if (!result.success) {
        this.#setError(result.error || 'Error en retroceso');
        this.#setLoading(false);
        return false;
      }
      
      // Recargar estado
      await this.loadFinancialState();
      return true;
    } catch (error) {
      this.#setError('Error retrocediendo meta');
      this.#setLoading(false);
      return false;
    }
  }

  /**
   * SELECCIONAR META
   */
  selectGoal(goalId: string | null): void {
    this.#selectedGoalId.set(goalId);
  }

  /**
   * LIMPIAR ERRORES
   */
  clearError(): void {
    this.#clearError();
  }

  // =============================================
  // 🔧 PRIVATE HELPERS
  // =============================================

  #setLoading(value: boolean): void {
    this.#loading.set(value);
  }

  #setError(error: string): void {
    this.#error.set(error);
  }

  #clearError(): void {
    this.#error.set(null);
  }
}
