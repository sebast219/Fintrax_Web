export interface Card {
  id: string;
  name: string;
  type: 'CREDIT' | 'DEBIT' | 'PREPAID';
  lastFour: string;
  balance: number;
  creditLimit?: number;
  availableCredit?: number;
  bankName: string;
  color: string;
  icon: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardDto {
  name: string;
  type: Card['type'];
  lastFour: string;
  bankName: string;
  color: string;
  icon: string;
  creditLimit?: number;
  initialBalance?: number;
}

export interface UpdateCardDto extends Partial<CreateCardDto> {
  isActive?: boolean;
}

export interface CardTransaction {
  id: string;
  cardId: string;
  amount: number;
  description: string;
  merchant: string;
  category: string;
  date: string;
  type: 'PURCHASE' | 'REFUND' | 'PAYMENT' | 'CASH_ADVANCE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface CardSpending {
  cardId: string;
  cardName: string;
  totalSpent: number;
  transactions: number;
  averageTransaction: number;
  topCategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  period: string;
}

export interface CardStats {
  totalCards: number;
  activeCards: number;
  totalBalance: number;
  totalCreditLimit: number;
  totalDebt: number;
  averageUtilization: number;
  monthlySpending: number;
  topSpendingCategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

export interface CardLimit {
  cardId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  utilization: number;
  warningThreshold: number;
  lastUpdated: string;
}
