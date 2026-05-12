import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  FinancialStateDetailed,
  GoalStateDetailed,
  AllocationResult,
  DeallocationResult,
  FinancialRecommendation,
  TransactionMetrics
} from '../interfaces/financial-state.interface';
import {
  TransactionStatus,
  GoalStatus,
  BalanceType,
  AllocationErrorType,
  AlertType
} from '../enums/financial.enums';

@Injectable()
export class FinancialLogicV2Service {
  private readonly logger = new Logger('FinancialLogicV2Service');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🎯 CALCULA ESTADO FINANCIERO COMPLETO CON DOS ESCENARIOS
   * - Confirmado: solo COMPLETED
   * - Esperado: COMPLETED + PENDING (para planeación)
   */
  async calculateFinancialStateDetailed(userId: string): Promise<FinancialStateDetailed> {
    const currentMonth = this.getCurrentMonthRange();

    try {
      // =============================================
      // 1️⃣ OBTENER TODAS LAS TRANSACCIONES DEL USUARIO
      // =============================================
      const allTransactions = await this.prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          amount: true,
          transactionDate: true,
          status: true,
          metadata: true,
          createdAt: true
        },
        orderBy: { transactionDate: 'desc' }
      });

      // =============================================
      // 2️⃣ SEPARAR TRANSACCIONES POR ESTADO
      // =============================================
      const completed = allTransactions.filter(t => t.status === 'COMPLETED');
      const pending = allTransactions.filter(t => t.status === 'PENDING');
      const failed = allTransactions.filter(t => t.status === 'FAILED');

      // =============================================
      // 3️⃣ CALCULAR BALANCES CONFIRMADOS
      // =============================================
      const confirmedIncome = this.sumByType(completed, 'INCOME');
      const confirmedExpense = this.sumByType(completed, 'EXPENSE');
      const confirmedTotal = confirmedIncome - confirmedExpense;

      // =============================================
      // 4️⃣ CALCULAR BALANCES ESPERADOS
      // =============================================
      const allValidTransactions = [...completed, ...pending]; // Excluye FAILED
      const expectedIncome = this.sumByType(allValidTransactions, 'INCOME');
      const expectedExpense = this.sumByType(allValidTransactions, 'EXPENSE');
      const expectedTotal = expectedIncome - expectedExpense;

      // =============================================
      // 5️⃣ CALCULAR ASIGNACIONES A METAS
      // =============================================
      const goals = await this.prisma.goal.findMany({
        where: { userId },
        select: { currentAmount: true, targetAmount: true }
      });

      const allocatedBalance = goals.reduce(
        (sum, goal) => sum + Number(goal.currentAmount),
        0
      );

      // =============================================
      // 6️⃣ CALCULAR DISPONIBLES
      // =============================================
      const confirmedAvailable = confirmedTotal - allocatedBalance;
      const expectedAvailable = expectedTotal - allocatedBalance;

      // =============================================
      // 7️⃣ VALIDAR DESCUBIERTO
      // =============================================
      const isNegativeBalance = confirmedTotal < 0;

      if (isNegativeBalance) {
        this.logger.warn(`⚠️ Balance negativo detectado: $${confirmedTotal} para usuario ${userId}`);
      }

      // =============================================
      // 8️⃣ CALCULAR INGRESOS/GASTOS DEL MES
      // =============================================
      const monthlyCompleted = completed.filter(t =>
        this.isInDateRange(t.transactionDate, currentMonth)
      );

      const monthlyPending = pending.filter(t =>
        this.isInDateRange(t.transactionDate, currentMonth)
      );

      const monthlyIncome = {
        confirmed: this.sumByType(monthlyCompleted, 'INCOME'),
        pending: this.sumByType(monthlyPending, 'INCOME'),
        expected: 0
      };
      monthlyIncome.expected = monthlyIncome.confirmed + monthlyIncome.pending;

      const monthlyExpense = {
        confirmed: this.sumByType(monthlyCompleted, 'EXPENSE'),
        pending: this.sumByType(monthlyPending, 'EXPENSE'),
        expected: 0
      };
      monthlyExpense.expected = monthlyExpense.confirmed + monthlyExpense.pending;

      // =============================================
      // 9️⃣ CALCULAR TASA DE AHORRO
      // =============================================
      const savingsRate = {
        confirmed: this.calculateSavingsRate(
          monthlyIncome.confirmed,
          monthlyExpense.confirmed
        ),
        expected: this.calculateSavingsRate(
          monthlyIncome.expected,
          monthlyExpense.expected
        )
      };

      // =============================================
      // 🔟 COMPILAR ALERTAS
      // =============================================
      const alertTypes: AlertType[] = [];
      
      if (isNegativeBalance) alertTypes.push(AlertType.NEGATIVE_BALANCE);
      if (pending.length > 0) alertTypes.push(AlertType.PENDING_TRANSACTIONS);
      if (savingsRate.confirmed < 10) alertTypes.push(AlertType.LOW_SAVINGS_RATE);
      if (monthlyExpense.expected > monthlyIncome.expected * 0.9) alertTypes.push(AlertType.HIGH_EXPENSE_RATE);

      const alerts = {
        isNegativeBalance,
        pendingTransactions: pending.length,
        failedTransactions: 0, // TODO: Implementar cuando tengamos status FAILED
        types: alertTypes
      };

      return {
        confirmedBalance: {
          totalBalance: confirmedTotal,
          availableBalance: confirmedAvailable,
          allocatedBalance
        },
        expectedBalance: {
          totalBalance: expectedTotal,
          availableBalance: expectedAvailable,
          allocatedBalance
        },
        monthlyIncome,
        monthlyExpense,
        alerts,
        savingsRate,
        calculatedAt: new Date(),
        userId
      };

    } catch (error) {
      this.logger.error(`Error calculating financial state for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * ✅ ASIGNAR A META CON VALIDACIONES EXHAUSTIVAS
   */
  async allocateToGoal(
    userId: string,
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Promise<AllocationResult> {
    try {
      // ✅ V1: Validar monto
      if (amount <= 0) {
        return {
          success: false,
          error: 'El monto debe ser mayor a $0',
          type: AllocationErrorType.INVALID_AMOUNT
        };
      }

      // ✅ V2: Validar que meta existe
      const goal = await this.prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        return {
          success: false,
          error: 'Meta no encontrada',
          type: AllocationErrorType.GOAL_NOT_FOUND
        };
      }

      // ✅ V3: Validar que meta no esté completada
      if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
        return {
          success: false,
          error: 'La meta ya fue completada',
          type: AllocationErrorType.GOAL_COMPLETED
        };
      }

      // ✅ V4: Validar disponibilidad (usar CONFIRMED para operaciones)
      const currentState = await this.calculateFinancialStateDetailed(userId);
      
      if (amount > currentState.confirmedBalance.availableBalance) {
        return {
          success: false,
          error: `Fondos insuficientes. Disponible confirmado: $${currentState.confirmedBalance.availableBalance.toFixed(2)}`,
          type: AllocationErrorType.INSUFFICIENT_FUNDS
        };
      }

      // ✅ V5: Validar que no exceda target
      const wouldExceed = Number(goal.currentAmount) + amount > Number(goal.targetAmount);
      const maxAllowed = Number(goal.targetAmount) - Number(goal.currentAmount);

      if (wouldExceed) {
        return {
          success: false,
          error: `Excedería el objetivo. Máximo: $${maxAllowed.toFixed(2)}`,
          type: AllocationErrorType.EXCEEDS_TARGET
        };
      }

      // ✅ OPERACIÓN EXITOSA (TRANSACCIONAL)
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Obtener o crear categoría para asignaciones
        let allocationCategory = await tx.category.findFirst({
          where: {
            userId,
            name: 'GOAL_ALLOCATION',
            type: 'EXPENSE'
          }
        });

        if (!allocationCategory) {
          allocationCategory = await tx.category.create({
            data: {
              userId,
              name: 'GOAL_ALLOCATION',
              type: 'EXPENSE',
              icon: '🎯',
              color: '#8B5CF6',
              isDefault: true
            }
          });
        }

        // 2. Crear transacción de asignación
        const allocationTransaction = await tx.transaction.create({
          data: {
            userId,
            accountId,
            categoryId: allocationCategory.id,
            type: 'EXPENSE',
            amount: new Decimal(amount),
            description: `Asignación a meta: ${goal.name}`,
            notes: note || `Asignación automática a meta ${goal.name}`,
            transactionDate: new Date(),
            metadata: {
              goalId,
              allocationType: 'GOAL_ALLOCATION',
              originalAmount: amount
            },
            tags: ['goal-allocation', goalId],
            isConfirmed: true // Las asignaciones son inmediatas
          }
        });

        // 3. Crear contribución a la meta
        const contribution = await tx.goalContribution.create({
          data: {
            goalId,
            userId,
            amount: new Decimal(amount),
            note: note || `Asignación de $${amount.toFixed(2)}`,
            transactionId: allocationTransaction.id
          }
        });

        // 4. Actualizar monto actual de la meta
        const updatedGoal = await tx.goal.update({
          where: { id: goalId },
          data: {
            currentAmount: { increment: new Decimal(amount) },
            status: Number(goal.currentAmount) + amount >= Number(goal.targetAmount) ? 'COMPLETED' : 'ACTIVE',
            completedAt: Number(goal.currentAmount) + amount >= Number(goal.targetAmount) ? new Date() : undefined
          }
        });

        // 5. Recalcular estado
        const newState = await this.calculateFinancialStateDetailed(userId);

        return {
          transaction: allocationTransaction,
          contribution,
          goal: updatedGoal,
          newState
        };
      });

      const goalState = await this.enrichGoalWithState(result.goal.id);

      this.logger.log(`✅ Asignado $${amount} a meta "${goal.name}" para usuario ${userId}`);

      return {
        success: true,
        data: {
          goal: goalState,
          newState: result.newState,
          transaction: result.transaction
        }
      };

    } catch (error) {
      this.logger.error(`Error allocating to goal ${goalId} for user ${userId}:`, error);
      return {
        success: false,
        error: 'Error interno al asignar fondos',
        type: AllocationErrorType.INSUFFICIENT_FUNDS
      };
    }
  }

  /**
   * 🔄 RETROCEDER DE META
   */
  async deallocateFromGoal(
    userId: string,
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Promise<DeallocationResult> {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Monto debe ser > $0' };
      }

      const goal = await this.prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        return { success: false, error: 'Meta no encontrada' };
      }

      if (amount > Number(goal.currentAmount)) {
        return {
          success: false,
          error: `No hay suficientes fondos. Asignado: $${Number(goal.currentAmount).toFixed(2)}`
        };
      }

      // ✅ RETROCESO (TRANSACCIONAL)
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Obtener o crear categoría para devoluciones
        let deallocationCategory = await tx.category.findFirst({
          where: {
            userId,
            name: 'GOAL_DEALLOCATION',
            type: 'INCOME'
          }
        });

        if (!deallocationCategory) {
          deallocationCategory = await tx.category.create({
            data: {
              userId,
              name: 'GOAL_DEALLOCATION',
              type: 'INCOME',
              icon: '↩️',
              color: '#10B981',
              isDefault: true
            }
          });
        }

        // 2. Crear transacción de devolución
        const deallocationTransaction = await tx.transaction.create({
          data: {
            userId,
            accountId,
            categoryId: deallocationCategory.id,
            type: 'INCOME',
            amount: new Decimal(amount),
            description: `Retorno de meta: ${goal.name}`,
            notes: note || `Devolución desde meta ${goal.name}`,
            transactionDate: new Date(),
            metadata: {
              goalId,
              allocationType: 'GOAL_DEALLOCATION',
              originalAmount: amount
            },
            tags: ['goal-deallocation', goalId],
            isConfirmed: true // Las devoluciones son inmediatas
          }
        });

        // 3. Crear contribución negativa
        const contribution = await tx.goalContribution.create({
          data: {
            goalId,
            userId,
            amount: new Decimal(-amount), // Contribución negativa
            note: note || `Devolución de $${amount.toFixed(2)}`,
            transactionId: deallocationTransaction.id
          }
        });

        // 4. Actualizar monto actual de la meta
        const updatedGoal = await tx.goal.update({
          where: { id: goalId },
          data: {
            currentAmount: { decrement: new Decimal(amount) },
            status: goal.status === 'COMPLETED' ? 'ACTIVE' : undefined,
            completedAt: goal.status === 'COMPLETED' ? null : undefined
          }
        });

        // 5. Recalcular estado
        const newState = await this.calculateFinancialStateDetailed(userId);

        return {
          transaction: deallocationTransaction,
          contribution,
          goal: updatedGoal,
          newState
        };
      });

      const goalState = await this.enrichGoalWithState(result.goal.id);

      this.logger.log(`↩️ Retrocedido $${amount} de meta "${goal.name}" para usuario ${userId}`);

      return {
        success: true,
        data: {
          goal: goalState,
          newState: result.newState,
          transaction: result.transaction
        }
      };

    } catch (error) {
      this.logger.error(`Error deallocating from goal ${goalId} for user ${userId}:`, error);
      return {
        success: false,
        error: 'Error interno al retirar fondos'
      };
    }
  }

  /**
   * 🎯 ENRIQUECER META CON ESTADO DETALLADO
   */
  private async enrichGoalWithState(goalId: string): Promise<GoalStateDetailed> {
    // Obtener goal con sus contribuciones
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        contributions: {
          select: {
            transactionId: true,
            amount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!goal) {
      throw new Error(`Goal ${goalId} not found`);
    }

    const percentage = Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
    const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));
    
    const daysRemaining = goal.targetDate 
      ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 999999; // Sin fecha límite
    
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    const monthlyVelocity = remaining > 0 ? remaining / monthsRemaining : 0;
    const isOnTrack = remaining === 0 || monthlyVelocity > 0;

    // ✅ Calcular allocatedTransactions desde contributions
    const allocatedTransactions = goal.contributions
      .filter(c => c.transactionId !== null)
      .map(c => c.transactionId!) as string[];

    const alerts: string[] = [];

    if (daysRemaining < 7 && remaining > 0) {
      alerts.push(`⏰ Menos de una semana para completar`);
    }

    if (!isOnTrack) {
      alerts.push(`📉 No vas al ritmo necesario`);
    }

    if (percentage === 100) {
      alerts.push(`🎉 Meta completada!`);
    }

    return {
      id: goal.id,
      name: goal.name,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      deadline: new Date(goal.targetDate || Date.now() + 86400000 * 365),
      priority: goal.priority as any, // ✅ De la BD
      sourceType: goal.sourceType as any, // ✅ De la BD
      allocatedTransactions, // ✅ Calculado desde contributions
      status: percentage === 100 ? GoalStatus.COMPLETED : GoalStatus.ACTIVE,
      progress: { percentage, remaining },
      timeline: { daysRemaining, monthlyVelocity, isOnTrack },
      alerts,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    };
  }

  /**
   * 📊 GENERAR RECOMENDACIONES INTELIGENTES
   */
  async generateRecommendations(userId: string): Promise<FinancialRecommendation[]> {
    const state = await this.calculateFinancialStateDetailed(userId);
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: { contributions: true }
    });

    const recommendations: FinancialRecommendation[] = [];

    // Basado en tasa de ahorro
    if (state.savingsRate.confirmed < 10) {
      recommendations.push({
        type: AlertType.LOW_SAVINGS_RATE,
        severity: 'HIGH',
        title: 'Tasa de ahorro muy baja',
        message: `Tu tasa de ahorro es del ${state.savingsRate.confirmed}%. Intenta reducir gastos innecesarios.`,
        action: 'Revisa tus categorías de mayor gasto',
        icon: '📉'
      });
    } else if (state.savingsRate.confirmed >= 30) {
      recommendations.push({
        type: AlertType.LOW_SAVINGS_RATE,
        severity: 'LOW',
        title: '¡Excelente tasa de ahorro!',
        message: `Tu tasa de ahorro es del ${state.savingsRate.confirmed}%. Considera invertir el exceso.`,
        action: 'Explora opciones de inversión',
        icon: '🎉'
      });
    }

    // Basado en balance negativo
    if (state.alerts.isNegativeBalance) {
      recommendations.push({
        type: AlertType.NEGATIVE_BALANCE,
        severity: 'CRITICAL',
        title: 'Balance negativo',
        message: `Tu balance es de $${state.confirmedBalance.totalBalance.toFixed(2)}. Necesitas atención urgente.`,
        action: 'Agrega ingresos o reduce gastos inmediatamente',
        icon: '🔴'
      });
    }

    // Basado en transacciones pendientes
    if (state.alerts.pendingTransactions > 0) {
      recommendations.push({
        type: AlertType.PENDING_TRANSACTIONS,
        severity: 'MEDIUM',
        title: 'Transacciones pendientes',
        message: `Tienes ${state.alerts.pendingTransactions} transacción(es) pendiente(s).`,
        action: 'Verifica el estado de tus transacciones',
        icon: '⏳'
      });
    }

    // Basado en metas
    const offTrackGoals = goals.filter(goal => {
      const percentage = Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
      const daysRemaining = goal.targetDate 
        ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 999999;
      
      if (daysRemaining < 0 && percentage < 100) return true; // Meta vencida
      if (daysRemaining < 30 && percentage < 50) return true; // Menos de 30 días y menos del 50%
      
      return false;
    });

    if (offTrackGoals.length > 0) {
      recommendations.push({
        type: AlertType.GOAL_OFF_TRACK,
        severity: 'MEDIUM',
        title: 'Metas fuera de ritmo',
        message: `Tienes ${offTrackGoals.length} meta(s) que necesitan atención.`,
        action: 'Revisa el progreso de tus metas',
        icon: '🎯'
      });
    }

    return recommendations;
  }

  /**
   * 📈 OBTENER MÉTRICAS DETALLADAS DE TRANSACCIONES
   */
  async getTransactionMetrics(userId: string): Promise<TransactionMetrics> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true,
        status: true,
        transactionDate: true
      }
    });

    const total = transactions.length;
    const completed = transactions.filter(t => t.status === 'COMPLETED').length;
    const pending = transactions.filter(t => t.status === 'PENDING').length;
    const failed = transactions.filter(t => t.status === 'FAILED').length;

    const byType = {
      income: {
        total: transactions.filter(t => t.type === 'INCOME').length,
        completed: transactions.filter(t => t.type === 'INCOME' && t.status === 'COMPLETED').length,
        pending: transactions.filter(t => t.type === 'INCOME' && t.status === 'PENDING').length,
        failed: transactions.filter(t => t.type === 'INCOME' && t.status === 'FAILED').length
      },
      expense: {
        total: transactions.filter(t => t.type === 'EXPENSE').length,
        completed: transactions.filter(t => t.type === 'EXPENSE' && t.status === 'COMPLETED').length,
        pending: transactions.filter(t => t.type === 'EXPENSE' && t.status === 'PENDING').length,
        failed: transactions.filter(t => t.type === 'EXPENSE' && t.status === 'FAILED').length
      }
    };

    // Agrupar por mes
    const byMonth = this.groupTransactionsByMonth(transactions);

    return {
      total,
      completed,
      pending,
      failed,
      byType,
      byMonth
    };
  }

  // =============================================
  // UTILIDADES PRIVADAS
  // =============================================

  private sumByType(transactions: any[], type: 'INCOME' | 'EXPENSE'): number {
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  private calculateSavingsRate(income: number, expense: number): number {
    if (income === 0) return 0;
    return Math.max(0, Math.round(((income - expense) / income) * 100));
  }

  private isInDateRange(date: Date, range: { start: Date; end: Date }): boolean {
    const transactionDate = new Date(date);
    return transactionDate >= range.start && transactionDate <= range.end;
  }

  private getCurrentMonthRange() {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
  }

  private groupTransactionsByMonth(transactions: any[]): Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }> {
    const grouped: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach(t => {
      const date = new Date(t.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = { income: 0, expense: 0 };
      }

      if (t.isConfirmed) {
        if (t.type === 'INCOME') {
          grouped[monthKey].income += Number(t.amount);
        } else if (t.type === 'EXPENSE') {
          grouped[monthKey].expense += Number(t.amount);
        }
      }
    });

    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
