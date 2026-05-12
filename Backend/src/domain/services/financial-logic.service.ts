import { Injectable } from '@nestjs/common';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

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

@Injectable()
export class FinancialLogicService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula el estado financiero completo del usuario
   * Regla: totalBalance = availableBalance + allocatedBalance
   */
  async calculateFinancialState(userId: string): Promise<FinancialState> {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // 1️⃣ CALCULAR INGRESOS Y GASTOS DEL MES (solo transacciones confirmadas)
    const monthlyAggregations = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        isConfirmed: true,
        transactionDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        type: {
          in: [TransactionType.INCOME, TransactionType.EXPENSE]
        }
      },
      _sum: {
        amount: true
      }
    });

    const monthlyIncome = Number(
      monthlyAggregations.find(t => t.type === TransactionType.INCOME)?._sum.amount || 0
    );
    const monthlyExpense = Number(
      monthlyAggregations.find(t => t.type === TransactionType.EXPENSE)?._sum.amount || 0
    );

    // 2️⃣ CALCULAR BALANCE TOTAL HISTÓRICO
    const totalAggregations = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        isConfirmed: true,
        type: {
          in: [TransactionType.INCOME, TransactionType.EXPENSE]
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalIncome = Number(
      totalAggregations.find(t => t.type === TransactionType.INCOME)?._sum.amount || 0
    );
    const totalExpense = Number(
      totalAggregations.find(t => t.type === TransactionType.EXPENSE)?._sum.amount || 0
    );

    // 3️⃣ CALCULAR BALANCE ASIGNADO EN METAS
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      select: { currentAmount: true }
    });

    const allocatedBalance = goals.reduce(
      (sum, goal) => sum + Number(goal.currentAmount), 
      0
    );

    // 4️⃣ BALANCE DISPONIBLE = Total - Asignado
    const availableBalance = (totalIncome - totalExpense) - allocatedBalance;

    // 5️⃣ BALANCE TOTAL
    const totalBalance = availableBalance + allocatedBalance;

    // 6️⃣ TASA DE AHORRO
    const savingsRate = monthlyIncome > 0 
      ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)
      : 0;

    return {
      availableBalance,
      allocatedBalance,
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      savingsRate
    };
  }

  /**
   * ASIGNAR DINERO DEL BALANCE A UNA META
   * 
   * Flujo:
   * 1. Validar que haya balance disponible
   * 2. Crear transacción de asignación (EXPENSE conceptual)
   * 3. Crear GoalContribution
   * 4. Actualizar goal.currentAmount
   */
  async allocateToGoal(
    userId: string,
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Promise<GoalAllocationResult> {
    return await this.prisma.$transaction(async (tx) => {
      // Validación 1: Obtener estado actual
      const currentState = await this.calculateFinancialState(userId);
      
      if (amount > currentState.availableBalance) {
        return {
          success: false,
          error: `Fondos insuficientes. Disponible: $${currentState.availableBalance.toFixed(2)}` 
        };
      }

      // Validación 2: Meta existe y no está completada
      const goal = await tx.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        return { success: false, error: 'Meta no encontrada' };
      }

      if (goal.status === 'COMPLETED') {
        return { success: false, error: 'Meta ya completada' };
      }

      // Validación 3: No exceder target
      const goalCurrentAmount = Number(goal.currentAmount);
      const goalTargetAmount = Number(goal.targetAmount);
      
      if (goalCurrentAmount + amount > goalTargetAmount) {
        return {
          success: false,
          error: `Excedería el monto objetivo. Máximo restante: $${(goalTargetAmount - goalCurrentAmount).toFixed(2)}`
        };
      }

      // ✅ OPERACIÓN EXITOSA
      
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
          type: TransactionType.EXPENSE,
          amount: new Decimal(amount),
          description: `Asignación a meta: ${goal.name}`,
          notes: note || `Asignación automática a meta ${goal.name}`,
          transactionDate: new Date(),
          metadata: {
            goalId,
            allocationType: 'GOAL_ALLOCATION',
            originalAmount: amount
          },
          tags: ['goal-allocation', goalId]
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
          status: goalCurrentAmount + amount >= goalTargetAmount ? 'COMPLETED' : 'ACTIVE',
          completedAt: goalCurrentAmount + amount >= goalTargetAmount ? new Date() : undefined
        }
      });

      // 5. Calcular nuevo estado
      const newState = await this.calculateFinancialState(userId);

      return {
        success: true,
        newState,
        allocationTransaction,
        updatedGoal
      };
    });
  }

  /**
   * RETROCEDER DINERO DE META AL BALANCE
   * 
   * Flujo inverso: META → BALANCE DISPONIBLE
   */
  async deallocateFromGoal(
    userId: string,
    amount: number,
    goalId: string,
    accountId: string,
    note?: string
  ): Promise<GoalDeallocationResult> {
    return await this.prisma.$transaction(async (tx) => {
      // Validación 1: Meta existe
      const goal = await tx.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        return { success: false, error: 'Meta no encontrada' };
      }

      const goalCurrentAmount = Number(goal.currentAmount);
      
      if (amount > goalCurrentAmount) {
        return {
          success: false,
          error: `No hay suficientes fondos en la meta. Asignado: $${goalCurrentAmount.toFixed(2)}` 
        };
      }

      // ✅ OPERACIÓN
      
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
          type: TransactionType.INCOME,
          amount: new Decimal(amount),
          description: `Retorno de meta: ${goal.name}`,
          notes: note || `Devolución desde meta ${goal.name}`,
          transactionDate: new Date(),
          metadata: {
            goalId,
            allocationType: 'GOAL_DEALLOCATION',
            originalAmount: amount
          },
          tags: ['goal-deallocation', goalId]
        }
      });

      // 3. Crear contribución negativa (o eliminar contribution existente)
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

      // 5. Calcular nuevo estado
      const newState = await this.calculateFinancialState(userId);

      return {
        success: true,
        newState,
        deallocationTransaction,
        updatedGoal
      };
    });
  }

  /**
   * AGREGAR INGRESO REAL
   * Aumenta el totalBalance
   */
  async addIncome(
    userId: string,
    amount: number,
    categoryId: string,
    accountId: string,
    description: string,
    note?: string
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type: TransactionType.INCOME,
        amount: new Decimal(amount),
        description,
        notes: note,
        transactionDate: new Date(),
        isConfirmed: true
      }
    });

    return Transaction.create({
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      type: transaction.type as TransactionType,
      amount: Number(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      tags: transaction.tags,
      metadata: transaction.metadata as Record<string, any>,
      isConfirmed: transaction.isConfirmed,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      isRecurring: transaction.isRecurring
    });
  }

  /**
   * AGREGAR GASTO REAL
   * Disminuye el totalBalance
   */
  async addExpense(
    userId: string,
    amount: number,
    categoryId: string,
    accountId: string,
    description: string,
    note?: string
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type: TransactionType.EXPENSE,
        amount: new Decimal(amount),
        description,
        notes: note,
        transactionDate: new Date(),
        isConfirmed: true
      }
    });

    return Transaction.create({
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      type: transaction.type as TransactionType,
      amount: Number(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      tags: transaction.tags,
      metadata: transaction.metadata as Record<string, any>,
      isConfirmed: transaction.isConfirmed,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      isRecurring: transaction.isRecurring
    });
  }

  /**
   * PROGRESO DE META
   * Calcula qué % de la meta se ha alcanzado
   */
  async getGoalProgress(goalId: string): Promise<{
    percentage: number;
    remaining: number;
    onTrack: boolean;
    daysRemaining: number;
    monthlyNeeded: number;
  }> {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new Error('Meta no encontrada');
    }

    const currentAmount = Number(goal.currentAmount);
    const targetAmount = Number(goal.targetAmount);
    const percentage = Math.round((currentAmount / targetAmount) * 100);
    const remaining = Math.max(0, targetAmount - currentAmount);

    // Calcular tiempo restante
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    let daysRemaining = 0;
    let monthlyNeeded = 0;
    let onTrack = true;

    if (targetDate && remaining > 0) {
      daysRemaining = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const monthsRemaining = Math.ceil(daysRemaining / 30);
      monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
      
      // Si no hay suficiente tiempo para alcanzar la meta con el ahorro actual
      if (daysRemaining <= 0) {
        onTrack = false;
      }
    } else {
      onTrack = remaining === 0;
    }

    return {
      percentage,
      remaining,
      onTrack,
      daysRemaining,
      monthlyNeeded
    };
  }

  /**
   * Obtener balance detallado por cuentas
   */
  async getAccountBalances(userId: string): Promise<{
    accounts: Array<{
      id: string;
      name: string;
      balance: number;
      type: string;
      availableBalance: number;
      allocatedBalance: number;
    }>;
    totalAvailable: number;
    totalAllocated: number;
    totalBalance: number;
  }> {
    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
      include: {
        linkedGoals: {
          select: { currentAmount: true }
        }
      }
    });

    let totalAvailable = 0;
    let totalAllocated = 0;

    const accountsWithBalances = accounts.map(account => {
      const accountBalance = Number(account.balance);
      const allocatedInAccount = account.linkedGoals.reduce(
        (sum, goal) => sum + Number(goal.currentAmount), 
        0
      );
      const availableInAccount = accountBalance - allocatedInAccount;

      totalAvailable += availableInAccount;
      totalAllocated += allocatedInAccount;

      return {
        id: account.id,
        name: account.name,
        balance: accountBalance,
        type: account.type,
        availableBalance: availableInAccount,
        allocatedBalance: allocatedInAccount
      };
    });

    return {
      accounts: accountsWithBalances,
      totalAvailable,
      totalAllocated,
      totalBalance: totalAvailable + totalAllocated
    };
  }
}
