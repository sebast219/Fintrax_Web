import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected to database - sebast219 configuration');
    } catch (error) {
      console.warn('⚠️ Database connection failed, continuing without DB:', error.message);
      console.log('📋 Backend starting in offline mode for sebast219');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
