import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

export class UserDomainService {
  constructor(private readonly userRepository: IUserRepository) {}

  async validateUserEmail(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return existingUser === null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(user: User): Promise<User> {
    const isEmailValid = await this.validateUserEmail(user.email);
    if (!isEmailValid) {
      throw new Error('Email already exists');
    }
    return this.userRepository.create(user);
  }

  async updateUser(user: User): Promise<User> {
    const existingUser = await this.userRepository.findById(user.id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    return this.userRepository.update(user);
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    return this.userRepository.delete(id);
  }
}
