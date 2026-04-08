import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    // Verificar que no exista una categoría con el mismo nombre y tipo
    const existing = await this.prisma.category.findUnique({
      where: { userId_name_type: { userId, name: dto.name, type: dto.type } },
    });

    if (existing) {
      throw new ConflictException('Ya tienes una categoría con ese nombre y tipo');
    }

    const category = await this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon || 'tag',
        color: dto.color || '#6B7280',
        parentId: dto.parentId || null,
      },
    });

    return category;
  }

  async findAll(userId: string, type?: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }], // Include global categories
        ...(type && { type: type as any }),
      },
      include: {
        children: {
          where: { OR: [{ userId }, { userId: null }] },
          select: { id: true, name: true, icon: true, color: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
      include: {
        parent: {
          select: { id: true, name: true },
        },
        children: {
          where: { OR: [{ userId }, { userId: null }] },
          select: { id: true, name: true, icon: true, color: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId }, // Solo puede editar sus propias categorías
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada o no puedes editar categorías por defecto');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId }, // Solo puede eliminar sus propias categorías
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada o no puedes eliminar categorías por defecto');
    }

    // Verificar si tiene transacciones
    const hasTransactions = await this.prisma.transaction.count({
      where: { categoryId: id },
    }) > 0;

    if (hasTransactions) {
      // Soft delete
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
