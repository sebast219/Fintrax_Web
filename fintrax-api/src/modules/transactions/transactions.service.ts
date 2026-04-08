import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/create-transaction.dto';
import { SearchTransactionsDto } from './dto/search-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    // Validar que account y category pertenecen al usuario
    await this.validateOwnership(userId, dto.accountId, dto.categoryId, dto.cardId);

    // Validar transferencia
    if (dto.type === 'TRANSFER') {
      if (!dto.transferAccountId) {
        throw new BadRequestException('transferAccountId es requerido para transferencias');
      }
      if (dto.transferAccountId === dto.accountId) {
        throw new BadRequestException('No puedes transferir a la misma cuenta');
      }
    }

    // Transacción atómica: crear + actualizar balances
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Crear la transacción
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          cardId: dto.cardId || null,
          type: dto.type,
          amount: dto.amount,
          description: dto.description,
          transactionDate: new Date(dto.transactionDate),
          transferAccountId: dto.transferAccountId || null,
          notes: dto.notes || null,
          tags: dto.tags || [],
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, type: true, color: true } },
          card: { select: { id: true, cardName: true, lastFour: true } },
        },
      });

      // 2. Actualizar balance de cuenta
      await this.updateAccountBalance(tx, dto.type, dto.accountId, dto.amount, 'add');

      // 3. Si es transferencia, actualizar cuenta destino
      if (dto.type === 'TRANSFER' && dto.transferAccountId) {
        await this.updateAccountBalance(tx, 'INCOME', dto.transferAccountId, dto.amount, 'add');
      }

      // 4. Si tiene tarjeta y es gasto, actualizar balance de tarjeta
      if (dto.cardId && dto.type === 'EXPENSE') {
        await tx.card.update({
          where: { id: dto.cardId },
          data: { currentBalance: { increment: dto.amount } },
        });
      }

      return transaction;
    });
  }

  async search(userId: string, dto: SearchTransactionsDto) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(dto.type && { type: dto.type }),
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.accountId && { accountId: dto.accountId }),
      ...(dto.cardId && { cardId: dto.cardId }),
      ...(dto.search && { description: { contains: dto.search, mode: 'insensitive' } }),
      ...(dto.tags?.length && { tags: { hasSome: dto.tags } }),
      ...(dto.minAmount && { amount: { gte: dto.minAmount } }),
      ...(dto.maxAmount && { amount: { ...(dto.minAmount ? { gte: dto.minAmount } : {}), lte: dto.maxAmount } }),
      ...((dto.dateFrom || dto.dateTo) && {
        transactionDate: {
          ...(dto.dateFrom && { gte: new Date(dto.dateFrom) }),
          ...(dto.dateTo && { lte: new Date(dto.dateTo) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, type: true, color: true } },
          card: { select: { id: true, cardName: true, lastFour: true } },
        },
        orderBy: { [dto.sortBy as string]: dto.sortDir },
        skip: ((dto.page || 1) - 1) * ((dto.pageSize || 20) as number),
        take: (dto.pageSize || 20) as number,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        pagination: {
          page: dto.page,
          pageSize: dto.pageSize,
          total,
          totalPages: Math.ceil(total / (dto.pageSize || 20)),
        },
      },
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true, type: true, color: true } },
        card: { select: { id: true, cardName: true, lastFour: true } },
        transferAccount: { select: { id: true, name: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Revertir el efecto de la transacción anterior
      await this.updateAccountBalance(tx, existing.type, existing.accountId, Number(existing.amount), 'revert');

      if (existing.type === 'TRANSFER' && existing.transferAccountId) {
        await this.updateAccountBalance(tx, 'INCOME', existing.transferAccountId, Number(existing.amount), 'revert');
      }

      if (existing.cardId && existing.type === 'EXPENSE') {
        await tx.card.update({
          where: { id: existing.cardId },
          data: { currentBalance: { decrement: Number(existing.amount) } },
        });
      }

      // 2. Actualizar la transacción
      const type = dto.type || existing.type;
      const amount = dto.amount || Number(existing.amount);

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...(dto.type && { type: dto.type }),
          ...(dto.amount && { amount: dto.amount }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.transactionDate && { transactionDate: new Date(dto.transactionDate) }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.tags && { tags: dto.tags }),
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, type: true, color: true } },
        },
      });

      // 3. Aplicar nuevo efecto
      await this.updateAccountBalance(tx, type, existing.accountId, amount, 'add');

      return updated;
    });
  }

  async delete(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Revertir balance
      await this.updateAccountBalance(tx, existing.type, existing.accountId, Number(existing.amount), 'revert');

      if (existing.type === 'TRANSFER' && existing.transferAccountId) {
        await this.updateAccountBalance(tx, 'INCOME', existing.transferAccountId, Number(existing.amount), 'revert');
      }

      if (existing.cardId && existing.type === 'EXPENSE') {
        await tx.card.update({
          where: { id: existing.cardId },
          data: { currentBalance: { decrement: Number(existing.amount) } },
        });
      }

      await tx.transaction.delete({ where: { id } });

      return { deleted: true };
    });
  }

  private async validateOwnership(userId: string, accountId: string, categoryId: string, cardId?: string) {
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: accountId, userId } }),
      this.prisma.category.findFirst({ where: { id: categoryId, OR: [{ userId }, { userId: null }] } }),
    ]);

    if (!account) throw new ForbiddenException('Cuenta no válida');
    if (!category) throw new ForbiddenException('Categoría no válida');

    if (cardId) {
      const card = await this.prisma.card.findFirst({ where: { id: cardId, userId } });
      if (!card) throw new ForbiddenException('Tarjeta no válida');
    }
  }

  private async updateAccountBalance(
    tx: Prisma.TransactionClient,
    type: string,
    accountId: string,
    amount: number,
    action: 'add' | 'revert',
  ) {
    const multiplier = action === 'revert' ? -1 : 1;

    switch (type) {
      case 'INCOME':
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: amount * multiplier } },
        });
        break;
      case 'EXPENSE':
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amount * multiplier } },
        });
        break;
      case 'TRANSFER':
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amount * multiplier } },
        });
        break;
    }
  }
}
