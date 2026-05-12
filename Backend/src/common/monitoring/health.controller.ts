import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async getReadiness() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          memory: this.getMemoryUsage(),
          disk: this.getDiskUsage(),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'error',
          error: error.message,
        },
      };
    }
  }

  private getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      used: Math.round(usage.heapUsed / 1024 / 1024), // MB
      total: Math.round(usage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
    };
  }

  private getDiskUsage() {
    const stats = require('fs').statSync('.');
    return {
      available: 'N/A', // Would need additional monitoring
      status: 'ok',
    };
  }
}
