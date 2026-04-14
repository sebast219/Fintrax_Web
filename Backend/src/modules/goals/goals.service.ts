import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto, ContributeGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description || null,
        targetAmount: dto.targetAmount,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        linkedAccountId: dto.linkedAccountId || null,
        icon: dto.icon || 'target',
        color: dto.color || '#8B5CF6',
      },
    });
    return goal;
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      include: {
        linkedAccount: { select: { id: true, name: true } },
        _count: { select: { contributions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: {
        linkedAccount: { select: { id: true, name: true } },
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!goal) {
      throw new NotFoundException('Meta no encontrada');
    }

    const percentage = Number(goal.currentAmount) / Number(goal.targetAmount) * 100;

    return {
      ...goal,
      percentage: percentage.toFixed(2),
      remaining: Number(goal.targetAmount) - Number(goal.currentAmount),
    };
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    await this.findOne(userId, id);

    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
  }

  async contribute(userId: string, id: string, dto: ContributeGoalDto) {
    const goal = await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Crear contribución
      const contribution = await tx.goalContribution.create({
        data: {
          goalId: id,
          userId,
          amount: dto.amount,
          note: dto.note || null,
        },
      });

      // Actualizar monto actual de la meta
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: { increment: dto.amount },
          status: Number(goal.currentAmount) + dto.amount >= Number(goal.targetAmount) ? 'COMPLETED' : undefined,
        },
      });

      return { contribution, goal: updatedGoal };
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.goal.delete({ where: { id } });
  }
}
