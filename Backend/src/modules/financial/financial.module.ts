import { Module } from '@nestjs/common';
import { FinancialController } from './financial.controller';
import { FinancialLogicService } from '../../domain/services/financial-logic.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialController],
  providers: [FinancialLogicService],
  exports: [FinancialLogicService],
})
export class FinancialModule {}
