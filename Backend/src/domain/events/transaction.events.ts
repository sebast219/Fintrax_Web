import { DomainEvent } from './domain.event';
import { Transaction } from '../entities/transaction.entity';

export class TransactionCreatedEvent extends DomainEvent {
  constructor(public readonly transaction: Transaction) {
    super(`transaction-created-${transaction.id}`);
  }

  getEventName(): string {
    return 'TransactionCreated';
  }
}

export class TransactionUpdatedEvent extends DomainEvent {
  constructor(public readonly transaction: Transaction) {
    super(`transaction-updated-${transaction.id}`);
  }

  getEventName(): string {
    return 'TransactionUpdated';
  }
}

export class TransactionDeletedEvent extends DomainEvent {
  constructor(public readonly transactionId: string) {
    super(`transaction-deleted-${transactionId}`);
  }

  getEventName(): string {
    return 'TransactionDeleted';
  }
}

export class TransactionConfirmedEvent extends DomainEvent {
  constructor(public readonly transaction: Transaction) {
    super(`transaction-confirmed-${transaction.id}`);
  }

  getEventName(): string {
    return 'TransactionConfirmed';
  }
}
