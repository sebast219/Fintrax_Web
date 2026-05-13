import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../../layout/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService, DashboardSummary, MonthlyTrend } from '../../../core/services/dashboard.service';
import { TransactionsService, Transaction as ApiTransaction, CreateTransactionDto } from '../../../core/services/transactions.service';
import { BudgetsService, Budget, CreateBudgetDto } from '../../../core/services/budgets.service';
import { GoalsService, Goal as ApiGoal, CreateGoalDto } from '../../../core/services/goals.service';
import { CategoriesService, Category } from '../../../core/services/categories.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  name: string;
  description: string;
  category: string;
  date: string;
  icon?: string;
}

interface BudgetItem {
  category: string;
  label: string;
  spent: number;
  total: number;
  color: string;
}

interface Goal {
  id: string;
  icon: string;
  category: string;
  name: string;
  target: number;
  current: number;
}

interface GoalCategory {
  value: string;
  label: string;
  icon: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Data from API
  dashboardSummary: DashboardSummary | null = null;
  monthlyTrends: MonthlyTrend[] = [];
  budgets: Budget[] = [];
  allGoals: ApiGoal[] = [];
  allCategories: Category[] = [];
  transactions: Transaction[] = [];
  loading = true;
  showNotifications = false;
  showTransactionModal = false;
  showAllTransactionsModal = false;
  showBudgetModal = false;
  showGoalModal = false;
  transactionType: 'income' | 'expense' = 'income';
  
  // Estado financiero (usando dashboard service)
  financialState = signal<any | null>(null);
  showAllocationModal = false;
  showDeallocationModal = false;
  selectedGoalForAllocation: ApiGoal | null = null;
  allocationForm = { amount: 0, accountId: '', note: '' };
  deallocationForm = { amount: 0, accountId: '', note: '' };
  
  // Formulario de transacción
  transactionForm = {
    amount: '',
    name: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  };

  // Mes seleccionado
  selectedMonth!: string;
  months!: string[];

  // Dropdown properties
  showMonthDropdown = signal<boolean>(false);
  showTransactionCategoryDropdown = signal<boolean>(false);
  showGoalCategoryDropdown = signal<boolean>(false);
  showBudgetCategoryDropdown = signal<boolean>(false);
  showAllocationAccountDropdown = signal<boolean>(false);
  showDeallocationAccountDropdown = signal<boolean>(false);

  private monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Rango del gráfico
  chartRange: '6M' | '1A' | 'ALL' = '6M';

  // Toasts
  toasts: Toast[] = [];
  toastIdCounter = 0;

  // Datos filtrados por mes
  filteredTransactions: Transaction[] = [];

  // Datos calculados para insights
  categorySpending: { [key: string]: number } = {};
  previousMonthExpense = 0; // Se calculará dinámicamente
  previousMonthIncome = 0; // Se calculará dinámicamente

  // Categorías disponibles
  incomeCategories = [
    { value: 'salary', label: 'Salario', icon: '💼' },
    { value: 'freelance', label: 'Freelance', icon: '💻' },
    { value: 'investment', label: 'Inversiones', icon: '📈' },
    { value: 'gift', label: 'Regalos', icon: '🎁' },
    { value: 'other_income', label: 'Otros', icon: '💵' }
  ];

  expenseCategories = [
    { value: 'food', label: 'Alimentos', icon: '🛒' },
    { value: 'transport', label: 'Transporte', icon: '🚗' },
    { value: 'utilities', label: 'Servicios', icon: '⚡' },
    { value: 'entertainment', label: 'Entretenimiento', icon: '🎮' },
    { value: 'health', label: 'Salud', icon: '🏥' },
    { value: 'shopping', label: 'Compras', icon: '🛍️' },
    { value: 'education', label: 'Educación', icon: '📚' },
    { value: 'other_expense', label: 'Otros', icon: '📦' }
  ];

  // Transacciones recientes (loaded from API)
  recentTransactions: Transaction[] = [];

