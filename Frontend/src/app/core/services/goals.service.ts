import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalDto {
  name: string;
  target: number;
  categoryId: string;
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
  current?: number;
}

export interface ContributeGoalDto {
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/goals`;

  async getAll(): Promise<Goal[]> {
    return firstValueFrom(this.http.get<Goal[]>(this.API_URL));
  }

  async getById(id: string): Promise<Goal> {
    return firstValueFrom(this.http.get<Goal>(`${this.API_URL}/${id}`));
  }

  async create(data: CreateGoalDto): Promise<Goal> {
    return firstValueFrom(this.http.post<Goal>(this.API_URL, data));
  }

  async update(id: string, data: UpdateGoalDto): Promise<Goal> {
    return firstValueFrom(this.http.put<Goal>(`${this.API_URL}/${id}`, data));
  }

  async contribute(id: string, data: ContributeGoalDto): Promise<Goal> {
    return firstValueFrom(this.http.post<Goal>(`${this.API_URL}/${id}/contribute`, data));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.API_URL}/${id}`));
  }
}
