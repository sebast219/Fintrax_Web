import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const budget = await this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        month: dto.month,
        year: dto.year,
        alertThreshold: dto.alertThreshold || 0.80,
      },
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    });
    return budget;
  }

  async findAll(userId: string, year?: number, month?: number) {
    const now = new Date();
    return this.prisma.budget.findMany({
      where: {
        userId,
        ...(year && { year }),
        ...(month && { month }),
      },
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getProgress(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
      include: { category: true },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    const spent = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        transactionDate: {
          gte: new Date(budget.year, budget.month - 1, 1),
          lte: new Date(budget.year, budget.month, 0),
        },
      },
      _sum: { amount: true },
    });

    const totalSpent = spent._sum.amount || 0;
    const percentage = Number(totalSpent) / Number(budget.amount);

    return {
      budget,
      spent: totalSpent,
      remaining: Number(budget.amount) - Number(totalSpent),
      percentage: (percentage * 100).toFixed(2),
      alertTriggered: percentage >= Number(budget.alertThreshold),
    };
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.budget.delete({ where: { id } });
  }

  private async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }

    return budget;
  }
}
