import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignUpDto, SignInDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    // Verificar si el email ya existe
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Crear usuario + cuenta default + categorías en una transacción
    const user = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Crear usuario
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
        },
      });

      // 2. Crear cuenta por defecto
      await tx.account.create({
        data: {
          userId: newUser.id,
          name: 'Efectivo',
          type: 'CASH',
          icon: 'banknotes',
          color: '#10B981',
        },
      });

      // 3. Crear categorías por defecto
      await tx.category.createMany({
        data: this.getDefaultCategories(newUser.id),
      });

      return newUser;
    });

    return this.generateTokenResponse(user.id, user.email, user.fullName);
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokenResponse(user.id, user.email, user.fullName);
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return this.generateTokenResponse(user.id, user.email, user.fullName);
  }

  private generateTokenResponse(userId: string, email: string, fullName: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '24h' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
      user: { id: userId, email, fullName },
    };
  }

  private getDefaultCategories(userId: string) {
    return [
      // Gastos
      { userId, name: 'Alimentación',    type: 'EXPENSE' as const, icon: 'utensils',       color: '#EF4444', isDefault: true, sortOrder: 1 },
      { userId, name: 'Transporte',      type: 'EXPENSE' as const, icon: 'car',            color: '#F59E0B', isDefault: true, sortOrder: 2 },
      { userId, name: 'Vivienda',        type: 'EXPENSE' as const, icon: 'home',           color: '#8B5CF6', isDefault: true, sortOrder: 3 },
      { userId, name: 'Entretenimiento', type: 'EXPENSE' as const, icon: 'gamepad',        color: '#EC4899', isDefault: true, sortOrder: 4 },
      { userId, name: 'Salud',           type: 'EXPENSE' as const, icon: 'heart-pulse',    color: '#14B8A6', isDefault: true, sortOrder: 5 },
      { userId, name: 'Educación',       type: 'EXPENSE' as const, icon: 'graduation-cap', color: '#6366F1', isDefault: true, sortOrder: 6 },
      { userId, name: 'Servicios',       type: 'EXPENSE' as const, icon: 'zap',            color: '#0EA5E9', isDefault: true, sortOrder: 7 },
      { userId, name: 'Otros gastos',    type: 'EXPENSE' as const, icon: 'more-horizontal',color: '#6B7280', isDefault: true, sortOrder: 8 },
      // Ingresos
      { userId, name: 'Salario',         type: 'INCOME' as const,  icon: 'briefcase',      color: '#10B981', isDefault: true, sortOrder: 1 },
      { userId, name: 'Freelance',       type: 'INCOME' as const,  icon: 'laptop',         color: '#3B82F6', isDefault: true, sortOrder: 2 },
      { userId, name: 'Inversiones',     type: 'INCOME' as const,  icon: 'trending-up',    color: '#8B5CF6', isDefault: true, sortOrder: 3 },
      { userId, name: 'Otros ingresos',  type: 'INCOME' as const,  icon: 'plus-circle',    color: '#6B7280', isDefault: true, sortOrder: 4 },
    ];
  }
}
