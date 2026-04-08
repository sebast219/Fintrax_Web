import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      accountsCount,
      recentTransactions,
      expensesByCategory,
    ] = await Promise.all([
      // Total balance across all accounts
      this.prisma.account.aggregate({
        where: { userId, isActive: true },
        _sum: { balance: true },
      }),

      // Monthly income
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Monthly expenses
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Active accounts count
      this.prisma.account.count({ where: { userId, isActive: true } }),

      // Recent 5 transactions
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { transactionDate: 'desc' },
        take: 5,
        include: {
          category: { select: { name: true, icon: true, color: true } },
          account: { select: { name: true, color: true } },
        },
      }),

      // Expenses by category this month
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    // Get category details for the grouped data
    const categoryIds = expensesByCategory.map((e: any) => e.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    return {
      totalBalance: totalBalance._sum.balance || 0,
      monthlyIncome: monthlyIncome._sum.amount || 0,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      accountsCount,
      recentTransactions,
      expensesByCategory: expensesByCategory.map((e: any) => ({
        category: categoryMap.get(e.categoryId),
        amount: e._sum.amount,
      })),
    };
  }

  async getMonthlyTrend(userId: string, months: number = 6) {
    const now = new Date();
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [income, expenses] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'INCOME',
            transactionDate: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            transactionDate: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

      trends.push({
        month: date.toISOString().slice(0, 7),
        income: income._sum.amount || 0,
        expenses: expenses._sum.amount || 0,
        balance: Number(income._sum.amount || 0) - Number(expenses._sum.amount || 0),
      });
    }

    return trends;
  }
}
