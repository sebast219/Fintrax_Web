import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class HealthModule {}
