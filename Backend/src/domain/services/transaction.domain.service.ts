import { Transaction, TransactionType } from '../entities/transaction.entity';
import { ITransactionRepository, TransactionFilters } from '../repositories/transaction.repository.interface';
import { IAccountRepository } from '../repositories/account.repository.interface';

export class TransactionDomainService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository
  ) {}

  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  async getTransactionsByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(userId, filters);
  }

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    // Validate account ownership
    const account = await this.accountRepository.findById(transaction.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // For transfer transactions, validate destination account
    if (transaction.type === TransactionType.TRANSFER && transaction.transferAccountId) {
      const destAccount = await this.accountRepository.findById(transaction.transferAccountId);
      if (!destAccount) {
        throw new Error('Destination account not found');
      }
    }

    return this.transactionRepository.create(transaction);
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    const existingTransaction = await this.transactionRepository.findById(transaction.id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }
    return this.transactionRepository.update(transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    const existingTransaction = await this.transactionRepository.findById(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }
    return this.transactionRepository.delete(id);
  }

  async confirmTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    const confirmedTransaction = transaction.markAsConfirmed();
    return this.transactionRepository.update(confirmedTransaction);
  }

  async addTransactionTag(id: string, tag: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    const updatedTransaction = transaction.addTag(tag);
    return this.transactionRepository.update(updatedTransaction);
  }

  async removeTransactionTag(id: string, tag: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    const updatedTransaction = transaction.removeTag(tag);
    return this.transactionRepository.update(updatedTransaction);
  }
}
