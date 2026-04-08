import { Component, OnInit, AfterViewInit, Renderer2, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../layout/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';

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
  showNotifications = false;
  showTransactionModal = false;
  showAllTransactionsModal = false;
  showBudgetModal = false;
  showGoalModal = false;
  transactionType: 'income' | 'expense' = 'income';
  
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
  previousMonthExpense = 2800; // Simulado para comparación
  previousMonthIncome = 3400; // Simulado para comparación

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

  // Transacciones recientes
  recentTransactions: Transaction[] = [
    { id: '1', type: 'income', amount: 3250.00, name: 'Salario', description: 'Salario Mensual', category: 'salary', date: '2024-11-07', icon: '💼' },
    { id: '2', type: 'expense', amount: 85.50, name: 'Supermercado', description: 'Compras semanales', category: 'food', date: '2024-11-06', icon: '🛒' },
    { id: '3', type: 'expense', amount: 120.00, name: 'Luz', description: 'Servicio Eléctrico', category: 'utilities', date: '2024-11-06', icon: '⚡' },
    { id: '4', type: 'expense', amount: 45.99, name: 'Steam', description: 'Videojuegos', category: 'entertainment', date: '2024-11-05', icon: '🎮' },
    { id: '5', type: 'expense', amount: 230.00, name: 'Gasolina', description: 'Transporte', category: 'transport', date: '2024-11-04', icon: '🚗' },
    { id: '6', type: 'income', amount: 500.00, name: 'Freelance', description: 'Proyecto web', category: 'freelance', date: '2024-11-03', icon: '💻' }
  ];

  // Presupuesto
  budgetItems: BudgetItem[] = [
    { category: 'food', label: 'Alimentos', spent: 0, total: 1500, color: 'bg-blue-500' },
    { category: 'transport', label: 'Transporte', spent: 0, total: 600, color: 'bg-blue-500' },
    { category: 'entertainment', label: 'Entretenimiento', spent: 0, total: 300, color: 'bg-blue-500' },
    { category: 'utilities', label: 'Servicios', spent: 0, total: 400, color: 'bg-blue-500' }
  ];
  editingBudget: BudgetItem | null = null;
  budgetForm = { category: '', label: '', total: 0 };
  showCreateBudgetModal = false;

  // Metas
  goals: Goal[] = [
    { id: '1', icon: '🏖️', category: 'emergency', name: 'Fondo de Emergencia', target: 10000, current: 7500 },
    { id: '2', icon: '✈️', category: 'travel', name: 'Viaje a Europa', target: 5000, current: 2000 },
    { id: '3', icon: '💻', category: 'tech', name: 'MacBook Pro', target: 2000, current: 1800 }
  ];
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

  // Inyectar AuthService
  auth = inject(AuthService);
  private router = inject(Router);
  
  constructor(private renderer: Renderer2, private el: ElementRef) { }
  
  ngOnInit() {
    this.generateMonths();
    this.updateBlurPosition();
    this.filteredTransactions = [...this.recentTransactions];
    this.calculateCategorySpending();
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
    return this.transactionType === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  getCategoryIcon(categoryValue: string): string {
    const categories = this.getCategories();
    const category = categories.find(c => c.value === categoryValue);
    return category?.icon || '📦';
  }

  submitTransaction() {
    if (!this.transactionForm.amount || !this.transactionForm.description || !this.transactionForm.category) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: this.transactionType,
      amount: parseFloat(this.transactionForm.amount),
      name: this.transactionForm.name,
      description: this.transactionForm.description,
      category: this.transactionForm.category,
      date: this.transactionForm.date,
      icon: this.getCategoryIcon(this.transactionForm.category)
    };

    // Add to beginning of array
    this.recentTransactions.unshift(newTransaction);

    // Recalcular y sincronizar con presupuesto
    this.calculateCategorySpending();
    this.updateBudgetFromTransactions();

    // Close modal
    this.closeTransactionModal();
    this.showToast('Transacción guardada exitosamente', 'success');
  }

  // ========== KPI CALCULATIONS ==========
  get totalBalance(): number {
    const income = this.recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = this.recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  }

  get monthlyIncome(): number {
    return this.recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get monthlyExpense(): number {
    return this.recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get savingsRate(): number {
    const income = this.monthlyIncome;
    const expense = this.monthlyExpense;
    if (income === 0) return 0;
    return Math.round(((income - expense) / income) * 100);
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

  getCategorySpending(category: string): number {
    return this.categorySpending[category] || 0;
  }

  getCategorySpendingTrend(category: string): number {
    const current = this.getCategorySpending(category);
    const previous = current * 0.85; // Simulado: 15% menos el mes anterior
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Actualizar presupuesto cuando cambian las transacciones
  updateBudgetFromTransactions() {
    this.budgetItems.forEach(item => {
      item.spent = this.getCategorySpending(item.category);
    });
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

  deleteTransaction(id: string) {
    this.recentTransactions = this.recentTransactions.filter(t => t.id !== id);
    this.filteredTransactions = this.filteredTransactions.filter(t => t.id !== id);
    this.calculateCategorySpending();
    this.updateBudgetFromTransactions();
    this.showToast('Transacción eliminada', 'warning');
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
    const data: { month: string; income: number; expense: number; balance: number }[] = [];
    const baseDate = this.getBaseMonth();

    // Determinar cuántos meses mostrar según el rango seleccionado
    let monthsCount = 6; // default 6M
    if (this.chartRange === '1A') monthsCount = 12;
    else if (this.chartRange === 'ALL') monthsCount = 24; // máximo 2 años

    // Generar datos desde el mes seleccionado hacia atrás
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const monthName = this.monthNames[date.getMonth()];
      const year = date.getFullYear();

      // Filtrar transacciones de este mes
      const monthTransactions = this.recentTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === year;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: monthName.substring(0, 3), // Abreviado: Ene, Feb, etc.
        income,
        expense,
        balance: income - expense
      });
    }

    return data;
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

  // ========== INSIGHTS METHODS ==========
  getTopSpendingCategory(): { label: string; amount: number; percentage: number } | null {
    const expenseTransactions = this.filteredTransactions.filter(t => t.type === 'expense');
    if (expenseTransactions.length === 0) return null;

    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    if (totalExpense === 0) return null;

    // Agrupar por categoría
    const spendingByCategory: { [key: string]: number } = {};
    expenseTransactions.forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });

    // Encontrar la categoría con mayor gasto
    let topCategory = '';
    let maxAmount = 0;
    Object.entries(spendingByCategory).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCategory = category;
      }
    });

    if (!topCategory) return null;

    // Buscar el label de la categoría
    const categoryInfo = this.expenseCategories.find(c => c.value === topCategory);
    return {
      label: categoryInfo?.label || topCategory,
      amount: maxAmount,
      percentage: Math.round((maxAmount / totalExpense) * 100)
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

  // ========== QUICK ACTIONS ==========
  navigateToReports() {
    this.showToast('Módulo de informes - Próximamente', 'info');
  }

  navigateToSettings() {
    this.showToast('Módulo de configuración - Próximamente', 'info');
  }
}
