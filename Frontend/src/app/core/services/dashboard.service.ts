import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  accountsCount: number;
  recentTransactions: TransactionSummary[];
  expensesByCategory: CategoryExpense[];
}

export interface TransactionSummary {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  transactionDate: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  account: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

export interface CategoryExpense {
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  async getSummary(): Promise<DashboardSummary> {
    return firstValueFrom(
      this.http.get<DashboardSummary>(`${this.API_URL}/summary`)
    );
  }

  async getTrends(months: number = 6): Promise<MonthlyTrend[]> {
    return firstValueFrom(
      this.http.get<MonthlyTrend[]>(`${this.API_URL}/trends`, {
        params: { months: months.toString() }
      })
    );
  }
}
