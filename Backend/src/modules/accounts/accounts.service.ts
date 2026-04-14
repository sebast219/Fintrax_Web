import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAccountDto) {
    // Verificar que no exista una cuenta con el mismo nombre
    const existing = await this.prisma.account.findUnique({
      where: { userId_name: { userId, name: dto.name } },
    });

    if (existing) {
      throw new ConflictException('Ya tienes una cuenta con ese nombre');
    }

    const account = await this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        initialBalance: dto.initialBalance || 0,
        balance: dto.initialBalance || 0,
        currency: dto.currency || 'USD',
        color: dto.color || '#3B82F6',
        icon: dto.icon || 'wallet',
      },
    });

    return account;
  }

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
      include: {
        cards: {
          where: { isActive: true },
          select: { id: true, cardName: true, lastFour: true, currentBalance: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    return account;
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.findOne(userId, id);

    if (dto.name && dto.name !== account.name) {
      const existing = await this.prisma.account.findUnique({
        where: { userId_name: { userId, name: dto.name } },
      });

      if (existing) {
        throw new ConflictException('Ya tienes una cuenta con ese nombre');
      }
    }

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    const account = await this.findOne(userId, id);

    // Verificar si tiene transacciones
    const hasTransactions = await this.prisma.transaction.count({
      where: { OR: [{ accountId: id }, { transferAccountId: id }] },
    }) > 0;

    if (hasTransactions) {
      // Soft delete: archivar en lugar de eliminar
      return this.prisma.account.update({
        where: { id },
        data: { isActive: false, isArchived: true },
      });
    }

    return this.prisma.account.delete({ where: { id } });
  }

  async getBalance(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
      select: { balance: true, initialBalance: true },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    const income = await this.prisma.transaction.aggregate({
      where: {
        accountId: id,
        type: 'INCOME',
      },
      _sum: { amount: true },
    });

    const expenses = await this.prisma.transaction.aggregate({
      where: {
        accountId: id,
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    });

    return {
      balance: account.balance,
      initialBalance: account.initialBalance,
      totalIncome: income._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
    };
  }
}
