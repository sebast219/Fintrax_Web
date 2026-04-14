export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly accountId: string,
    public readonly categoryId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly description: string,
    public readonly transactionDate: Date,
    public readonly tags: string[],
    public readonly metadata: Record<string, any>,
    public readonly isConfirmed: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isRecurring: boolean,
    public readonly cardId?: string,
    public readonly notes?: string,
    public readonly transferAccountId?: string,
    public readonly transferTransactionId?: string,
    public readonly recurringId?: string,
  ) {}

  static create(props: {
    id?: string;
    userId?: string;
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    amount?: number;
    description?: string;
    transactionDate?: Date;
    tags?: string[];
    metadata?: Record<string, any>;
    isConfirmed?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isRecurring?: boolean;
    cardId?: string;
    notes?: string;
    transferAccountId?: string;
    transferTransactionId?: string;
    recurringId?: string;
  }): Transaction {
    return new Transaction(
      props.id!,
      props.userId!,
      props.accountId!,
      props.categoryId!,
      props.type || TransactionType.EXPENSE,
      props.amount || 0,
      props.description || '',
      props.transactionDate || new Date(),
      props.tags || [],
      props.metadata || {},
      props.isConfirmed ?? true,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.isRecurring ?? false,
      props.cardId,
      props.notes,
      props.transferAccountId,
      props.transferTransactionId,
      props.recurringId,
    );
  }

  update(data: Partial<Pick<Transaction, 'description' | 'notes' | 'categoryId' | 'tags' | 'metadata' | 'isConfirmed' | 'transactionDate'>>): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.accountId,
      data.categoryId ?? this.categoryId,
      this.type,
      this.amount,
      data.description ?? this.description,
      data.transactionDate ?? this.transactionDate,
      data.tags ?? this.tags,
      data.metadata ?? this.metadata,
      data.isConfirmed ?? this.isConfirmed,
      this.createdAt,
      new Date(),
      this.isRecurring,
      this.cardId,
      data.notes,
      this.transferAccountId,
      this.transferTransactionId,
      this.recurringId,
    );
  }

  markAsConfirmed(): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.accountId,
      this.categoryId,
      this.type,
      this.amount,
      this.description,
      this.transactionDate,
      this.tags,
      this.metadata,
      true,
      this.createdAt,
      new Date(),
      this.isRecurring,
      this.cardId,
      this.notes,
      this.transferAccountId,
      this.transferTransactionId,
      this.recurringId,
    );
  }

  addTag(tag: string): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.accountId,
      this.categoryId,
      this.type,
      this.amount,
      this.description,
      this.transactionDate,
      [...this.tags, tag],
      this.metadata,
      this.isConfirmed,
      this.createdAt,
      new Date(),
      this.isRecurring,
      this.cardId,
      this.notes,
      this.transferAccountId,
      this.transferTransactionId,
      this.recurringId,
    );
  }

  removeTag(tag: string): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.accountId,
      this.categoryId,
      this.type,
      this.amount,
      this.description,
      this.transactionDate,
      this.tags.filter(t => t !== tag),
      this.metadata,
      this.isConfirmed,
      this.createdAt,
      new Date(),
      this.isRecurring,
      this.cardId,
      this.notes,
      this.transferAccountId,
      this.transferTransactionId,
      this.recurringId,
    );
  }
}
