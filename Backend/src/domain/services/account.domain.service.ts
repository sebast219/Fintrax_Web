import { Account } from '../entities/account.entity';
import { IAccountRepository } from '../repositories/account.repository.interface';

export class AccountDomainService {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async getAccountById(id: string): Promise<Account | null> {
    return this.accountRepository.findById(id);
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  async createAccount(account: Account): Promise<Account> {
    return this.accountRepository.create(account);
  }

  async updateAccount(account: Account): Promise<Account> {
    const existingAccount = await this.accountRepository.findById(account.id);
    if (!existingAccount) {
      throw new Error('Account not found');
    }
    return this.accountRepository.update(account);
  }

  async deleteAccount(id: string): Promise<void> {
    const existingAccount = await this.accountRepository.findById(id);
    if (!existingAccount) {
      throw new Error('Account not found');
    }
    return this.accountRepository.delete(id);
  }

  async updateAccountBalance(accountId: string, newBalance: number): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    const updatedAccount = account.updateBalance(newBalance);
    return this.accountRepository.update(updatedAccount);
  }
}
