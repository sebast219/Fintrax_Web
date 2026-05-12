import { Module } from '@nestjs/common';
import { FinancialV2Controller } from './financial-v2.controller';
import { FinancialLogicV2Service } from '../../domain/services/financial-logic-v2.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../../common/logger/logger.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule, RedisModule],
  controllers: [FinancialV2Controller],
  providers: [FinancialLogicV2Service],
  exports: [FinancialLogicV2Service],
})
export class FinancialV2Module {}
