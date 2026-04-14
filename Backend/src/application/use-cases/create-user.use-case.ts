import { User } from '../../domain/entities/user.entity';
import { UserDomainService } from '../../domain/services/user.domain.service';
import { UserCreatedEvent } from '../../domain/events/user.events';

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface CreateUserResponse {
  user: User;
  event: UserCreatedEvent;
}

export class CreateUserUseCase {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const user = User.create({
      email: request.email,
      passwordHash: request.password, // In a real app, this should be hashed
      fullName: request.fullName,
    });

    const createdUser = await this.userDomainService.createUser(user);
    const event = new UserCreatedEvent(createdUser);

    return {
      user: createdUser,
      event,
    };
  }
}
