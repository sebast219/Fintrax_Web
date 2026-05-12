export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category_id: string;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionWithDetails extends Transaction {
  id: string;
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
  };
  account: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
  card?: {
    id: string;
    cardName: string;
    lastFour: string;
  };
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  isRecurring: boolean;
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
}

export interface CreateTransactionDto {
  amount: number;
  type: Transaction['type'];
  category_id: string;
  description: string;
  date: string;
  account_id?: string;
  card_id?: string;
  tags?: string[];
  attachments?: File[];
  isRecurring?: boolean;
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionFilters {
  type?: Transaction['type'];
  category_id?: string;
  account_id?: string;
  card_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
  tags?: string[];
  is_recurring?: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  averageTransaction: number;
  topCategories: {
    name: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
}

export interface TransactionStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  averageIncome: number;
  averageExpense: number;
  highestTransaction: {
    amount: number;
    description: string;
    date: string;
  };
  lowestTransaction: {
    amount: number;
    description: string;
    date: string;
  };
  mostFrequentCategory: {
    name: string;
    count: number;
    totalAmount: number;
  };
}
