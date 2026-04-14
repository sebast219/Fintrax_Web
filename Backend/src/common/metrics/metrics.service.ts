import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLoggerService } from '../logger/logger.service';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: client.Registry;
  
  // HTTP metrics
  private httpRequestsTotal: client.Counter<string>;
  private httpRequestDuration: client.Histogram<string>;
  private httpRequestSize: client.Histogram<string>;
  private httpResponseSize: client.Histogram<string>;
  
  // Application metrics
  private activeUsers: client.Gauge<string>;
  private totalTransactions: client.Counter<string>;
  private transactionAmount: client.Histogram<string>;
  private databaseConnections: client.Gauge<string>;
  private cacheHits: client.Counter<string>;
  private cacheMisses: client.Counter<string>;
  
  // Business metrics
  private accountsCreated: client.Counter<string>;
  private goalsCompleted: client.Counter<string>;
  private budgetAlerts: client.Counter<string>;

  constructor(private logger: AppLoggerService) {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });
  }

  onModuleInit() {
    this.initializeMetrics();
    this.logger.log('Prometheus metrics initialized', 'Metrics');
  }

  private initializeMetrics() {
    // HTTP metrics
    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    this.httpRequestSize = new client.Histogram({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 500, 1000, 5000, 10000, 50000],
      registers: [this.register],
    });

    this.httpResponseSize = new client.Histogram({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [100, 500, 1000, 5000, 10000, 50000],
      registers: [this.register],
    });

    // Application metrics
    this.activeUsers = new client.Gauge({
      name: 'active_users_total',
      help: 'Number of active users',
      registers: [this.register],
    });

    this.totalTransactions = new client.Counter({
      name: 'transactions_total',
      help: 'Total number of transactions',
      labelNames: ['type', 'status'],
      registers: [this.register],
    });

    this.transactionAmount = new client.Histogram({
      name: 'transaction_amount',
      help: 'Transaction amounts',
      labelNames: ['type', 'currency'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      registers: [this.register],
    });

    this.databaseConnections = new client.Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    this.cacheHits = new client.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.register],
    });

    this.cacheMisses = new client.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.register],
    });

    // Business metrics
    this.accountsCreated = new client.Counter({
      name: 'accounts_created_total',
      help: 'Total number of accounts created',
      labelNames: ['account_type'],
      registers: [this.register],
    });

    this.goalsCompleted = new client.Counter({
      name: 'goals_completed_total',
      help: 'Total number of goals completed',
      registers: [this.register],
    });

    this.budgetAlerts = new client.Counter({
      name: 'budget_alerts_total',
      help: 'Total number of budget alerts triggered',
      labelNames: ['alert_type'],
      registers: [this.register],
    });
  }

  // HTTP metrics methods
  incrementHttpRequests(method: string, route: string, statusCode: string) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  observeHttpRequestDuration(method: string, route: string, statusCode: string, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration / 1000);
  }

  observeHttpRequestSize(method: string, route: string, size: number) {
    this.httpRequestSize.observe({ method, route }, size);
  }

  observeHttpResponseSize(method: string, route: string, statusCode: string, size: number) {
    this.httpResponseSize.observe({ method, route, status_code: statusCode }, size);
  }

  // Application metrics methods
  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  incrementTransaction(type: string, status: string = 'created') {
    this.totalTransactions.inc({ type, status });
  }

  observeTransactionAmount(type: string, currency: string, amount: number) {
    this.transactionAmount.observe({ type, currency }, amount);
  }

  setDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  incrementCacheHit(cacheType: string) {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  incrementCacheMiss(cacheType: string) {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  // Business metrics methods
  incrementAccountCreated(accountType: string) {
    this.accountsCreated.inc({ account_type: accountType });
  }

  incrementGoalCompleted() {
    this.goalsCompleted.inc();
  }

  incrementBudgetAlert(alertType: string) {
    this.budgetAlerts.inc({ alert_type: alertType });
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Custom metrics
  recordCustomMetric(name: string, value: number, labels?: Record<string, string>) {
    const metric = new client.Gauge({
      name,
      help: `Custom metric: ${name}`,
      labelNames: labels ? Object.keys(labels) : [],
      registers: [this.register],
    });

    if (labels) {
      metric.set(labels, value);
    } else {
      metric.set(value);
    }
  }

  incrementCustomCounter(name: string, labels?: Record<string, string>) {
    const metric = new client.Counter({
      name,
      help: `Custom counter: ${name}`,
      labelNames: labels ? Object.keys(labels) : [],
      registers: [this.register],
    });

    if (labels) {
      metric.inc(labels);
    } else {
      metric.inc();
    }
  }
}
