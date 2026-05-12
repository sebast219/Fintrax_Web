import { Module } from '@nestjs/common';
import { HealthSimpleController } from './health-simple.controller';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [HealthSimpleController, HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class HealthModule {}
