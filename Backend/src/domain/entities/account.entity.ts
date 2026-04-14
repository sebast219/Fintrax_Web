export enum AccountType {
  CASH = 'CASH',
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  INVESTMENT = 'INVESTMENT',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly balance: number,
    public readonly initialBalance: number,
    public readonly currency: string,
    public readonly color: string,
    public readonly icon: string,
    public readonly isActive: boolean,
    public readonly isArchived: boolean,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: Partial<Account>): Account {
    return new Account(
      props.id!,
      props.userId!,
      props.name!,
      props.type || AccountType.CHECKING,
      props.balance || 0,
      props.initialBalance || 0,
      props.currency || 'USD',
      props.color || '#3B82F6',
      props.icon || 'wallet',
      props.isActive ?? true,
      props.isArchived ?? false,
      props.sortOrder || 0,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  updateBalance(newBalance: number): Account {
    return new Account(
      this.id,
      this.userId,
      this.name,
      this.type,
      newBalance,
      this.initialBalance,
      this.currency,
      this.color,
      this.icon,
      this.isActive,
      this.isArchived,
      this.sortOrder,
      this.createdAt,
      new Date(),
    );
  }

  archive(): Account {
    return new Account(
      this.id,
      this.userId,
      this.name,
      this.type,
      this.balance,
      this.initialBalance,
      this.currency,
      this.color,
      this.icon,
      false,
      true,
      this.sortOrder,
      this.createdAt,
      new Date(),
    );
  }

  update(data: Partial<Pick<Account, 'name' | 'color' | 'icon' | 'sortOrder'>>): Account {
    return new Account(
      this.id,
      this.userId,
      data.name ?? this.name,
      this.type,
      this.balance,
      this.initialBalance,
      this.currency,
      data.color ?? this.color,
      data.icon ?? this.icon,
      this.isActive,
      this.isArchived,
      data.sortOrder ?? this.sortOrder,
      this.createdAt,
      new Date(),
    );
  }
}
