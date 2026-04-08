import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCardDto) {
    const card = await this.prisma.card.create({
      data: {
        userId,
        accountId: dto.accountId || null,
        cardName: dto.cardName,
        cardType: dto.cardType,
        network: dto.network,
        lastFour: dto.lastFour,
        creditLimit: dto.creditLimit || null,
        billingDay: dto.billingDay || null,
        paymentDueDay: dto.paymentDueDay || null,
        interestRate: dto.interestRate || null,
        color: dto.color || '#1E293B',
        expiryMonth: dto.expiryMonth || null,
        expiryYear: dto.expiryYear || null,
      },
    });

    return card;
  }

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      include: {
        account: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.card.findFirst({
      where: { id, userId },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    return card;
  }

  async update(userId: string, id: string, dto: UpdateCardDto) {
    await this.findOne(userId, id);

    return this.prisma.card.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.card.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(userId: string, id: string) {
    const card = await this.findOne(userId, id);

    const totalSpent = await this.prisma.transaction.aggregate({
      where: {
        cardId: id,
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    });

    const utilization = card.creditLimit
      ? (Number(card.currentBalance) / Number(card.creditLimit)) * 100
      : 0;

    return {
      currentBalance: card.currentBalance,
      creditLimit: card.creditLimit,
      availableCredit: card.creditLimit
        ? Number(card.creditLimit) - Number(card.currentBalance)
        : 0,
      utilizationRate: utilization.toFixed(2),
      totalSpent: totalSpent._sum.amount || 0,
    };
  }
}
