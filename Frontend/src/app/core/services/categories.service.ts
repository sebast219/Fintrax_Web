import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isGlobal: boolean;
  isActive: boolean;
}

export interface CreateCategoryDto {
  name: string;
  type: Category['type'];
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/categories`;

  async getAll(): Promise<Category[]> {
    return firstValueFrom(this.http.get<Category[]>(this.API_URL));
  }

  async getById(id: string): Promise<Category> {
    return firstValueFrom(this.http.get<Category>(`${this.API_URL}/${id}`));
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    return firstValueFrom(this.http.post<Category>(this.API_URL, data));
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    return firstValueFrom(this.http.put<Category>(`${this.API_URL}/${id}`, data));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.API_URL}/${id}`));
  }
}
