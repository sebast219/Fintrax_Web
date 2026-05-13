export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  averageDailySpending: number;
  budgetUtilization: number;
  totalTransactions: number;
  activeGoals: number;
  completedGoals: number;
}

export interface TransactionSummary {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryExpense {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  netAmount: number;
  year: number;
  monthNumber: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'balance' | 'transactions' | 'chart' | 'goals' | 'actions';
  data: any;
  isLoading: boolean;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DashboardKPIs {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  averageDailySpending: number;
  budgetUtilization: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    tension?: number;
  }[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  route?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  targetAmount?: number; // For compatibility with GoalProgress
  currentAmount?: number; // For compatibility with GoalProgress
  icon?: string;
  category: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  category: string;
  label: string;
  spent: number;
  total: number;
  color: string;
  percentage: number;
}

// ============================================
// ✅ TIPOS FALTANTES PARA WIDGETS
// ============================================

export interface CategorySpending {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  previousAmount: number;
}

export interface SpendingChartData {
  period: 'week' | 'month' | 'year';
  categories: CategorySpending[];
  totalExpense: number;
  previousPeriodTotal?: number;
  timestamp: Date;
}

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

export interface QuickActionWidget {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  action: string;
  route?: string;
}

export interface SpendingChartWidgetData {
  period: 'week' | 'month' | 'year';
  categories: CategorySpending[];
  totalExpense: number;
  previousPeriodTotal?: number;
  timestamp: Date;
}

// Actualizar Goal con propiedades faltantes
export interface GoalExtended extends Goal {
  icon: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
}
