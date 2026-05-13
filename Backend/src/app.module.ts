import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './common/health/health.module';
import { CacheModule } from './common/cache/cache.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { RedisModule } from './common/redis/redis.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CardsModule } from './modules/cards/cards.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { GoalsModule } from './modules/goals/goals.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RecurringModule } from './modules/recurring/recurring.module';
import { FinancialV2Module } from './modules/financial-v2/financial-v2.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    LoggerModule,
    HealthModule,
    CacheModule,
    MetricsModule,
    RedisModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    CardsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    DashboardModule,
    ReportsModule,
    RecurringModule,
    FinancialV2Module,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    RateLimitGuard,
  ],
})
export class AppModule {}
