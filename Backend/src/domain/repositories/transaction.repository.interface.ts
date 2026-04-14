import { Transaction, TransactionType } from '../entities/transaction.entity';

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  search?: string;
  tags?: string[];
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Transaction[]>;
}
