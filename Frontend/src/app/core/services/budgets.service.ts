import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Budget {
  id: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  amount: number;
  year: number;
  month: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface CreateBudgetDto {
  categoryId: string;
  amount: number;
  year: number;
  month: number;
}

export interface BudgetProgress {
  budgetId: string;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/budgets`;

  async getAll(year?: number, month?: number): Promise<Budget[]> {
    const queryParams: Record<string, string> = {};
    if (year) queryParams['year'] = year.toString();
    if (month) queryParams['month'] = month.toString();

    return firstValueFrom(
      this.http.get<Budget[]>(this.API_URL, { params: queryParams })
    );
  }

  async getProgress(id: string): Promise<BudgetProgress> {
    return firstValueFrom(this.http.get<BudgetProgress>(`${this.API_URL}/${id}/progress`));
  }

  async create(data: CreateBudgetDto): Promise<Budget> {
    return firstValueFrom(this.http.post<Budget>(this.API_URL, data));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.API_URL}/${id}`));
  }
}
