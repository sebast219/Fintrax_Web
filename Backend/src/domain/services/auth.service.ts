import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../interfaces/repository.interface';
import { User } from '../interfaces/repository.interface';
import * as bcrypt from 'bcrypt';

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthDomainService {
  constructor(
    private userRepository: IUserRepository,
  ) {}

  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(request.password, 12);

    // Create user
    const user = await this.userRepository.create({
      email: request.email,
      passwordHash,
      fullName: request.fullName,
      currency: 'USD',
      locale: 'es',
      timezone: 'America/Mexico_City',
      preferences: {},
      isActive: true,
    });

    return this.generateAuthResponse(user);
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(request.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    return this.generateAuthResponse(user);
  }

  async refreshToken(userId: string): Promise<AuthResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('Invalid user');
    }

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }

  private generateAuthResponse(user: User): AuthResponse {
    // This would typically use a JWT service
    // For now, we'll return a mock response
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
  }
}
