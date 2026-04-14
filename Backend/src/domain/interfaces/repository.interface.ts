export interface IRepository<T, ID> {
  create(entity: Partial<T>): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(filters?: Partial<T>): Promise<T[]>;
  update(id: ID, entity: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

export interface IUserRepository extends IRepository<User, string> {
  findByEmail(email: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
}

export interface IAccountRepository extends IRepository<Account, string> {
  findByUserId(userId: string): Promise<Account[]>;
  updateBalance(id: string, balance: number): Promise<void>;
}

export interface ITransactionRepository extends IRepository<Transaction, string> {
  findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  updateAccountBalance(accountId: string, amount: number, type: string): Promise<void>;
}

export interface ICategoryRepository extends IRepository<Category, string> {
  findByUserId(userId: string): Promise<Category[]>;
  findDefaultCategories(): Promise<Category[]>;
}

export interface ICardRepository extends IRepository<Card, string> {
  findByUserId(userId: string): Promise<Card[]>;
  updateBalance(id: string, balance: number): Promise<void>;
}

export interface IBudgetRepository extends IRepository<Budget, string> {
  findByUserIdAndPeriod(userId: string, year: number, month: number): Promise<Budget[]>;
}

export interface IGoalRepository extends IRepository<Goal, string> {
  findByUserId(userId: string): Promise<Goal[]>;
  updateProgress(id: string, amount: number): Promise<void>;
}

// Domain entities
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  currency: string;
  locale: string;
  timezone: string;
  preferences: Record<string, any>;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  initialBalance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  cardId?: string;
  type: string;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: Date;
  transferAccountId?: string;
  transferTransactionId?: string;
  isRecurring: boolean;
  recurringId?: string;
  tags: string[];
  metadata: Record<string, any>;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  parentId?: string;
  budgetAmount?: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  userId: string;
  accountId?: string;
  cardName: string;
  cardType: string;
  network: string;
  lastFour: string;
  creditLimit?: number;
  currentBalance: number;
  billingDay?: number;
  paymentDueDay?: number;
  interestRate?: number;
  color: string;
  isActive: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  alertThreshold: number;
  alertSent: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: Date;
  startedAt: Date;
  completedAt?: Date;
  status: string;
  linkedAccountId?: string;
  autoSaveAmount?: number;
  autoSaveFrequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilters {
  type?: string;
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
