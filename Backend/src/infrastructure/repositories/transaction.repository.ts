import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { ITransactionRepository, Transaction, TransactionFilters } from '../../domain/interfaces/repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: entity.userId!,
        accountId: entity.accountId!,
        categoryId: entity.categoryId!,
        cardId: entity.cardId,
        type: entity.type as TransactionType,
        amount: entity.amount!,
        description: entity.description || '',
        notes: entity.notes,
        transactionDate: entity.transactionDate!,
        transferAccountId: entity.transferAccountId,
        tags: entity.tags || [],
        metadata: entity.metadata || {},
        isConfirmed: entity.isConfirmed ?? true,
        isRecurring: entity.isRecurring ?? false,
        recurringId: entity.recurringId,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
        card: {
          select: { id: true, cardName: true, lastFour: true },
        },
      },
    });

    return this.mapToTransaction(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
        card: {
          select: { id: true, cardName: true, lastFour: true },
        },
        transferAccount: {
          select: { id: true, name: true },
        },
      },
    });

    return transaction ? this.mapToTransaction(transaction) : null;
  }

  async findAll(filters?: Partial<Transaction>): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.type && { type: filters.type as TransactionType }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.accountId && { accountId: filters.accountId }),
        ...(filters?.cardId && { cardId: filters.cardId }),
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
        card: {
          select: { id: true, cardName: true, lastFour: true },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });

    return transactions.map(transaction => this.mapToTransaction(transaction));
  }

  async update(id: string, entity: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(entity.type && { type: entity.type as TransactionType }),
        ...(entity.amount && { amount: entity.amount }),
        ...(entity.description !== undefined && { description: entity.description }),
        ...(entity.notes !== undefined && { notes: entity.notes }),
        ...(entity.transactionDate && { transactionDate: entity.transactionDate }),
        ...(entity.categoryId && { categoryId: entity.categoryId }),
        ...(entity.tags && { tags: entity.tags }),
        ...(entity.metadata && { metadata: entity.metadata }),
        ...(entity.isConfirmed !== undefined && { isConfirmed: entity.isConfirmed }),
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
      },
    });

    return this.mapToTransaction(transaction);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.transaction.delete({
      where: { id },
    });

    return true;
  }

  async findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    const where: any = {
      userId,
      ...(filters?.type && { type: filters.type as TransactionType }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.accountId && { accountId: filters.accountId }),
      ...(filters?.cardId && { cardId: filters.cardId }),
      ...(filters?.search && { description: { contains: filters.search, mode: 'insensitive' } }),
      ...(filters?.tags?.length && { tags: { hasSome: filters.tags } }),
      ...(filters?.minAmount && { amount: { gte: filters.minAmount } }),
      ...(filters?.maxAmount && { amount: { ...(filters?.minAmount ? { gte: filters.minAmount } : {}), lte: filters.maxAmount } }),
      ...((filters?.dateFrom || filters?.dateTo) && {
        transactionDate: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        },
      }),
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
        card: {
          select: { id: true, cardName: true, lastFour: true },
        },
      },
      orderBy: { [filters?.sortBy || 'transactionDate']: filters?.sortDir || 'desc' },
      skip: filters?.page ? ((filters.page - 1) * (filters.pageSize || 20)) : 0,
      take: filters?.pageSize || 20,
    });

    return transactions.map(transaction => this.mapToTransaction(transaction));
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { accountId },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
        card: {
          select: { id: true, cardName: true, lastFour: true },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });

    return transactions.map(transaction => this.mapToTransaction(transaction));
  }

  async updateAccountBalance(accountId: string, amount: number, type: string): Promise<void> {
    const multiplier = type === 'INCOME' ? 1 : -1;
    
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        balance: { increment: amount * multiplier },
      },
    });
  }

  private mapToTransaction(prismaTransaction: any): Transaction {
    return {
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      accountId: prismaTransaction.accountId,
      categoryId: prismaTransaction.categoryId,
      cardId: prismaTransaction.cardId,
      type: prismaTransaction.type,
      amount: Number(prismaTransaction.amount),
      description: prismaTransaction.description,
      notes: prismaTransaction.notes,
      transactionDate: prismaTransaction.transactionDate,
      transferAccountId: prismaTransaction.transferAccountId,
      transferTransactionId: prismaTransaction.transferTransactionId,
      isRecurring: prismaTransaction.isRecurring,
      recurringId: prismaTransaction.recurringId,
      tags: prismaTransaction.tags,
      metadata: prismaTransaction.metadata,
      isConfirmed: prismaTransaction.isConfirmed,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    };
  }
}
