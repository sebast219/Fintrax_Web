import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../layout/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';
import { CardsService, Card, CardSpending } from '../../../core/services/cards.service';
import { TransactionsService } from '../../../core/services/transactions.service';
import Chart from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  cardNumber: string;
  date: string;
  icon: string;
  category?: string;
}

interface NewCard {
  type: 'CREDIT' | 'DEBIT' | 'PREPAID';
  name: string;
  lastFour: string;
  bankName: string;
  color: string;
  icon: string;
  creditLimit?: number;
  initialBalance?: number;
}

interface CardsStats {
  totalCards: number;
  activeCards: number;
  totalBalance: number;
  totalCreditLimit: number;
  averageUtilization: number;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './cards.component.html',
  styleUrl: './cards.scss'
})
export class CardsComponent implements OnInit, AfterViewInit {

  auth = inject(AuthService);
  private cardsService = inject(CardsService);
  private transactionsService = inject(TransactionsService);

  // Signals for reactive state
  cards = signal<Card[]>([]);
  recentTransactions = signal<Transaction[]>([]);
  cardsStats = signal<CardsStats | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  
  // Modal state
  showAddCardModal = signal<boolean>(false);
  newCard: NewCard = {
    type: 'CREDIT',
    name: '',
    lastFour: '',
    bankName: '',
    color: '#00D4AA',
    icon: '💳',
    creditLimit: 0,
    initialBalance: 0
  };

  // Computed properties
  totalGastado = signal<number>(0);
  totalBalance = signal<number>(0);

  // Available colors and icons for cards (from database or defaults)
  availableColors = [
    '#00D4AA', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#10B981', '#6366F1'
  ];
  
  availableIcons = ['💳', '💰', '💎', '🏦', '💸', '🛡️', '⚡', '🌟'];

  // Month selector properties
  selectedMonth = signal<string>('');
  months = signal<string[]>([]);

  // Generate months dynamically based on current date
  private generateMonths(): string[] {
    const months: string[] = [];
    const currentDate = new Date();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Generate last 12 months including current month
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      months.push(`${monthName} ${year}`);
    }
    
