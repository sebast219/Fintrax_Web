export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly currency: string,
    public readonly locale: string,
    public readonly timezone: string,
    public readonly preferences: Record<string, any>,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly avatarUrl?: string,
    public readonly lastLoginAt?: Date,
  ) {}

  static create(props: Partial<User>): User {
    return new User(
      props.id!,
      props.email!,
      props.passwordHash!,
      props.fullName || '',
      props.currency || 'USD',
      props.locale || 'es',
      props.timezone || 'America/Mexico_City',
      props.preferences || {},
      props.isActive ?? true,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
      props.avatarUrl,
      props.lastLoginAt,
    );
  }

  updateLastLogin(): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.fullName,
      this.currency,
      this.locale,
      this.timezone,
      this.preferences,
      this.isActive,
      this.createdAt,
      new Date(),
      this.avatarUrl,
      new Date(),
    );
  }

  updateProfile(data: Partial<Pick<User, 'fullName' | 'avatarUrl' | 'currency' | 'locale' | 'timezone' | 'preferences'>>): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      data.fullName ?? this.fullName,
      data.currency ?? this.currency,
      data.locale ?? this.locale,
      data.timezone ?? this.timezone,
      data.preferences ?? this.preferences,
      this.isActive,
      this.createdAt,
      new Date(),
      data.avatarUrl ?? this.avatarUrl,
      this.lastLoginAt,
    );
  }
}
