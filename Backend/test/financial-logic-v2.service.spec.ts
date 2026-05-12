import { Test, TestingModule } from '@nestjs/testing';
import { FinancialLogicV2Service } from '../src/domain/services/financial-logic-v2.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionStatus, GoalStatus, AlertType, AllocationErrorType } from '../src/domain/enums/financial.enums';
import { FinancialStateDetailed, AllocationResult } from '../src/domain/interfaces/financial-state.interface';

describe('FinancialLogicV2Service', () => {
  let service: FinancialLogicV2Service;
  let prisma: PrismaService;

  const mockPrisma = {
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    goal: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    goalContribution: {
      create: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialLogicV2Service,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<FinancialLogicV2Service>(FinancialLogicV2Service);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFinancialStateDetailed', () => {
    it('debería calcular correctamente balance confirmado vs esperado', async () => {
      const userId = 'user-123';
      const mockTransactions = [
        {
          id: '1',
          type: 'INCOME',
          amount: 1000,
          status: 'COMPLETED',
          transactionDate: new Date(),
          metadata: {},
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'INCOME',
          amount: 500,
          status: 'PENDING',
          transactionDate: new Date(),
          metadata: {},
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'EXPENSE',
          amount: 100,
          status: 'COMPLETED',
          transactionDate: new Date(),
          metadata: {},
          createdAt: new Date()
        }
      ];

      const mockGoals = [
        { currentAmount: 300, targetAmount: 1000 },
        { currentAmount: 200, targetAmount: 500 }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.goal.findMany.mockResolvedValue(mockGoals);

      const result = await service.calculateFinancialStateDetailed(userId);

      expect(result.confirmedBalance.totalBalance).toBe(900); // 1000 - 100
      expect(result.expectedBalance.totalBalance).toBe(1400); // 1000 + 500 - 100
      expect(result.alerts.pendingTransactions).toBe(1);
      expect(result.confirmedBalance.allocatedBalance).toBe(500); // 300 + 200
      expect(result.confirmedBalance.availableBalance).toBe(400); // 900 - 500
    });

    it('debería detectar balance negativo y generar alerta', async () => {
      const userId = 'user-123';
      const mockTransactions = [
        {
          id: '1',
          type: 'INCOME',
          amount: 100,
          status: 'COMPLETED',
          transactionDate: new Date(),
          metadata: {},
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'EXPENSE',
          amount: 300,
          status: 'COMPLETED',
          transactionDate: new Date(),
          metadata: {},
          createdAt: new Date()
        }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.goal.findMany.mockResolvedValue([]);

      const result = await service.calculateFinancialStateDetailed(userId);

      expect(result.confirmedBalance.totalBalance).toBe(-200);
      expect(result.alerts.isNegativeBalance).toBe(true);
      expect(result.alerts.types).toContain(AlertType.NEGATIVE_BALANCE);
    });

    it('debería calcular tasa de ahorro correctamente', async () => {
      const userId = 'user-123';
      const now = new Date();
      const mockTransactions = [
        {
          id: '1',
          type: 'INCOME',
          amount: 2000,
          status: 'COMPLETED',
          transactionDate: now,
          metadata: {},
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'EXPENSE',
          amount: 500,
          status: 'COMPLETED',
          transactionDate: now,
          metadata: {},
          createdAt: new Date()
        }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.goal.findMany.mockResolvedValue([]);

      const result = await service.calculateFinancialStateDetailed(userId);

      expect(result.savingsRate.confirmed).toBe(75); // (2000 - 500) / 2000 * 100
      expect(result.monthlyIncome.confirmed).toBe(2000);
      expect(result.monthlyExpense.confirmed).toBe(500);
    });
  });

  describe('allocateToGoal', () => {
    const userId = 'user-123';
    const accountId = 'account-123';

    it('debería asignar correctamente si hay fondos suficientes', async () => {
      const amount = 300;
      const goalId = 'goal-123';
      
      const mockGoal = {
        id: goalId,
        name: 'Test Goal',
        currentAmount: 0,
        targetAmount: 500,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockState = {
        confirmedBalance: { availableBalance: 1000 }
      } as FinancialStateDetailed;

      const mockCategory = {
        id: 'cat-123',
        name: 'GOAL_ALLOCATION'
      };

      const mockTransaction = {
        id: 'tx-123',
        amount: 300,
        description: 'Asignación a meta: Test Goal'
      };

      const mockContribution = {
        id: 'contrib-123',
        amount: 300
      };

      const mockUpdatedGoal = {
        ...mockGoal,
        currentAmount: 300,
        status: 'ACTIVE'
      };

      const mockNewState = {
        confirmedBalance: { availableBalance: 700 }
      } as FinancialStateDetailed;

      // Mocks
      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);
      mockPrisma.goalContribution.create.mockResolvedValue(mockContribution);
      mockPrisma.goal.update.mockResolvedValue(mockUpdatedGoal);
      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockNewState);
      jest.spyOn(service as any, 'enrichGoalWithState').mockResolvedValue({
        ...mockUpdatedGoal,
        status: GoalStatus.ACTIVE,
        progress: { percentage: 60, remaining: 200 },
        timeline: { daysRemaining: 30, monthlyVelocity: 10, isOnTrack: true },
        alerts: []
      });

      const result = await service.allocateToGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(true);
      expect(result.data?.goal.currentAmount).toBe(300);
      expect(mockPrisma.goal.update).toHaveBeenCalledWith({
        where: { id: goalId },
        data: {
          currentAmount: { increment: expect.any(Object) }, // Decimal object
          status: 'ACTIVE',
          completedAt: undefined
        }
      });
    });

    it('debería rechazar si no hay fondos suficientes', async () => {
      const amount = 1500;
      const goalId = 'goal-123';
      
      const mockState = {
        confirmedBalance: { availableBalance: 1000 }
      } as FinancialStateDetailed;

      const mockGoal = {
        id: goalId,
        name: 'Test Goal',
        currentAmount: 0,
        targetAmount: 2000
      };

      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);

      const result = await service.allocateToGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.type).toBe(AllocationErrorType.INSUFFICIENT_FUNDS);
      expect(result.error).toContain('Fondos insuficientes');
    });

    it('debería rechazar si el monto es inválido', async () => {
      const amount = -100;
      const goalId = 'goal-123';

      const result = await service.allocateToGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.type).toBe(AllocationErrorType.INVALID_AMOUNT);
      expect(result.error).toBe('El monto debe ser mayor a $0');
    });

    it('debería rechazar si la meta no existe', async () => {
      const amount = 300;
      const goalId = 'nonexistent-goal';
      
      const mockState = {
        confirmedBalance: { availableBalance: 1000 }
      } as FinancialStateDetailed;

      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);
      mockPrisma.goal.findFirst.mockResolvedValue(null);

      const result = await service.allocateToGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.type).toBe(AllocationErrorType.GOAL_NOT_FOUND);
      expect(result.error).toBe('Meta no encontrada');
    });

    it('debería rechazar si la meta ya está completada', async () => {
      const amount = 100;
      const goalId = 'goal-123';
      
      const mockState = {
        confirmedBalance: { availableBalance: 1000 }
      } as FinancialStateDetailed;

      const mockGoal = {
        id: goalId,
        name: 'Test Goal',
        currentAmount: 500,
        targetAmount: 500,
        status: 'COMPLETED'
      };

      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);

      const result = await service.allocateToGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.type).toBe(AllocationErrorType.GOAL_COMPLETED);
      expect(result.error).toBe('La meta ya fue completada');
    });

    it('debería rechazar si excede el target', async () => {
      const amount = 600;
      const goalId = 'goal-123';
      
      const mockState = {
        confirmedBalance: { availableBalance: 1000 }
      } as FinancialStateDetailed;

      const mockGoal = {
        id: goalId,
        name: 'Test Goal',
        currentAmount: 100,
        targetAmount: 500
      };

      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);

      const result = await service.allocateToGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.type).toBe(AllocationErrorType.EXCEEDS_TARGET);
      expect(result.error).toContain('Excedería el objetivo');
    });
  });

  describe('deallocateFromGoal', () => {
    const userId = 'user-123';
    const accountId = 'account-123';

    it('debería retirar fondos correctamente', async () => {
      const amount = 200;
      const goalId = 'goal-123';
      
      const mockGoal = {
        id: goalId,
        name: 'Test Goal',
        currentAmount: 500,
        targetAmount: 1000,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockCategory = {
        id: 'cat-123',
        name: 'GOAL_DEALLOCATION'
      };

      const mockTransaction = {
        id: 'tx-123',
        amount: 200,
        description: 'Retorno de meta: Test Goal'
      };

      const mockContribution = {
        id: 'contrib-123',
        amount: -200
      };

      const mockUpdatedGoal = {
        ...mockGoal,
        currentAmount: 300,
        status: 'ACTIVE'
      };

      const mockNewState = {
        confirmedBalance: { availableBalance: 1200 }
      } as FinancialStateDetailed;

      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);
      mockPrisma.goalContribution.create.mockResolvedValue(mockContribution);
      mockPrisma.goal.update.mockResolvedValue(mockUpdatedGoal);
      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockNewState);
      jest.spyOn(service as any, 'enrichGoalWithState').mockResolvedValue({
        ...mockUpdatedGoal,
        status: GoalStatus.ACTIVE,
        progress: { percentage: 30, remaining: 700 },
        timeline: { daysRemaining: 60, monthlyVelocity: 15, isOnTrack: true },
        alerts: []
      });

      const result = await service.deallocateFromGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(true);
      expect(result.data?.goal.currentAmount).toBe(300);
      expect(mockPrisma.goal.update).toHaveBeenCalledWith({
        where: { id: goalId },
        data: {
          currentAmount: { decrement: expect.any(Object) }, // Decimal object
          status: undefined, // Goal was COMPLETED, so status becomes undefined
          completedAt: undefined
        }
      });
    });

    it('debería rechazar si no hay suficientes fondos en la meta', async () => {
      const amount = 600;
      const goalId = 'goal-123';
      
      const mockGoal = {
        id: goalId,
        name: 'Test Goal',
        currentAmount: 500,
        targetAmount: 1000
      };

      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);

      const result = await service.deallocateFromGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No hay suficientes fondos');
    });

    it('debería rechazar si la meta no existe', async () => {
      const amount = 200;
      const goalId = 'nonexistent-goal';

      mockPrisma.goal.findFirst.mockResolvedValue(null);

      const result = await service.deallocateFromGoal(userId, amount, goalId, accountId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Meta no encontrada');
    });
  });

  describe('generateRecommendations', () => {
    it('debería generar recomendación para tasa de ahorro baja', async () => {
      const userId = 'user-123';
      
      const mockState = {
        savingsRate: { confirmed: 5 },
        alerts: { isNegativeBalance: false, pendingTransactions: 0 },
        confirmedBalance: { totalBalance: 1000 }
      } as FinancialStateDetailed;

      mockPrisma.goal.findMany.mockResolvedValue([]);
      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);

      const recommendations = await service.generateRecommendations(userId);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe(AlertType.LOW_SAVINGS_RATE);
      expect(recommendations[0].severity).toBe('HIGH');
      expect(recommendations[0].title).toBe('Tasa de ahorro muy baja');
    });

    it('debería generar recomendación para balance negativo', async () => {
      const userId = 'user-123';
      
      const mockState = {
        savingsRate: { confirmed: 20 },
        alerts: { isNegativeBalance: true, pendingTransactions: 0 },
        confirmedBalance: { totalBalance: -200 }
      } as FinancialStateDetailed;

      mockPrisma.goal.findMany.mockResolvedValue([]);
      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);

      const recommendations = await service.generateRecommendations(userId);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe(AlertType.NEGATIVE_BALANCE);
      expect(recommendations[0].severity).toBe('CRITICAL');
      expect(recommendations[0].title).toBe('Balance negativo');
    });

    it('debería generar recomendación para tasa de ahorro excelente', async () => {
      const userId = 'user-123';
      
      const mockState = {
        savingsRate: { confirmed: 35 },
        alerts: { isNegativeBalance: false, pendingTransactions: 0 },
        confirmedBalance: { totalBalance: 5000 }
      } as FinancialStateDetailed;

      mockPrisma.goal.findMany.mockResolvedValue([]);
      jest.spyOn(service, 'calculateFinancialStateDetailed').mockResolvedValue(mockState);

      const recommendations = await service.generateRecommendations(userId);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe(AlertType.LOW_SAVINGS_RATE);
      expect(recommendations[0].severity).toBe('LOW');
      expect(recommendations[0].title).toBe('¡Excelente tasa de ahorro!');
    });
  });

  describe('getTransactionMetrics', () => {
    it('debería calcular métricas correctamente', async () => {
      const userId = 'user-123';
      
      const mockTransactions = [
        { type: 'INCOME', amount: 1000, status: 'COMPLETED', transactionDate: new Date() },
        { type: 'INCOME', amount: 500, status: 'PENDING', transactionDate: new Date() },
        { type: 'EXPENSE', amount: 200, status: 'COMPLETED', transactionDate: new Date() },
        { type: 'EXPENSE', amount: 100, status: 'PENDING', transactionDate: new Date() }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const metrics = await service.getTransactionMetrics(userId);

      expect(metrics.total).toBe(4);
      expect(metrics.completed).toBe(2);
      expect(metrics.pending).toBe(2);
      expect(metrics.byType.income.total).toBe(2);
      expect(metrics.byType.income.completed).toBe(1);
      expect(metrics.byType.income.pending).toBe(1);
      expect(metrics.byType.expense.total).toBe(2);
      expect(metrics.byType.expense.completed).toBe(1);
      expect(metrics.byType.expense.pending).toBe(1);
    });
  });
});
