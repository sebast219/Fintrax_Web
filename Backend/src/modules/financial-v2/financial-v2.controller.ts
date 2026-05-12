import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimitNormal } from '../../common/decorators/rate-limit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FinancialLogicV2Service } from '../../domain/services/financial-logic-v2.service';
import { FinancialStateDetailed, FinancialRecommendation, TransactionMetrics } from '../../domain/interfaces/financial-state.interface';
import { AllocateGoalDto, DeallocateGoalDto } from '../financial/dto/financial-operations.dto';

@ApiTags('Financial V2')
@Controller('financial')
@UseGuards(JwtAuthGuard, RateLimitGuard)
@ApiBearerAuth()
export class FinancialV2Controller {
  constructor(private readonly financialLogic: FinancialLogicV2Service) {}

  @Get('state')
  @RateLimitNormal()
  @ApiOperation({ summary: 'Obtener estado financiero detallado' })
  @ApiResponse({ status: 200, description: 'Estado financiero completo con confirmados vs esperados' })
  async getFinancialStateDetailed(@CurrentUser('sub') userId: string): Promise<FinancialStateDetailed> {
    return this.financialLogic.calculateFinancialStateDetailed(userId);
  }

  @Get('recommendations')
  @RateLimitNormal()
  @ApiOperation({ summary: 'Obtener recomendaciones financieras inteligentes' })
  @ApiResponse({ status: 200, description: 'Recomendaciones basadas en estado financiero' })
  async getFinancialRecommendations(@CurrentUser('sub') userId: string): Promise<FinancialRecommendation[]> {
    return this.financialLogic.generateRecommendations(userId);
  }

  @Get('metrics')
  @RateLimitNormal()
  @ApiOperation({ summary: 'Obtener métricas detalladas de transacciones' })
  @ApiResponse({ status: 200, description: 'Métricas por tipo, estado y mes' })
  async getTransactionMetrics(@CurrentUser('sub') userId: string): Promise<TransactionMetrics> {
    return this.financialLogic.getTransactionMetrics(userId);
  }

  @Post('allocate-goal')
  @HttpCode(HttpStatus.OK)
  @RateLimitNormal()
  @ApiOperation({ summary: 'Asignar fondos a una meta con validaciones exhaustivas' })
  @ApiResponse({ status: 200, description: 'Fondos asignados exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en la asignación con detalles específicos' })
  async allocateToGoal(
    @CurrentUser('sub') userId: string,
    @Body() dto: AllocateGoalDto
  ) {
    return this.financialLogic.allocateToGoal(
      userId,
      dto.amount,
      dto.goalId,
      dto.accountId,
      dto.note
    );
  }

  @Post('deallocate-goal')
  @HttpCode(HttpStatus.OK)
  @RateLimitNormal()
  @ApiOperation({ summary: 'Retirar fondos de una meta con validaciones exhaustivas' })
  @ApiResponse({ status: 200, description: 'Fondos retirados exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en el retiro con detalles específicos' })
  async deallocateFromGoal(
    @CurrentUser('sub') userId: string,
    @Body() dto: DeallocateGoalDto
  ) {
    return this.financialLogic.deallocateFromGoal(
      userId,
      dto.amount,
      dto.goalId,
      dto.accountId,
      dto.note
    );
  }
}
