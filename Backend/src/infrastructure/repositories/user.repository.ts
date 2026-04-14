import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository, User } from '../../domain/interfaces/repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Partial<User>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: entity.email!,
        passwordHash: entity.passwordHash!,
        fullName: entity.fullName!,
        avatarUrl: entity.avatarUrl,
        currency: entity.currency || 'USD',
        locale: entity.locale || 'es',
        timezone: entity.timezone || 'America/Mexico_City',
        preferences: entity.preferences || {},
        isActive: entity.isActive ?? true,
      },
    });

    return this.mapToUser(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToUser(user) : null;
  }

  async findAll(filters?: Partial<User>): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        ...(filters?.email && { email: filters.email }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
    });

    return users.map(user => this.mapToUser(user));
  }

  async update(id: string, entity: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(entity.fullName && { fullName: entity.fullName }),
        ...(entity.avatarUrl !== undefined && { avatarUrl: entity.avatarUrl }),
        ...(entity.currency && { currency: entity.currency }),
        ...(entity.locale && { locale: entity.locale }),
        ...(entity.timezone && { timezone: entity.timezone }),
        ...(entity.preferences && { preferences: entity.preferences }),
        ...(entity.isActive !== undefined && { isActive: entity.isActive }),
        ...(entity.lastLoginAt && { lastLoginAt: entity.lastLoginAt }),
      },
    });

    return this.mapToUser(user);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id },
    });

    return true;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToUser(user) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  private mapToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      fullName: prismaUser.fullName,
      avatarUrl: prismaUser.avatarUrl,
      currency: prismaUser.currency,
      locale: prismaUser.locale,
      timezone: prismaUser.timezone,
      preferences: prismaUser.preferences,
      isActive: prismaUser.isActive,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}
