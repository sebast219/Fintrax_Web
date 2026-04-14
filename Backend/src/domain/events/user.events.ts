import { DomainEvent } from './domain.event';
import { User } from '../entities/user.entity';

export class UserCreatedEvent extends DomainEvent {
  constructor(public readonly user: User) {
    super(`user-created-${user.id}`);
  }

  getEventName(): string {
    return 'UserCreated';
  }
}

export class UserUpdatedEvent extends DomainEvent {
  constructor(public readonly user: User) {
    super(`user-updated-${user.id}`);
  }

  getEventName(): string {
    return 'UserUpdated';
  }
}

export class UserDeletedEvent extends DomainEvent {
  constructor(public readonly userId: string) {
    super(`user-deleted-${userId}`);
  }

  getEventName(): string {
    return 'UserDeleted';
  }
}
