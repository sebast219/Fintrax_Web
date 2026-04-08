import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  transactionDate: string;
  isRecurring: boolean;
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
  card?: {
    id: string;
    cardName: string;
    lastFour: string;
  };
}

export interface CreateTransactionDto {
  accountId: string;
  categoryId: string;
  cardId?: string;
  type: Transaction['type'];
  amount: number;
  description: string;
  transactionDate?: string;
  isRecurring?: boolean;
  transferAccountId?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface SearchTransactionsDto {
  page?: number;
  pageSize?: number;
  type?: Transaction['type'];
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  async search(params: SearchTransactionsDto = {}): Promise<PaginatedTransactions> {
    const queryParams: Record<string, string> = {};
    if (params.page) queryParams['page'] = params.page.toString();
    if (params.pageSize) queryParams['pageSize'] = params.pageSize.toString();
    if (params.type) queryParams['type'] = params.type;
    if (params.accountId) queryParams['accountId'] = params.accountId;
    if (params.categoryId) queryParams['categoryId'] = params.categoryId;
    if (params.startDate) queryParams['startDate'] = params.startDate;
    if (params.endDate) queryParams['endDate'] = params.endDate;
    if (params.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params.sortDir) queryParams['sortDir'] = params.sortDir;

    return firstValueFrom(
      this.http.get<PaginatedTransactions>(this.API_URL, { params: queryParams })
    );
  }

  async getById(id: string): Promise<Transaction> {
    return firstValueFrom(this.http.get<Transaction>(`${this.API_URL}/${id}`));
  }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    return firstValueFrom(this.http.post<Transaction>(this.API_URL, data));
  }

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    return firstValueFrom(this.http.put<Transaction>(`${this.API_URL}/${id}`, data));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.API_URL}/${id}`));
  }
}
