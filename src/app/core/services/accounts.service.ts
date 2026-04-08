import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT';
  color: string;
  icon: string;
  balance: number;
  currency: string;
  isActive: boolean;
  description?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface CreateAccountDto {
  name: string;
  type: Account['type'];
  color?: string;
  icon?: string;
  initialBalance?: number;
  currency?: string;
  description?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {}

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/accounts`;

  async getAll(): Promise<Account[]> {
    return firstValueFrom(this.http.get<Account[]>(this.API_URL));
  }

  async getById(id: string): Promise<Account> {
    return firstValueFrom(this.http.get<Account>(`${this.API_URL}/${id}`));
  }

  async create(data: CreateAccountDto): Promise<Account> {
    return firstValueFrom(this.http.post<Account>(this.API_URL, data));
  }

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    return firstValueFrom(this.http.put<Account>(`${this.API_URL}/${id}`, data));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.API_URL}/${id}`));
  }

  async getBalance(id: string): Promise<{ balance: number }> {
    return firstValueFrom(
      this.http.get<{ balance: number }>(`${this.API_URL}/${id}/balance`)
    );
  }
}
