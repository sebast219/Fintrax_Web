import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  DashboardSummary, 
  TransactionSummary, 
  CategoryExpense, 
  Goal,
  QuickAction,
  CategorySpending,
  SpendingChartData,
  SpendingChartWidgetData,
  GoalProgress,
  GoalsData,
  QuickActionWidget
} from '../../core/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // ============================================
  // ✅ MOCK DATA COMPLETO
  // ============================================

  private readonly MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
    totalBalance: 50000000,
    monthlyIncome: 15000000,
    monthlyExpense: 8000000,
    savingsRate: 46.67,
    averageDailySpending: 266667,
    budgetUtilization: 80,
    totalTransactions: 45,
    activeGoals: 4,
    completedGoals: 1
  };

  private readonly MOCK_TRANSACTIONS: TransactionSummary[] = [
    {
      id: '1',
      description: 'Supermercado Éxito',
      amount: 250000,
      type: 'expense',
      category: {
        id: 'cat-1',
        name: 'Comida',
        icon: '🍔',
        color: '#FF6B6B'
      },
      date: new Date('2024-05-11T14:30:00').toISOString(),
      createdAt: new Date('2024-05-11T14:30:00'),
      updatedAt: new Date('2024-05-11T14:30:00')
    },
    {
      id: '2',
      description: 'Salario Mensual',
      amount: 15000000,
      type: 'income',
      category: {
        id: 'cat-2',
        name: 'Salario',
        icon: '💰',
        color: '#10B981'
      },
      date: new Date('2024-05-01T09:00:00').toISOString(),
      createdAt: new Date('2024-05-01T09:00:00'),
      updatedAt: new Date('2024-05-01T09:00:00')
    },
    {
      id: '3',
      description: 'Uber',
      amount: 35000,
      type: 'expense',
      category: {
        id: 'cat-3',
        name: 'Transporte',
        icon: '🚗',
        color: '#3B82F6'
      },
      date: new Date('2024-05-12T08:15:00').toISOString(),
      createdAt: new Date('2024-05-12T08:15:00'),
      updatedAt: new Date('2024-05-12T08:15:00')
    },
    {
      id: '4',
      description: 'Netflix',
      amount: 16900,
      type: 'expense',
      category: {
        id: 'cat-4',
        name: 'Entretenimiento',
        icon: '🎮',
        color: '#8B5CF6'
      },
      date: new Date('2024-05-10T12:00:00').toISOString(),
      createdAt: new Date('2024-05-10T12:00:00'),
      updatedAt: new Date('2024-05-10T12:00:00')
    },
    {
      id: '5',
      description: 'Freelance Project',
      amount: 2500000,
      type: 'income',
      category: {
        id: 'cat-5',
        name: 'Freelance',
        icon: '💻',
        color: '#F59E0B'
      },
      date: new Date('2024-05-08T16:00:00').toISOString(),
      createdAt: new Date('2024-05-08T16:00:00'),
      updatedAt: new Date('2024-05-08T16:00:00')
    },
    {
      id: '6',
      description: 'Restaurante Corrientazo',
      amount: 45000,
      type: 'expense',
      category: {
        id: 'cat-1',
        name: 'Comida',
        icon: '🍔',
        color: '#FF6B6B'
      },
      date: new Date('2024-05-09T13:00:00').toISOString(),
      createdAt: new Date('2024-05-09T13:00:00'),
      updatedAt: new Date('2024-05-09T13:00:00')
    },
    {
      id: '7',
      description: 'Gimnasio',
      amount: 120000,
      type: 'expense',
      category: {
        id: 'cat-6',
        name: 'Salud',
        icon: '🏥',
        color: '#EC4899'
      },
      date: new Date('2024-05-05T10:00:00').toISOString(),
      createdAt: new Date('2024-05-05T10:00:00'),
      updatedAt: new Date('2024-05-05T10:00:00')
    },
    {
      id: '8',
      description: 'Venta Ropa',
      amount: 450000,
      type: 'income',
      category: {
        id: 'cat-7',
        name: 'Ventas',
        icon: '🛍️',
        color: '#06B6D4'
      },
      date: new Date('2024-05-07T15:30:00').toISOString(),
      createdAt: new Date('2024-05-07T15:30:00'),
      updatedAt: new Date('2024-05-07T15:30:00')
    }
  ];

  private readonly MOCK_SPENDING_BY_CATEGORY: CategoryExpense[] = [
    {
      category: {
        id: 'cat-1',
        name: 'Comida',
        icon: '🍔',
        color: '#FF6B6B'
      },
      amount: 850000,
      percentage: 35.4,
      transactionCount: 15
    },
    {
      category: {
        id: 'cat-3',
        name: 'Transporte',
        icon: '🚗',
        color: '#3B82F6'
      },
      amount: 420000,
      percentage: 17.5,
      transactionCount: 8
    },
    {
      category: {
        id: 'cat-4',
        name: 'Entretenimiento',
        icon: '🎮',
        color: '#8B5CF6'
      },
      amount: 380000,
      percentage: 15.8,
      transactionCount: 5
    },
    {
      category: {
        id: 'cat-6',
        name: 'Salud',
        icon: '🏥',
        color: '#EC4899'
      },
      amount: 350000,
      percentage: 14.6,
      transactionCount: 3
    },
    {
      category: {
        id: 'cat-8',
        name: 'Compras',
        icon: '🛍️',
        color: '#F59E0B'
      },
      amount: 280000,
      percentage: 11.7,
      transactionCount: 4
    },
    {
      category: {
        id: 'cat-9',
        name: 'Servicios',
        icon: '💡',
        color: '#06B6D4'
      },
      amount: 120000,
      percentage: 5.0,
      transactionCount: 2
    }
  ];

  private readonly MOCK_GOALS: Goal[] = [
    {
      id: '1',
      name: 'Fondo de Emergencia',
      target: 10000000,
      current: 7500000,
      category: 'Seguridad',
      deadline: new Date('2024-12-31'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-05-12')
    },
    {
      id: '2',
      name: 'Vacaciones Diciembre',
      target: 5000000,
      current: 2000000,
      category: 'Viajes',
      deadline: new Date('2024-12-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-05-12')
    },
    {
      id: '3',
      name: 'Nuevo Laptop',
      target: 3500000,
      current: 2800000,
      category: 'Tecnología',
      deadline: new Date('2024-06-30'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-05-12')
    },
    {
      id: '4',
      name: 'Curso Inglés',
      target: 2000000,
      current: 1800000,
      category: 'Educación',
      deadline: new Date('2024-08-31'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-05-12')
    },
    {
      id: '5',
      name: 'Regalo Mamá',
      target: 1500000,
      current: 1500000,
      category: 'Familia',
      deadline: new Date('2024-05-15'),
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-05-12')
    }
  ];

  private readonly MOCK_QUICK_ACTIONS: QuickAction[] = [
    {
      id: 'add-transaction',
      label: 'Nueva Transacción',
      icon: '💸',
      action: () => console.log('Navigate to add transaction'),
      route: '/transactions/new'
    },
    {
      id: 'add-card',
      label: 'Nueva Tarjeta',
      icon: '💳',
      action: () => console.log('Navigate to add card'),
      route: '/cards/new'
    },
    {
      id: 'set-goal',
      label: 'Nueva Meta',
      icon: '🎯',
      action: () => console.log('Navigate to set goal'),
      route: '/goals/new'
    },
    {
      id: 'view-reports',
      label: 'Reportes',
      icon: '📊',
      action: () => console.log('Navigate to reports'),
      route: '/reports'
    }
  ];

  // ============================================
  // ✅ MÉTODOS PRINCIPALES
  // ============================================

  /**
   * Obtiene el resumen general del dashboard
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    return of(this.MOCK_DASHBOARD_SUMMARY).pipe(delay(500));
  }

  /**
   * Obtiene las transacciones recientes
   */
  getRecentTransactions(limit: number = 10): Observable<TransactionSummary[]> {
    return of(this.MOCK_TRANSACTIONS.slice(0, limit)).pipe(delay(300));
  }

  /**
   * Obtiene los gastos por categoría
   */
  getSpendingByCategory(): Observable<CategoryExpense[]> {
    return of(this.MOCK_SPENDING_BY_CATEGORY).pipe(delay(400));
  }

  /**
   * Obtiene las metas de ahorro
   */
  getGoals(): Observable<Goal[]> {
    return of(this.MOCK_GOALS).pipe(delay(350));
  }

  /**
   * Obtiene las acciones rápidas
   */
  getQuickActions(): Observable<QuickAction[]> {
    return of(this.MOCK_QUICK_ACTIONS).pipe(delay(200));
  }

  // ============================================
  // ✅ MÉTODOS PARA WIDGETS ESPECÍFICOS
  // ============================================

  /**
   * Datos para BalanceCardWidget
   */
  getBalanceCardData(): Observable<DashboardSummary> {
    return this.getDashboardSummary();
  }

  /**
   * Datos para TransactionsListWidget
   */
  getTransactionsListData(limit: number = 10): Observable<TransactionSummary[]> {
    return this.getRecentTransactions(limit);
  }

  /**
   * Datos para SpendingChartWidget
   */
  getSpendingChartData(period: 'week' | 'month' | 'year' = 'month'): Observable<SpendingChartWidgetData> {
    const categories: CategorySpending[] = this.MOCK_SPENDING_BY_CATEGORY.map((cat, index) => ({
      id: cat.category.id,
      name: cat.category.name,
      icon: cat.category.icon,
      amount: cat.amount,
      percentage: cat.percentage,
      color: cat.category.color,
      trend: 'stable' as const,
      previousAmount: cat.amount * 0.9 // Mock previous amount
    }));

    const data: SpendingChartWidgetData = {
      period,
      categories,
      totalExpense: this.MOCK_SPENDING_BY_CATEGORY.reduce((sum, cat) => sum + cat.amount, 0),
      previousPeriodTotal: this.MOCK_SPENDING_BY_CATEGORY.reduce((sum, cat) => sum + cat.amount, 0) * 0.9,
      timestamp: new Date()
    };

    return of(data).pipe(delay(450));
  }

  /**
   * Datos para GoalsProgressWidget
   */
  getGoalsProgressData(): Observable<GoalsData> {
    const goals: GoalProgress[] = this.MOCK_GOALS.map(goal => {
      const targetAmount = goal.targetAmount || goal.target;
      const currentAmount = goal.currentAmount || goal.current;
      const percentage = (currentAmount / targetAmount) * 100;
      const deadline = goal.deadline || new Date('2024-12-31');
      const daysRemaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon || '🎯',
        targetAmount,
        currentAmount,
        percentage,
        deadline,
        daysRemaining,
        category: goal.category,
        color: this.getGoalColor(percentage)
      };
    });

    const data: GoalsData = {
      goals,
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.percentage >= 100).length,
      totalSaved: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0)
    };

    return of(data).pipe(delay(400));
  }

  /**
   * Datos para QuickActionsWidget
   */
  getQuickActionsData(): Observable<{ actions: QuickActionWidget[] }> {
    const actions: QuickActionWidget[] = this.MOCK_QUICK_ACTIONS.map(action => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      description: `Acción rápida: ${action.label}`,
      color: this.getActionColor(action.id),
      bgColor: this.getActionBgColor(action.id),
      action: action.id,
      route: action.route
    }));

    return of({ actions }).pipe(delay(250));
  }

  // ============================================
  // ✅ UTILIDADES
  // ============================================

  /**
   * Obtiene el icono para una categoría
   */
  private getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Comida': '🍔',
      'Transporte': '🚗',
      'Entretenimiento': '🎮',
      'Salud': '🏥',
      'Compras': '🛍️',
      'Servicios': '💡'
    };
    return icons[category] || '📊';
  }

  /**
   * Obtiene el color para una categoría
   */
  private getCategoryColor(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
    return colors[index % colors.length];
  }

  /**
   * Obtiene el color para una meta según su progreso
   */
  private getGoalColor(percentage: number): string {
    if (percentage >= 100) return '#10B981';
    if (percentage >= 75) return '#3B82F6';
    if (percentage >= 50) return '#F59E0B';
    if (percentage >= 25) return '#F97316';
    return '#EF4444';
  }

  /**
   * Obtiene el color para una acción
   */
  private getActionColor(actionId: string): string {
    const colors: { [key: string]: string } = {
      'add-transaction': 'text-blue-600',
      'add-card': 'text-green-600',
      'set-goal': 'text-purple-600',
      'view-reports': 'text-orange-600'
    };
    return colors[actionId] || 'text-gray-600';
  }

  /**
   * Obtiene el background color para una acción
   */
  private getActionBgColor(actionId: string): string {
    const colors: { [key: string]: string } = {
      'add-transaction': 'bg-blue-50 hover:bg-blue-100',
      'add-card': 'bg-green-50 hover:bg-green-100',
      'set-goal': 'bg-purple-50 hover:bg-purple-100',
      'view-reports': 'bg-orange-50 hover:bg-orange-100'
    };
    return colors[actionId] || 'bg-gray-50 hover:bg-gray-100';
  }

  /**
   * Obtiene la ruta para una acción
   */
  private getActionRoute(actionId: string): string {
    const routes: { [key: string]: string } = {
      'add-transaction': '/transactions/new',
      'add-card': '/cards/new',
      'set-goal': '/goals/new',
      'view-reports': '/reports'
    };
    return routes[actionId] || '/';
  }

  // ============================================
  // ✅ MÉTODO COMPLETO (TODO EN UNO)
  // ============================================

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  getCompleteDashboardData(): Observable<{
    summary: DashboardSummary;
    transactions: TransactionSummary[];
    spending: CategoryExpense[];
    goals: Goal[];
    quickActions: QuickAction[];
  }> {
    const data = {
      summary: this.MOCK_DASHBOARD_SUMMARY,
      transactions: this.MOCK_TRANSACTIONS,
      spending: this.MOCK_SPENDING_BY_CATEGORY,
      goals: this.MOCK_GOALS,
      quickActions: this.MOCK_QUICK_ACTIONS
    };

    return of(data).pipe(delay(800));
  }
}