  // Presupuesto (loaded from API)
  budgetItems: BudgetItem[] = [];
  editingBudget: BudgetItem | null = null;
  budgetForm = { category: '', label: '', total: 0 };
  showCreateBudgetModal = false;

  // Metas (from API)
  goals: Goal[] = [];
  
  // Transform API goals to component format
  private transformApiGoals() {
    this.goals = this.allGoals.map(goal => ({
      id: goal.id,
      icon: goal.category.icon,
      category: goal.category.id,
      name: goal.name,
      target: goal.target,
      current: goal.current
    }));
  }
  editingGoal: Goal | null = null;
  goalForm = { icon: '', category: '', name: '', target: 0, current: 0 };

  // Categorías de metas
  goalCategories: GoalCategory[] = [
    { value: 'emergency', label: 'Fondo de Emergencia', icon: '🏖️' },
    { value: 'travel', label: 'Viajes', icon: '✈️' },
    { value: 'tech', label: 'Tecnología', icon: '💻' },
    { value: 'home', label: 'Hogar', icon: '🏠' },
    { value: 'car', label: 'Vehículo', icon: '🚗' },
    { value: 'education', label: 'Educación', icon: '📚' },
    { value: 'health', label: 'Salud', icon: '🏥' },
    { value: 'investment', label: 'Inversión', icon: '📈' },
    { value: 'gift', label: 'Regalos', icon: '🎁' },
    { value: 'other', label: 'Otro', icon: '🎯' }
  ];

  getIconForGoalCategory(categoryValue: string): string {
    const category = this.goalCategories.find(c => c.value === categoryValue);
    return category?.icon || '🎯';
  }

  // Inyectar servicios
  auth = inject(AuthService);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private transactionsService = inject(TransactionsService);
  private budgetsService = inject(BudgetsService);
  private goalsService = inject(GoalsService);
  private categoriesService = inject(CategoriesService);
  
  constructor(private renderer: Renderer2, private el: ElementRef) { }
  
  async loadDashboardData() {
    try {
      this.loading = true;
      
      // Load all data in parallel
      const [
        summary,
        trends,
        budgets,
        goals,
        categories,
        transactionsData
      ] = await Promise.all([
        this.dashboardService.getSummary(),
        this.dashboardService.getTrends(6),
        this.budgetsService.getAll(),
        this.goalsService.getAll(),
        this.categoriesService.getAll(),
        this.transactionsService.search({ pageSize: 50 })
      ]);

      this.dashboardSummary = summary;
      this.monthlyTrends = trends;
      this.budgets = budgets;
      this.allGoals = goals;
      this.allCategories = categories;
      
      // Create a simple financial state from dashboard summary
      this.financialState.set({
        confirmedBalance: {
          totalBalance: summary.totalBalance,
          availableBalance: summary.totalBalance * 0.7, // Estimate
          allocatedBalance: summary.totalBalance * 0.3  // Estimate
        },
        monthlyIncome: {
          confirmed: summary.monthlyIncome
        },
        monthlyExpense: {
          confirmed: summary.monthlyExpenses
        },
        savingsRate: {
          confirmed: summary.monthlyIncome > 0 ? Math.round(((summary.monthlyIncome - summary.monthlyExpenses) / summary.monthlyIncome) * 100) : 0
        }
      });
      
      // Transform API transactions to component format
      this.transactions = transactionsData.data.map((t: any) => ({
        id: t.id,
        type: t.type.toLowerCase() as 'income' | 'expense',
        amount: t.amount,
        name: t.description,
        description: t.description,
        category: t.category.name,
        date: t.transactionDate,
        icon: t.category.icon
      }));
      
      // Transform API goals to component format
      this.transformApiGoals();
      
      this.filteredTransactions = [...this.transactions];
      this.calculateCategorySpending();
      this.calculatePreviousMonthValues();
      this.updateBudgetFromTransactions();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showToast('Error al cargar los datos del dashboard', 'warning');
    } finally {
      this.loading = false;
    }
  }

  async ngOnInit() {
    this.generateMonths();
    this.updateBlurPosition();
    await this.loadDashboardData();
  }

