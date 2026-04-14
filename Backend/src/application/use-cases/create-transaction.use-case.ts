import { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import { TransactionDomainService } from '../../domain/services/transaction.domain.service';
import { TransactionCreatedEvent } from '../../domain/events/transaction.events';

export interface CreateTransactionRequest {
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate?: Date;
  cardId?: string;
  notes?: string;
  transferAccountId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  event: TransactionCreatedEvent;
}

export class CreateTransactionUseCase {
  constructor(private readonly transactionDomainService: TransactionDomainService) {}

  async execute(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    const transaction = Transaction.create({
      userId: request.userId,
      accountId: request.accountId,
      categoryId: request.categoryId,
      type: request.type,
      amount: request.amount,
      description: request.description,
      transactionDate: request.transactionDate,
      cardId: request.cardId,
      notes: request.notes,
      transferAccountId: request.transferAccountId,
      tags: request.tags,
      metadata: request.metadata,
    });

    const createdTransaction = await this.transactionDomainService.createTransaction(transaction);
    const event = new TransactionCreatedEvent(createdTransaction);

    return {
      transaction: createdTransaction,
      event,
    };
  }
}
