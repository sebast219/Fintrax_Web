import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [incomeByCategory, expensesByCategory, dailyBalance] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'INCOME',
          transactionDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: { gte: startDate, lte: endDate },
        },
        select: {
          transactionDate: true,
          type: true,
          amount: true,
        },
        orderBy: { transactionDate: 'asc' },
      }),
    ]);

    const categoryIds = [...incomeByCategory.map((i: any) => i.categoryId), ...expensesByCategory.map((e: any) => e.categoryId)];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));

    return {
      year,
      month,
      incomeByCategory: incomeByCategory.map((i: any) => ({
        category: categoryMap.get(i.categoryId),
        amount: i._sum.amount,
      })),
      expensesByCategory: expensesByCategory.map((e: any) => ({
        category: categoryMap.get(e.categoryId),
        amount: e._sum.amount,
      })),
      dailyBalance: this.groupByDay(dailyBalance),
    };
  }

  private groupByDay(transactions: any[]) {
    const grouped = new Map();

    transactions.forEach(t => {
      const date = t.transactionDate.toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, { date, income: 0, expenses: 0 });
      }
      const entry = grouped.get(date);
      if (t.type === 'INCOME') {
        entry.income += Number(t.amount);
      } else if (t.type === 'EXPENSE') {
        entry.expenses += Number(t.amount);
      }
    });

    return Array.from(grouped.values());
  }
}