    return months;
  }

  // Initialize months and set current month as selected
  private initializeMonths(): void {
    const monthList = this.generateMonths();
    this.months.set(monthList);
    this.selectedMonth.set(monthList[0]); // Current month is first in the list
  }

  // Get date range for selected month
  private getDateRangeForSelectedMonth(): { startDate: string; endDate: string } {
    const selectedMonth = this.selectedMonth();
    
    // Parse selected month (e.g., "Enero 2024")
    const [monthName, yearStr] = selectedMonth.split(' ');
    const year = parseInt(yearStr);
    
    // Get month index (0-11)
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthIndex = monthNames.indexOf(monthName);
    
    // Create start date (first day of month at 00:00:00)
    const startDate = new Date(year, monthIndex, 1);
    startDate.setHours(0, 0, 0, 0);
    
    // Create end date (last day of month at 23:59:59)
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  async ngOnInit(): Promise<void> {
    this.initializeMonths();
    await this.loadCardsData();
  }

  ngAfterViewInit(): void {
    this.crearGrafico();
  }

  async loadCardsData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');
      
      // Get date range for selected month
      const { startDate, endDate } = this.getDateRangeForSelectedMonth();
      
      // Load all data in parallel from database with date filtering
      const [cardsData, statsData, transactionsData] = await Promise.all([
        firstValueFrom(this.cardsService.getCards()),
        firstValueFrom(this.cardsService.getCardsStats()).catch(() => null),
        this.transactionsService.search({ 
          pageSize: 50,
          dateFrom: startDate,
          dateTo: endDate
        })
      ]);
      
      this.cards.set(cardsData || []);
      this.cardsStats.set(statsData);
      
      // Transform transactions to component format with proper typing
      const transformedTransactions = (transactionsData?.data || []).map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        cardNumber: `•••• ${t.card?.lastFour || t.account?.lastFour || '0000'}`,
        date: this.formatDate(t.transactionDate),
        icon: t.category?.icon || '💳',
        category: t.category?.name
      }));
      
      this.recentTransactions.set(transformedTransactions);
      
      // Calculate totals from real data
      this.calculateTotals();
      
    } catch (error) {
      console.error('Error loading cards data:', error);
      this.error.set('Error al cargar los datos de las tarjetas');
      // Set empty data on error
      this.cards.set([]);
      this.recentTransactions.set([]);
      this.cardsStats.set(null);
    } finally {
      this.loading.set(false);
    }
  }
  
  calculateTotals(): void {
    const cards = this.cards();
    const stats = this.cardsStats();
    
    // All calculations based on real database data
    if (stats) {
      this.totalBalance.set(stats.totalBalance || 0);
      // Calculate total spending from real transactions
      const totalSpent = this.recentTransactions()
        .reduce((sum, t) => sum + t.amount, 0);
      this.totalGastado.set(totalSpent);
    } else {
      // Fallback calculation from cards data
      this.totalBalance.set(cards.reduce((sum, card) => sum + (card.balance || 0), 0));
      // Calculate spending from transactions
      const totalSpent = this.recentTransactions()
        .reduce((sum, t) => sum + t.amount, 0);
      this.totalGastado.set(totalSpent);
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time component for accurate date comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else {
      // Calculate days difference for more precise formatting
      const diffTime = today.getTime() - compareDate.getTime();
      const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        // For dates within a week, show day name
        return date.toLocaleDateString('es-ES', { 
          weekday: 'short',
          day: 'numeric' 
        });
      } else {
        // For older dates, show month and day
        return date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short',
          year: date.getFullYear() !== today.getFullYear() ? '2-digit' : undefined
        });
      }
    }
  }

  // Card type helper method
  getCardTypeLabel(type: string): string {
    switch (type) {
      case 'CREDIT':
        return 'Crédito';
      case 'DEBIT':
        return 'Débito';
      case 'PREPAID':
        return 'Prepaga';
      case 'WALLET':
        return 'Wallet';
      default:
        return 'Tarjeta';
    }
  }
  
  getCardIcon(type: string): string {
    switch (type) {
      case 'CREDIT':
        return '💳';
      case 'DEBIT':
        return '💳';
      case 'PREPAID':
        return '💳';
      case 'WALLET':
        return '👛';
      default:
        return '💳';
    }
  }
  
  getCardNumber(card: Card): string {
    return `•••• •••• •••• ${card.lastFour}`;
  }
  
  getCardSpending(card: Card): number {
    // Calculate spending from recent transactions
    return this.recentTransactions()
      .filter(t => t.cardNumber.includes(card.lastFour))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  calculateSpendPercentage(): number {
    // Calculate percentage based on actual spending vs previous month
    const currentSpending = this.totalGastado();
    // For now, calculate based on current spending relative to a baseline
    // In a real implementation, you'd compare with previous month data
    const baseline = 10000; // This should come from previous month data
    return baseline > 0 ? ((currentSpending / baseline) * 100) : 0;
  }

  calculateCreditUtilization(): number {
    const stats = this.cardsStats();
    if (stats && stats.totalCreditLimit > 0) {
      const usedCredit = stats.totalCreditLimit - (stats.totalBalance || 0);
      return (usedCredit / stats.totalCreditLimit) * 100;
    }
    return 0;
  }

  calculateMonthOverMonthGrowth(): number {
    // Calculate growth based on current cards vs previous month
    const currentCards = this.cards().length;
    // This should compare with previous month's card count
    const previousMonthCards = Math.max(0, currentCards - 1); // Simplified logic
    return previousMonthCards > 0 ? ((currentCards - previousMonthCards) / previousMonthCards) * 100 : 0;
  }

  // Month selector and export methods
  onMonthChange(month: string): void {
    this.selectedMonth.set(month);
    // Reload data for the selected month
    this.loadCardsData();
  }

  async exportCardsData(): Promise<void> {
    try {
      const data = await firstValueFrom(this.cardsService.exportCardsData('json'));
      // Create download link
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cards-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting cards data:', error);
      this.error.set('Error al exportar los datos');
    }
  }
  openAddCardModal() {
    this.showAddCardModal.set(true);
    const currentCards = this.cards();
    this.newCard = {
      type: 'CREDIT',
      name: '',
      lastFour: '',
      bankName: '',
      color: this.availableColors[currentCards.length % this.availableColors.length],
      icon: this.availableIcons[currentCards.length % this.availableIcons.length],
      creditLimit: 0,
      initialBalance: 0
    };
  }

  closeAddCardModal() {
    this.showAddCardModal.set(false);
  }

  async addNewCard() {
    if (this.newCard.name && this.newCard.lastFour && this.newCard.bankName) {
      try {
        this.loading.set(true);
        
        // Create card in database
        const cardData = {
          name: this.newCard.name,
          type: this.newCard.type,
          lastFour: this.newCard.lastFour,
          bankName: this.newCard.bankName,
          color: this.newCard.color,
          icon: this.newCard.icon,
          creditLimit: this.newCard.type === 'CREDIT' ? this.newCard.creditLimit : undefined,
          initialBalance: this.newCard.initialBalance
        };
        
        const createdCard = await firstValueFrom(this.cardsService.createCard(cardData));
        
        // Reload data from database to ensure consistency
        await this.loadCardsData();
        
        this.closeAddCardModal();
        
      } catch (error) {
        console.error('Error creating card:', error);
        this.error.set('Error al crear la tarjeta');
      } finally {
        this.loading.set(false);
      }
    }
  }
  
  async deleteCard(cardId: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      try {
        await firstValueFrom(this.cardsService.deleteCard(cardId));
        
        // Reload data from database to ensure consistency
        await this.loadCardsData();
        
      } catch (error) {
        console.error('Error deleting card:', error);
        this.error.set('Error al eliminar la tarjeta');
      }
    }
  }
  
  async toggleCardStatus(cardId: string, isActive: boolean): Promise<void> {
    try {
      const updatedCard = await firstValueFrom(this.cardsService.toggleCardStatus(cardId, isActive));
      
      // Reload data from database to ensure consistency
      await this.loadCardsData();
      
    } catch (error) {
      console.error('Error toggling card status:', error);
      this.error.set('Error al cambiar el estado de la tarjeta');
    }
  }

  crearGrafico() {
    const cards = this.cards();
    const transactions = this.recentTransactions();
    
    if (cards.length === 0) {
      // Show empty state for no cards
      const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#94A3B8';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Sin tarjetas registradas', canvas.width / 2, canvas.height / 2);
        }
      }
      return;
    }
    
    // Calculate spending data from real transactions
    const spendingData = cards.map(card => {
      const cardTransactions = transactions.filter(t => t.cardNumber.includes(card.lastFour));
      return cardTransactions.reduce((sum, t) => sum + t.amount, 0);
    });
    
    const hasSpending = spendingData.some(amount => amount > 0);
    
    if (!hasSpending) {
      // Show empty state for no spending data
      const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#94A3B8';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Sin datos de gastos este mes', canvas.width / 2, canvas.height / 2);
        }
      }
      return;
    }
    
    // Create chart with real database data
    new Chart('pieChart', {
      type: 'doughnut',
      data: {
        labels: cards.map(c => `${c.name} (•••• ${c.lastFour})`),
        datasets: [{
          data: spendingData,
          backgroundColor: cards.map(c => c.color || '#00D4AA'),
          borderColor: '#0A0A0F',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#F8FAFC',
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}