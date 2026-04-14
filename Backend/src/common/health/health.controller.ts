import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../logger/logger.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private logger: AppLoggerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check() {
    const checks = await Promise.all([
      this.createPrismaCheck(),
      this.createMemoryCheck(),
      this.createDiskCheck(),
    ]);

    const result = {
      status: checks.every(check => Object.values(check)[0].status === 'up') ? 'ok' : 'error',
      info: { checks: Object.assign({}, ...checks) },
      details: {},
    };

    this.logger.log('Health check performed', 'Health');
    return result;
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if application is ready' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async ready() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Check if essential services are available
      const checks = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };

      this.logger.log('Readiness check passed', 'Health');
      return checks;
    } catch (error) {
      this.logger.error('Readiness check failed', error.stack, 'Health');
      throw error;
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Check if application is alive' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async live() {
    const status = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      memory: process.memoryUsage(),
    };

    return status;
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async metrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      nodeEnv: process.env.NODE_ENV,
    };

    this.logger.log(`Metrics retrieved - Memory: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`, 'Health');
    return metrics;
  }

  private createPrismaCheck = async () => {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        prisma: {
          status: 'up',
          info: { message: 'Prisma connection successful' },
        },
      };
    } catch (error) {
      this.logger.error('Prisma health check failed', error.stack, 'Health');
      return {
        prisma: {
          status: 'down',
          info: { message: error.message },
        },
      };
    }
  };

  private createMemoryCheck = async () => {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    const status = memoryUsagePercent > 90 ? 'down' : memoryUsagePercent > 80 ? 'warn' : 'up';

    return {
      memory: {
        status,
        info: {
          usage: `${memoryUsagePercent.toFixed(2)}%`,
          used: `${(usedMemory / 1024 / 1024).toFixed(2)}MB`,
          total: `${(totalMemory / 1024 / 1024).toFixed(2)}MB`,
        },
      },
    };
  };

  private createDiskCheck = async () => {
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      
      return {
        disk: {
          status: 'up',
          info: { message: 'Disk access successful' },
        },
      };
    } catch (error) {
      return {
        disk: {
          status: 'down',
          info: { message: error.message },
        },
      };
    }
  };
}
