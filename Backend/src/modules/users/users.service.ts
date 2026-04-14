import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        currency: true,
        locale: true,
        timezone: true,
        preferences: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        currency: true,
        locale: true,
        timezone: true,
        preferences: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getStats(userId: string) {
    const [
      accountsCount,
      transactionsCount,
      cardsCount,
      goalsCount,
      budgetsCount,
    ] = await Promise.all([
      this.prisma.account.count({ where: { userId, isActive: true } }),
      this.prisma.transaction.count({ where: { userId } }),
      this.prisma.card.count({ where: { userId, isActive: true } }),
      this.prisma.goal.count({ where: { userId } }),
      this.prisma.budget.count({ where: { userId } }),
    ]);

    return {
      accounts: accountsCount,
      transactions: transactionsCount,
      cards: cardsCount,
      goals: goalsCount,
      budgets: budgetsCount,
    };
  }
}
