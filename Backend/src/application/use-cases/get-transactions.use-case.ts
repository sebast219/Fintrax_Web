import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionDomainService } from '../../domain/services/transaction.domain.service';
import { TransactionFilters } from '../../domain/repositories/transaction.repository.interface';

export interface GetTransactionsRequest {
  userId: string;
  filters?: TransactionFilters;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
}

export class GetTransactionsUseCase {
  constructor(private readonly transactionDomainService: TransactionDomainService) {}

  async execute(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
    const transactions = await this.transactionDomainService.getTransactionsByUserId(
      request.userId,
      request.filters
    );

    return {
      transactions,
    };
  }
}
