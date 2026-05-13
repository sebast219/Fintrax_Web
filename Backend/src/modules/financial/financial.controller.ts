import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimitNormal } from '../../common/decorators/rate-limit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FinancialLogicService, FinancialState } from '../../domain/services/financial-logic.service';
import { AllocateGoalDto, DeallocateGoalDto } from './dto/financial-operations.dto';

@ApiTags('Financial')
@Controller('financial')
@UseGuards(JwtAuthGuard, RateLimitGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialLogic: FinancialLogicService) {}

  @Get('state')
  @RateLimitNormal()
  @ApiOperation({ summary: 'Obtener estado financiero completo' })
  @ApiResponse({ status: 200, description: 'Estado financiero calculado' })
  async getFinancialState(@CurrentUser('sub') userId: string): Promise<FinancialState> {
    return this.financialLogic.calculateFinancialState(userId);
  }

  @Get('accounts')
  @RateLimitNormal()
  @ApiOperation({ summary: 'Obtener balance detallado por cuentas' })
  @ApiResponse({ status: 200, description: 'Balances de cuentas con desglose' })
  async getAccountBalances(@CurrentUser('sub') userId: string) {
    return this.financialLogic.getAccountBalances(userId);
  }

  @Post('allocate-goal')
  @HttpCode(HttpStatus.OK)
  @RateLimitNormal()
  @ApiOperation({ summary: 'Asignar fondos a una meta' })
  @ApiResponse({ status: 200, description: 'Fondos asignados exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en la asignación' })
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
  @ApiOperation({ summary: 'Retirar fondos de una meta' })
  @ApiResponse({ status: 200, description: 'Fondos retirados exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en el retiro' })
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

  @Get('goal-progress/:goalId')
  @RateLimitNormal()
  @ApiOperation({ summary: 'Obtener progreso detallado de una meta' })
  @ApiResponse({ status: 200, description: 'Progreso de la meta' })
  async getGoalProgress(@CurrentUser('sub') userId: string, goalId: string) {
    return this.financialLogic.getGoalProgress(goalId);
  }
}
