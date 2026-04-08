import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecurringService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringTransactions() {
    console.log('🔁 Processing recurring transactions...');

    const recurring = await this.prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextExecution: { lte: new Date() },
      },
    });

    for (const rec of recurring) {
      await this.executeRecurring(rec);
    }

    console.log(`✅ Processed ${recurring.length} recurring transactions`);
  }

  private async executeRecurring(rec: any) {
    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Crear transacción
        await tx.transaction.create({
          data: {
            userId: rec.userId,
            accountId: rec.accountId,
            categoryId: rec.categoryId,
            cardId: rec.cardId,
            type: rec.type,
            amount: rec.amount,
            description: rec.description,
            transactionDate: new Date(),
            isRecurring: true,
            recurringId: rec.id,
          },
        });

        // Actualizar cuenta
        if (rec.type === 'INCOME') {
          await tx.account.update({
            where: { id: rec.accountId },
            data: { balance: { increment: rec.amount } },
          });
        } else if (rec.type === 'EXPENSE') {
          await tx.account.update({
            where: { id: rec.accountId },
            data: { balance: { decrement: rec.amount } },
          });
        }

        // Calcular siguiente ejecución
        const nextExecution = this.calculateNextExecution(rec.nextExecution, rec.frequency);

        // Actualizar recurring
        await tx.recurringTransaction.update({
          where: { id: rec.id },
          data: {
            nextExecution,
            lastExecution: new Date(),
            executionCount: { increment: 1 },
            isActive: rec.maxExecutions
              ? rec.executionCount + 1 < rec.maxExecutions
              : true,
          },
        });
      });
    } catch (error) {
      console.error(`❌ Error processing recurring ${rec.id}:`, error);
    }
  }

  private calculateNextExecution(current: Date, frequency: string): Date {
    const next = new Date(current);

    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }
}
