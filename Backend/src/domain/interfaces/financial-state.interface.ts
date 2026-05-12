import { TransactionStatus, GoalStatus, AlertType, AllocationErrorType } from '../enums/financial.enums';

export interface FinancialStateDetailed {
  // BALANCES CONFIRMADOS
  confirmedBalance: {
    totalBalance: number;
    availableBalance: number;
    allocatedBalance: number;
  };
  
  // BALANCES ESPERADOS (incluye pendientes)
  expectedBalance: {
    totalBalance: number;
    availableBalance: number;
    allocatedBalance: number;
  };
  
  // MÉTRICAS
  monthlyIncome: {
    confirmed: number;
    pending: number;
    expected: number;
  };
  
  monthlyExpense: {
    confirmed: number;
    pending: number;
    expected: number;
  };
  
  // ALERTAS
  alerts: {
    isNegativeBalance: boolean;
    pendingTransactions: number;
    failedTransactions: number;
    types: AlertType[];
  };
  
  // TASA DE AHORRO
  savingsRate: {
    confirmed: number;
    expected: number;
  };
  
  // METADATOS
  calculatedAt: Date;
  userId: string;
}

export interface GoalStateDetailed {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceType: 'FROM_BALANCE' | 'FROM_SAVINGS' | 'INCREMENTAL';
  allocatedTransactions: string[];
  
  // Estado enriquecido
  status: GoalStatus;
  progress: {
    percentage: number;
    remaining: number;
  };
  timeline: {
    daysRemaining: number;
    monthlyVelocity: number;
    isOnTrack: boolean;
  };
  alerts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AllocationResult {
  success: boolean;
  data?: {
    goal: GoalStateDetailed;
    newState: FinancialStateDetailed;
    transaction: any;
  };
  error?: string;
  type?: AllocationErrorType;
}

export interface DeallocationResult {
  success: boolean;
  data?: {
    goal: GoalStateDetailed;
    newState: FinancialStateDetailed;
    transaction: any;
  };
  error?: string;
  type?: AllocationErrorType;
}

export interface FinancialRecommendation {
  type: AlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  action?: string;
  icon?: string;
}

export interface TransactionMetrics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  byType: {
    income: {
      total: number;
      completed: number;
      pending: number;
      failed: number;
    };
    expense: {
      total: number;
      completed: number;
      pending: number;
      failed: number;
    };
  };
  byMonth: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}
