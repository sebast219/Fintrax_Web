import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FinancialStateDetailed } from '../core/services/financial-state-v2.interface';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialApiService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/financial`;

  /**
   * GET /api/v1/financial/state
   * Retorna FinancialStateDetailed completado
   */
  async getFinancialState(): Promise<FinancialStateDetailed> {
    return firstValueFrom(
      this.http.get<FinancialStateDetailed>(`${this.baseUrl}/state`)
    );
  }

  /**
   * GET /api/v1/financial/recommendations
   */
  async getRecommendations() {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/recommendations`)
    );
  }

  /**
   * GET /api/v1/financial/metrics
   */
  async getMetrics() {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/metrics`)
    );
  }

  /**
   * POST /api/v1/financial/allocate-goal
   */
  async allocateToGoal(data: {
    amount: number;
    goalId: string;
    accountId: string;
    note?: string;
  }) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/allocate-goal`, data)
    );
  }

  /**
   * POST /api/v1/financial/deallocate-goal
   */
  async deallocateFromGoal(data: {
    amount: number;
    goalId: string;
    accountId: string;
    note?: string;
  }) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/deallocate-goal`, data)
    );
  }

  /**
   * GET /api/v1/financial/transactions
   */
  async getTransactions() {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/transactions`)
    );
  }

  /**
   * GET /api/v1/financial/goals
   */
  async getGoals() {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/goals`)
    );
  }

  /**
   * POST /api/v1/financial/transactions
   */
  async createTransaction(transaction: any) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/transactions`, transaction)
    );
  }

  /**
   * PUT /api/v1/financial/goals/:id
   */
  async updateGoal(goal: any) {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}/goals/${goal.id}`, goal)
    );
  }
}
