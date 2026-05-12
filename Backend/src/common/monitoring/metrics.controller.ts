import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
// import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  // constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  getMetrics(@Res() res: Response) {
    // const metrics = this.metricsService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send('# Metrics endpoint temporarily disabled');
  }

  @Get('health')
  @ApiOperation({ summary: 'Metrics service health' })
  @ApiResponse({ status: 200, description: 'Metrics service health' })
  async getMetricsHealth() {
    // const dbHealth = await this.metricsService.getDatabaseHealth();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Metrics service temporarily disabled',
    };
  }
}