  generateMonths() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Generar últimos 6 meses (incluyendo el actual)
    this.months = [];
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      this.months.push(`${this.monthNames[monthIndex]} ${year}`);
    }

    // Mes seleccionado por defecto: mes actual
    this.selectedMonth = this.months[0];
  }
  
  ngAfterViewInit() {
    this.updateBlurPosition();
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => this.updateBlurPosition());
    window.addEventListener('scroll', () => this.updateBlurPosition());
  }
  
  updateBlurPosition() {
    // El dashboard ahora está protegido por AuthGuard, así que siempre hay usuario
    const chartSection = this.el.nativeElement.querySelector('.chart-section');
    const blurOverlay = this.el.nativeElement.querySelector('.blur-overlay');
    
    if (chartSection && blurOverlay) {
      const rect = chartSection.getBoundingClientRect();
      // Con position: fixed, usamos directamente la posición relativa a la viewport
      const topPosition = rect.top;
      
      this.renderer.setStyle(blurOverlay, 'top', `${topPosition}px`);
    }
  }
  
  toggleNotifications() {
    console.log('toggleNotifications called');
    this.showNotifications = !this.showNotifications;
    console.log('showNotifications:', this.showNotifications);
  }
  
  closeNotifications() {
    console.log('closeNotifications called');
    this.showNotifications = false;
  }
  
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Métodos para el modal de transacciones
  openTransactionModal(type: 'income' | 'expense') {
    this.transactionType = type;
    this.showTransactionModal = true;
    // Reset form
    this.transactionForm = {
      amount: '',
      name: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
  }

  getCategories(): { value: string; label: string; icon: string }[] {
    // Use actual categories from API
    const categories = this.allCategories
      .filter(c => c.type === (this.transactionType === 'income' ? 'INCOME' : 'EXPENSE'))
      .map(c => ({
        value: c.name,
        label: c.name,
        icon: c.icon
      }));
    
    // Fallback to hardcoded categories if API categories are empty
    return categories.length > 0 ? categories : 
      (this.transactionType === 'income' ? this.incomeCategories : this.expenseCategories);
  }

  getCategoryIcon(categoryValue: string): string {
    const categories = this.getCategories();
    const category = categories.find(c => c.value === categoryValue);
    return category?.icon || '📦';
  }

  async submitTransaction() {
    if (!this.transactionForm.amount || !this.transactionForm.description || !this.transactionForm.category) {
      return;
    }

    try {
      // Find the category ID from the category name
      const category = this.allCategories.find(c => c.name === this.transactionForm.category);
      if (!category) {
        this.showToast('Categoría no válida', 'warning');
        return;
      }

      // Create transaction via API
      const newTransaction: CreateTransactionDto = {
        accountId: 'default-account', // TODO: Get from user accounts
        categoryId: category.id,
        type: this.transactionType.toUpperCase() as 'INCOME' | 'EXPENSE',
        amount: parseFloat(this.transactionForm.amount),
        description: this.transactionForm.description,
        transactionDate: this.transactionForm.date,
        isRecurring: false
      };

      const createdTransaction = await this.transactionsService.create(newTransaction);
      
      // Transform to component format and add to local array
      const transaction: Transaction = {
        id: createdTransaction.id,
        type: this.transactionType,
        amount: createdTransaction.amount,
        name: createdTransaction.description,
        description: createdTransaction.description,
        category: createdTransaction.category.name,
        date: createdTransaction.transactionDate,
        icon: createdTransaction.category.icon
      };

      // Add to beginning of array
      this.transactions.unshift(transaction);
      this.filteredTransactions.unshift(transaction);

      // Recalculate and sync with budget
      this.calculateCategorySpending();
      this.updateBudgetFromTransactions();

      // Close modal
      this.closeTransactionModal();
      this.showToast('Transacción guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error creating transaction:', error);
      this.showToast('Error al guardar la transacción', 'warning');
    }
  }

  // ========== KPI CALCULATIONS (using API data V2) ==========
  get totalBalance(): number {
    // Usar el nuevo estado financiero V2 si está disponible
    const state = this.financialState();
    if (state) return state.confirmedBalance.totalBalance;
    return this.dashboardSummary?.totalBalance || 0;
  }

  get monthlyIncome(): number {
    const state = this.financialState();
    if (state) return state.monthlyIncome.confirmed;
    return this.dashboardSummary?.monthlyIncome || 0;
  }

  get monthlyExpense(): number {
    const state = this.financialState();
    if (state) return state.monthlyExpense.confirmed;
    return this.dashboardSummary?.monthlyExpenses || 0;
  }

  get savingsRate(): number {
    const state = this.financialState();
    if (state) return state.savingsRate.confirmed;
    
    // Fallback a cálculo original
    const income = this.monthlyIncome;
    const expense = this.monthlyExpense;
    if (income === 0) return 0;
    return Math.round(((income - expense) / income) * 100);
  }

  // Nuevos getters para el balance desglosado V2
  get availableBalance(): number {
    return this.financialState()?.confirmedBalance.availableBalance || 0;
  }

  get allocatedBalance(): number {
    return this.financialState()?.confirmedBalance.allocatedBalance || 0;
  }

  get financialRecommendation() {
    const state = this.financialState();
    if (!state) return null;
    // Por ahora retornar null hasta que implementemos las recomendaciones V2
    return null;
  }

  // ========== CATEGORY SPENDING CALCULATION ==========
  calculateCategorySpending() {
    this.categorySpending = {};
    this.filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        this.categorySpending[t.category] = (this.categorySpending[t.category] || 0) + t.amount;
      });
  }

  // Calculate previous month values dynamically
  calculatePreviousMonthValues() {
    const currentDate = new Date();
    const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    // Filter transactions from previous month
    const previousMonthTransactions = this.transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= previousMonthDate && tDate <= previousMonthEnd;
    });
    
    // Calculate previous month income and expenses
    this.previousMonthIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.previousMonthExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getCategorySpending(category: string): number {
    return this.categorySpending[category] || 0;
  }

  getCategorySpendingTrend(category: string): number {
    const currentDate = new Date();
    const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    // Calculate current month spending for this category
    const current = this.getCategorySpending(category);
    
    // Calculate previous month spending for this category
    const previousMonthTransactions = this.transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && 
             t.category === category &&
             tDate >= previousMonthDate && 
             tDate <= previousMonthEnd;
    });
    
    const previous = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Actualizar presupuesto cuando cambian las transacciones
  updateBudgetFromTransactions() {
    // Convert API budgets to component format
    this.budgetItems = this.budgets.map(budget => ({
      category: budget.category.id,
      label: budget.category.name,
      spent: budget.spent,
      total: budget.amount,
      color: 'bg-blue-500'
    }));
  }

  // ========== MONTH SELECTOR ==========
  onMonthChange(month: string) {
    this.selectedMonth = month;
    this.filterTransactionsByMonth(month);
    this.calculateCategorySpending();
    this.updateBudgetFromTransactions();
    this.showToast(`Mes cambiado a ${month}`, 'info');
  }

  filterTransactionsByMonth(month: string) {
    // Extraer mes y año del string "Mes Año"
    const [monthName, yearStr] = month.split(' ');
    const year = parseInt(yearStr);
    const monthIndex = this.monthNames.indexOf(monthName);

    if (monthIndex === -1) {
      this.filteredTransactions = [...this.recentTransactions];
      return;
    }

    // Filtrar transacciones que corresponden al mes seleccionado
    this.filteredTransactions = this.recentTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === monthIndex && tDate.getFullYear() === year;
    });

    // Si no hay datos para ese mes, mostrar todos (simulado)
    if (this.filteredTransactions.length === 0) {
      this.filteredTransactions = [...this.recentTransactions];
    }
  }

  // KPI calculados de transacciones filtradas
  get filteredMonthlyIncome(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get filteredMonthlyExpense(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get filteredTotalBalance(): number {
    return this.filteredMonthlyIncome - this.filteredMonthlyExpense;
  }

  get filteredSavingsRate(): number {
    const income = this.filteredMonthlyIncome;
    if (income === 0) return 0;
    return Math.round(((income - this.filteredMonthlyExpense) / income) * 100);
  }

  // ========== EXPORT DATA ==========
  exportData() {
    const data = {
      transactions: this.recentTransactions,
      month: this.selectedMonth,
      summary: {
        income: this.monthlyIncome,
        expense: this.monthlyExpense,
        balance: this.totalBalance
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrax-data-${this.selectedMonth.toLowerCase().replace(' ', '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Datos exportados correctamente', 'success');
  }

  // ========== CHART RANGE ==========
  setChartRange(range: '6M' | '1A' | 'ALL') {
    this.chartRange = range;
    this.showToast(`Gráfico actualizado: ${range}`, 'info');
  }

  // ========== TOASTS ==========
  showToast(message: string, type: 'success' | 'info' | 'warning' = 'info') {
    const id = ++this.toastIdCounter;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.removeToast(id), 3000);
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  // ========== ALL TRANSACTIONS MODAL ==========
  openAllTransactionsModal() {
    this.showAllTransactionsModal = true;
  }

  closeAllTransactionsModal() {
    this.showAllTransactionsModal = false;
  }

  async deleteTransaction(id: string) {
    try {
      await this.transactionsService.delete(id);
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.filteredTransactions = this.filteredTransactions.filter(t => t.id !== id);
      this.calculateCategorySpending();
      this.updateBudgetFromTransactions();
      this.showToast('Transacción eliminada', 'warning');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      this.showToast('Error al eliminar la transacción', 'warning');
    }
  }

  // ========== BUDGET MODAL ==========
  openBudgetModal() {
    this.showCreateBudgetModal = true;
    this.budgetForm = { category: '', label: '', total: 0 };
  }

  closeBudgetModal() {
    this.showBudgetModal = false;
    this.showCreateBudgetModal = false;
    this.editingBudget = null;
    this.budgetForm = { category: '', label: '', total: 0 };
  }

  openCreateBudgetModal() {
    this.showCreateBudgetModal = true;
    this.budgetForm = { category: '', label: '', total: 0 };
  }

  saveBudget() {
    if (this.editingBudget) {
      // Actualizar existente
      const index = this.budgetItems.findIndex(b => b.category === this.editingBudget!.category);
      if (index !== -1) {
        this.budgetItems[index] = {
          ...this.editingBudget,
          spent: this.getCategorySpending(this.editingBudget.category)
        };
      }
    } else if (this.showCreateBudgetModal && this.budgetForm.category && this.budgetForm.label) {
      // Crear nuevo
      const newBudget: BudgetItem = {
        category: this.budgetForm.category,
        label: this.budgetForm.label,
        spent: this.getCategorySpending(this.budgetForm.category),
        total: this.budgetForm.total,
        color: 'bg-blue-500'
      };
      this.budgetItems.push(newBudget);
    }
    this.closeBudgetModal();
    this.showToast('Presupuesto guardado', 'success');
  }

  deleteBudget(category: string) {
    this.budgetItems = this.budgetItems.filter(b => b.category !== category);
    this.showToast('Presupuesto eliminado', 'warning');
  }

  confirmDeleteBudget(item: BudgetItem) {
    if (confirm(`¿Estás seguro de eliminar el presupuesto de "${item.label}"?`)) {
      this.deleteBudget(item.category);
    }
  }

  openBudgetItemModal(item: BudgetItem) {
    this.editingBudget = { ...item };
    this.budgetForm = { category: item.category, label: item.label, total: item.total };
    this.showCreateBudgetModal = true;
  }

  // Categorías disponibles para presupuesto (las que no están usadas)
  getAvailableBudgetCategories(): { value: string; label: string; icon: string }[] {
    const usedCategories = this.budgetItems.map(b => b.category);
    return this.expenseCategories.filter(c => !usedCategories.includes(c.value));
  }

  // ========== CHART DATA METHODS ==========
  getBaseMonth(): Date {
    // Extraer mes y año del selectedMonth (formato: "Mes Año")
    if (!this.selectedMonth) return new Date();

    const [monthName, yearStr] = this.selectedMonth.split(' ');
    const year = parseInt(yearStr);
    const monthIndex = this.monthNames.indexOf(monthName);

    if (monthIndex === -1) return new Date();

    return new Date(year, monthIndex, 1);
  }

  getMonthlyData(): { month: string; income: number; expense: number; balance: number }[] {
    // Use API trends data instead of calculating from transactions
    return this.monthlyTrends.map(trend => {
      const date = new Date(trend.month + '-01');
      const monthName = this.monthNames[date.getMonth()];
      
      return {
        month: monthName.substring(0, 3), // Abreviado: Ene, Feb, etc.
        income: trend.income,
        expense: trend.expenses,
        balance: trend.balance
      };
    });
  }

  // Calcular coordenadas SVG para el gráfico
  getChartCoordinates(data: { income: number; expense: number }[]): { incomePoints: string; expensePoints: string; incomeArea: string; expenseArea: string } {
    if (data.length === 0) {
      return { incomePoints: '', expensePoints: '', incomeArea: '', expenseArea: '' };
    }

    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
    const width = 800;
    const height = 300;
    const padding = 20;
    const chartHeight = height - padding * 2;
    const stepX = width / (data.length - 1);

    // Generar puntos para ingresos (línea verde)
    const incomePoints: [number, number][] = data.map((d, i) => {
      const x = i * stepX;
      const y = padding + chartHeight - (d.income / maxValue) * chartHeight;
      return [x, y];
    });

    // Generar puntos para gastos (línea roja)
    const expensePoints: [number, number][] = data.map((d, i) => {
      const x = i * stepX;
      const y = padding + chartHeight - (d.expense / maxValue) * chartHeight;
      return [x, y];
    });

    // Crear path suave con curvas贝塞尔
    const createSmoothPath = (points: [number, number][]): string => {
      if (points.length < 2) return '';

      let path = `M ${points[0][0]} ${points[0][1]}`;

      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const cpx1 = current[0] + (next[0] - current[0]) / 3;
        const cpy1 = current[1];
        const cpx2 = current[0] + 2 * (next[0] - current[0]) / 3;
        const cpy2 = next[1];
        path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next[0]} ${next[1]}`;
      }

      return path;
    };

    const incomePath = createSmoothPath(incomePoints);
    const expensePath = createSmoothPath(expensePoints);

    // Crear áreas (path + línea inferior)
    const incomeArea = `${incomePath} L ${width} ${height} L 0 ${height} Z`;
    const expenseArea = `${expensePath} L ${width} ${height} L 0 ${height} Z`;

    return {
      incomePoints: incomePath,
      expensePoints: expensePath,
      incomeArea,
      expenseArea
    };
  }

  getChartPoints(): { cx: number; cy: number; type: 'income' | 'expense' }[] {
    const data = this.getMonthlyData();
    if (data.length === 0) return [];

    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
    const width = 800;
    const height = 300;
    const padding = 20;
    const chartHeight = height - padding * 2;
    const stepX = width / (data.length - 1);

    const points: { cx: number; cy: number; type: 'income' | 'expense' }[] = [];

    data.forEach((d, i) => {
      const x = i * stepX;
      const incomeY = padding + chartHeight - (d.income / maxValue) * chartHeight;
      const expenseY = padding + chartHeight - (d.expense / maxValue) * chartHeight;

      points.push({ cx: x, cy: incomeY, type: 'income' });
      points.push({ cx: x, cy: expenseY, type: 'expense' });
    });

    return points;
  }

  // ========== INSIGHTS METHODS (using API data) ==========
  getTopSpendingCategory(): { label: string; amount: number; percentage: number } | null {
    if (!this.dashboardSummary?.expensesByCategory || this.dashboardSummary.expensesByCategory.length === 0) {
      return null;
    }

    const totalExpense = this.dashboardSummary.expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
    if (totalExpense === 0) return null;

    // Find the category with highest expense
    const topCategory = this.dashboardSummary.expensesByCategory.reduce((max, cat) => 
      cat.amount > max.amount ? cat : max
    );

    return {
      label: topCategory.category.name,
      amount: topCategory.amount,
      percentage: Math.round((topCategory.amount / totalExpense) * 100)
    };
  }

  getBudgetInsight(): { label: string; percentage: number } | null {
    if (this.budgetItems.length === 0) return null;

    // Encontrar el presupuesto más crítico (mayor porcentaje usado)
    const criticalBudget = this.budgetItems
      .map(b => ({
        label: b.label,
        percentage: (b.spent / b.total) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)[0];

    return criticalBudget || null;
  }

  get totalBudgetSpent(): number {
    return this.budgetItems.reduce((sum, item) => sum + item.spent, 0);
  }

  get totalBudgetTotal(): number {
    return this.budgetItems.reduce((sum, item) => sum + item.total, 0);
  }

  get totalBudgetPercentage(): number {
    if (this.totalBudgetTotal === 0) return 0;
    return Math.round((this.totalBudgetSpent / this.totalBudgetTotal) * 100);
  }

  // ========== GOALS MODAL ==========
  openGoalModal(goal?: Goal) {
    if (goal) {
      this.editingGoal = goal;
      this.goalForm = { ...goal };
    } else {
      this.editingGoal = null;
      this.goalForm = { icon: '', category: '', name: '', target: 0, current: 0 };
    }
    this.showGoalModal = true;
  }

  closeGoalModal() {
    this.showGoalModal = false;
    this.editingGoal = null;
  }

  saveGoal() {
    // Obtener icono según categoría
    const icon = this.getIconForGoalCategory(this.goalForm.category);

    if (this.editingGoal) {
      const index = this.goals.findIndex(g => g.id === this.editingGoal!.id);
      if (index !== -1) {
        this.goals[index] = { ...this.editingGoal, ...this.goalForm, icon };
      }
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        icon,
        category: this.goalForm.category,
        name: this.goalForm.name,
        target: this.goalForm.target,
        current: this.goalForm.current
      };
      this.goals.push(newGoal);
    }
    this.closeGoalModal();
    this.showToast('Meta guardada exitosamente', 'success');
  }

  deleteGoal(id: string) {
    this.goals = this.goals.filter(g => g.id !== id);
    this.showToast('Meta eliminada', 'warning');
  }

  confirmDeleteGoal(goal: Goal) {
    if (confirm(`¿Estás seguro de eliminar la meta "${goal.name}"?`)) {
      this.deleteGoal(goal.id);
    }
  }

  getGoalPercentage(goal: Goal): number {
    if (goal.target === 0) return 0;
    return Math.round((goal.current / goal.target) * 100);
  }

  // ========== GOAL ALLOCATION METHODS ==========
  openAllocationModal(goal: Goal) {
    this.selectedGoalForAllocation = goal as any; // Type assertion to fix interface mismatch
    this.allocationForm = { 
      amount: 0, 
      accountId: '', 
      note: `Asignación a meta: ${goal.name}` 
    };
    this.showAllocationModal = true;
  }

  closeAllocationModal() {
    this.showAllocationModal = false;
    this.selectedGoalForAllocation = null;
    this.allocationForm = { amount: 0, accountId: '', note: '' };
  }

  async allocateToGoal() {
    // Placeholder implementation since financial-v2 service is not available
    this.showToast('Función de asignación no disponible temporalmente', 'info');
    this.closeAllocationModal();
  }

  openDeallocationModal(goal: Goal) {
    this.selectedGoalForAllocation = goal as any; // Type assertion to fix interface mismatch
    this.deallocationForm = { 
      amount: 0, 
      accountId: '', 
      note: `Desasignación de meta: ${goal.name}` 
    };
    this.showDeallocationModal = true;
  }

  closeDeallocationModal() {
    this.showDeallocationModal = false;
    this.selectedGoalForAllocation = null;
    this.deallocationForm = { amount: 0, accountId: '', note: '' };
  }

  async deallocateFromGoal() {
    // Placeholder implementation since financial-v2 service is not available
    this.showToast('Función de desasignación no disponible temporalmente', 'info');
    this.closeDeallocationModal();
  }

  getMaxAllocatableAmount(goal: Goal): number {
    // Simple calculation based on available balance
    const state = this.financialState();
    if (!state) return 0;
    return Math.floor(state.confirmedBalance.availableBalance * 0.8); // 80% of available balance
  }

  getMaxDeallocatableAmount(goal: Goal): number {
    // Simple calculation based on current goal amount
    return Math.floor(Number(goal.current) * 0.9); // 90% of current amount
  }

  canAllocateToGoal(goal: Goal, amount: number): boolean {
    const maxAllocatable = this.getMaxAllocatableAmount(goal);
    return amount <= maxAllocatable && amount > 0;
  }

  canDeallocateFromGoal(goal: Goal, amount: number): boolean {
    const maxDeallocatable = this.getMaxDeallocatableAmount(goal);
    return amount <= maxDeallocatable && amount > 0;
  }

  navigateToSettings() {
    this.showToast('Módulo de configuración - Próximamente', 'info');
  }

  navigateToReports() {
    this.router.navigate(['/reports']);
  }

  // Dropdown methods
  toggleDropdown(dropdownName: string): void {
    // Close all dropdowns first
    this.showMonthDropdown.set(false);
    this.showTransactionCategoryDropdown.set(false);
    this.showGoalCategoryDropdown.set(false);
    this.showBudgetCategoryDropdown.set(false);
    this.showAllocationAccountDropdown.set(false);
    this.showDeallocationAccountDropdown.set(false);
    
    // Open the selected dropdown
    switch (dropdownName) {
      case 'month':
        this.showMonthDropdown.set(!this.showMonthDropdown());
        break;
      case 'transactionCategory':
        this.showTransactionCategoryDropdown.set(!this.showTransactionCategoryDropdown());
        break;
      case 'goalCategory':
        this.showGoalCategoryDropdown.set(!this.showGoalCategoryDropdown());
        break;
      case 'budgetCategory':
        this.showBudgetCategoryDropdown.set(!this.showBudgetCategoryDropdown());
        break;
      case 'allocationAccount':
        this.showAllocationAccountDropdown.set(!this.showAllocationAccountDropdown());
        break;
      case 'deallocationAccount':
        this.showDeallocationAccountDropdown.set(!this.showDeallocationAccountDropdown());
        break;
    }
  }

  closeAllDropdowns(): void {
    this.showMonthDropdown.set(false);
    this.showTransactionCategoryDropdown.set(false);
    this.showGoalCategoryDropdown.set(false);
    this.showBudgetCategoryDropdown.set(false);
    this.showAllocationAccountDropdown.set(false);
    this.showDeallocationAccountDropdown.set(false);
  }

  selectDropdownOption(dropdownName: string, value: string): void {
    switch (dropdownName) {
      case 'month':
        this.selectedMonth = value;
        this.onMonthChange(value);
        break;
      case 'transactionCategory':
        this.transactionForm.category = value;
        break;
      case 'goalCategory':
        // Handle goal category selection
        break;
      case 'budgetCategory':
        // Handle budget category selection
        break;
      case 'allocationAccount':
        this.allocationForm.accountId = value;
        break;
      case 'deallocationAccount':
        this.deallocationForm.accountId = value;
        break;
    }
    this.closeAllDropdowns();
  }

  getSelectedLabel(options: any[], currentValue: string): string {
    const option = options.find(opt => opt.value === currentValue);
    return option ? option.label : currentValue;
  }

  trackByOption(index: number, option: any): string {
    return option.value || option;
  }

  // Account options for allocation dropdowns
  accountOptions = [
    { value: '', label: '🏦 Selecciona una cuenta', icon: '🏦' },
    { value: 'default-account', label: '💳 Cuenta Principal', icon: '💳' },
    { value: 'savings-account', label: '💰 Cuenta de Ahorros', icon: '💰' },
    { value: 'investment-account', label: '📈 Cuenta de Inversión', icon: '📈' }
  ];

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.closeAllDropdowns();
    }
  }
}
