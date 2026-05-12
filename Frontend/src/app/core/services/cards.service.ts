import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Card {
  id: string;
  name: string;
  type: 'CREDIT' | 'DEBIT' | 'PREPAID';
  lastFour: string;
  balance: number;
  creditLimit?: number;
  availableCredit?: number;
  bankName: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardDto {
  name: string;
  type: Card['type'];
  lastFour: string;
  bankName: string;
  color: string;
  icon: string;
  creditLimit?: number;
  initialBalance?: number;
}

export interface UpdateCardDto extends Partial<CreateCardDto> {}

export interface CardSpending {
  cardId: string;
  cardName: string;
  totalSpent: number;
  transactions: number;
  averageTransaction: number;
  topCategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cards`;

  /**
   * Obtiene todas las tarjetas del usuario
   */
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(this.API_URL);
  }

  /**
   * Obtiene una tarjeta por ID
   */
  getCard(id: string): Observable<Card> {
    return this.http.get<Card>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva tarjeta
   */
  createCard(cardData: CreateCardDto): Observable<Card> {
    return this.http.post<Card>(this.API_URL, cardData);
  }

  /**
   * Actualiza una tarjeta existente
   */
  updateCard(id: string, cardData: UpdateCardDto): Observable<Card> {
    return this.http.put<Card>(`${this.API_URL}/${id}`, cardData);
  }

  /**
   * Elimina una tarjeta
   */
  deleteCard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Activa o desactiva una tarjeta
   */
  toggleCardStatus(id: string, isActive: boolean): Observable<Card> {
    return this.http.patch<Card>(`${this.API_URL}/${id}/status`, { isActive });
  }

  /**
   * Obtiene el balance actual de una tarjeta
   */
  getCardBalance(id: string): Observable<{
    balance: number;
    availableCredit: number;
    creditUtilization: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/${id}/balance`);
  }

  /**
   * Obtiene los gastos de una tarjeta
   */
  getCardSpending(id: string, period?: string): Observable<CardSpending> {
    const params: any = {};
    if (period) {
      params.period = period;
    }
    return this.http.get<CardSpending>(`${this.API_URL}/${id}/spending`, { params });
  }

  /**
   * Obtiene las transacciones de una tarjeta
   */
  getCardTransactions(
    id: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      startDate?: string;
      endDate?: string;
      category?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ): Observable<{
    transactions: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
    }

    return this.http.get<any>(`${this.API_URL}/${id}/transactions`, { params });
  }

  /**
   * Obtiene estadísticas de uso de tarjetas
   */
  getCardsStats(): Observable<{
    totalCards: number;
    activeCards: number;
    totalBalance: number;
    totalCreditLimit: number;
    averageUtilization: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/stats`);
  }

  /**
   * Exporta datos de tarjetas
   */
  exportCardsData(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }
}
