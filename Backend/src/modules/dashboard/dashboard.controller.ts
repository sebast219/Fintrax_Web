import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser('sub') userId: string) {
    return this.dashboardService.getSummary(userId);
  }

  @Get('trends')
  getMonthlyTrend(
    @CurrentUser('sub') userId: string,
    @Query('months') months?: string,
  ) {
    return this.dashboardService.getMonthlyTrend(userId, months ? parseInt(months) : 6);
  }
}
