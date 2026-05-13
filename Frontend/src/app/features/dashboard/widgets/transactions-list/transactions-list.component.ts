import { Component, input, signal, computed, output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TransactionSummary } from '../../../../core/models/dashboard.model';

export interface TransactionFilter {
  category: string;
  dateRange: 'week' | 'month' | 'year' | 'all';
  type: 'all' | 'income' | 'expense';
  minAmount: number;
  maxAmount: number;
}

export interface TransactionAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-transactions-list-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss'
})
export class TransactionsListWidgetComponent {
  // Inputs
  transactions = input.required<TransactionSummary[]>();
  maxItems = input<number>(10);
  showFilters = input<boolean>(true);
  showSearch = input<boolean>(true);
  
  // Outputs
  transactionClick = output<TransactionSummary>();
  filterChange = output<TransactionFilter>();
  
  // Estados reactivos
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('all');
  selectedType = signal<string>('all');
  selectedDateRange = signal<string>('month');

  // Dropdown properties
  showTypeDropdown = signal<boolean>(false);
  showCategoryDropdown = signal<boolean>(false);
  showDateRangeDropdown = signal<boolean>(false);
  
  // Formulario de filtros
  filterForm: FormGroup;
  
  // Categorías disponibles
  categories = signal<string[]>([]);
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      category: ['all'],
      type: ['all'],
      dateRange: ['month'],
      minAmount: [null],
      maxAmount: [null]
    });
  }
  
  ngOnInit() {
    this.extractCategories();
    this.setupFormListeners();
  }
  
  /**
   * Extrae categorías únicas de las transacciones
   */
  private extractCategories(): void {
    const uniqueCategories = [...new Set(
      this.transactions()
        .map(t => t.category?.name || 'Sin categoría')
        .filter(Boolean)
    )];
    this.categories.set(['all', ...uniqueCategories]);
  }
  
  /**
   * Configura listeners del formulario
   */
  private setupFormListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  /**
   * Aplica filtros a las transacciones
   */
  private applyFilters(): void {
    const formValues = this.filterForm.value;
    
    this.selectedCategory.set(formValues.category || 'all');
    this.selectedType.set(formValues.type || 'all');
    this.selectedDateRange.set(formValues.dateRange || 'month');
    
    const filter: TransactionFilter = {
      category: formValues.category || 'all',
      dateRange: formValues.dateRange || 'month',
      type: formValues.type || 'all',
      minAmount: formValues.minAmount || 0,
      maxAmount: formValues.maxAmount || Infinity
    };
    
    this.filterChange.emit(filter);
  }
  
  /**
   * Filtra transacciones según criterios
   */
  filteredTransactions = computed(() => {
    let filtered = this.transactions();
    
    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(search) ||
        t.category.name.toLowerCase().includes(search)
      );
    }
    
    // Filtro por categoría
    const category = this.selectedCategory();
    if (category && category !== 'all') {
      filtered = filtered.filter(t => t.category.name === category);
    }
    
    // Filtro por tipo
    const type = this.selectedType();
    if (type && type !== 'all') {
      filtered = filtered.filter(t => t.type.toLowerCase() === type);
    }
    
    // Filtro por rango de fechas
    const dateRange = this.selectedDateRange();
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (dateRange) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          cutoffDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }
    
    // Filtro por monto (del formulario)
    const minAmount = this.filterForm.get('minAmount')?.value;
    const maxAmount = this.filterForm.get('maxAmount')?.value;
    
    if (minAmount !== null && minAmount !== undefined) {
      filtered = filtered.filter(t => Math.abs(t.amount) >= minAmount);
    }
    
    if (maxAmount !== null && maxAmount !== undefined) {
      filtered = filtered.filter(t => Math.abs(t.amount) <= maxAmount);
    }
    
    // Ordenar por fecha (más reciente primero)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  /**
   * Transacciones paginadas (limitado por maxItems)
   */
  paginatedTransactions = computed(() => {
    return this.filteredTransactions().slice(0, this.maxItems());
  });
  
  /**
   * Estadísticas de transacciones filtradas
   */
  transactionStats = computed(() => {
    const filtered = this.filteredTransactions();
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;
    
    return {
      total: filtered.length,
      income,
      expense,
      net,
      averageTransaction: filtered.length > 0 ? (income + expense) / filtered.length : 0
    };
  });
  
  /**
   * Maneja el click en una transacción
   */
  onTransactionClick(transaction: TransactionSummary): void {
    this.transactionClick.emit(transaction);
  }
  
  /**
   * Actualiza el término de búsqueda
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }
  
  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.reset({
      category: 'all',
      type: 'all',
      dateRange: 'month',
      minAmount: null,
      maxAmount: null
    });
    this.searchTerm.set('');
  }
  
  /**
   * Obtiene el icono según el tipo de transacción
   */
  getTransactionIcon(type: string): string {
    const icons = {
      'INCOME': '📈',
      'EXPENSE': '📉',
      'TRANSFER': '💸',
      'PAYMENT': '💳',
      'REFUND': '🔄'
    };
    return icons[type as keyof typeof icons] || '📝';
  }
  
  /**
   * Obtiene el color según el tipo de transacción
   */
  getTransactionColor(type: string): string {
    const colors = {
      'INCOME': 'text-green-600',
      'EXPENSE': 'text-red-600',
      'TRANSFER': 'text-blue-600',
      'PAYMENT': 'text-purple-600',
      'REFUND': 'text-orange-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  }
  
  /**
   * Formatea valor como moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formatea el monto con signo
   */
  formatAmount(amount: number, type: string): string {
    const isIncome = type === 'income';
    const prefix = isIncome ? '+' : '-';
    const absAmount = Math.abs(amount);
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absAmount).replace('$', prefix + '$');
  }
  
  /**
   * Formatea la fecha relativa
   */
  getRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }
  
  /**
   * Verifica si hay transacciones
   */
  hasTransactions(): boolean {
    return this.paginatedTransactions().length > 0;
  }
  
  /**
   * Verifica si hay más transacciones que las mostradas
   */
  hasMoreTransactions(): boolean {
    return this.filteredTransactions().length > this.maxItems();
  }
  
  /**
   * Obtiene el total de transacciones filtradas
   */
  getTotalFiltered(): number {
    return this.filteredTransactions().length;
  }
  
  /**
   * Acciones rápidas
   */
  quickActions = computed<TransactionAction[]>(() => [
    {
      id: 'add-transaction',
      label: 'Nueva Transacción',
      icon: '➕',
      action: () => console.log('Abrir formulario de transacción')
    },
    {
      id: 'export-transactions',
      label: 'Exportar',
      icon: '📥',
      action: () => console.log('Exportar transacciones')
    },
    {
      id: 'view-all',
      label: 'Ver Todas',
      icon: '👁️',
      action: () => console.log('Navegar a todas las transacciones')
    }
  ]);
  
  /**
   * Ejecuta una acción rápida
   */
  executeAction(action: TransactionAction): void {
    action.action();
  }

  // Dropdown methods
  toggleDropdown(dropdownName: string): void {
    // Close all dropdowns first
    this.showTypeDropdown.set(false);
    this.showCategoryDropdown.set(false);
    this.showDateRangeDropdown.set(false);
    
    // Open the selected dropdown
    switch (dropdownName) {
      case 'type':
        this.showTypeDropdown.set(!this.showTypeDropdown());
        break;
      case 'category':
        this.showCategoryDropdown.set(!this.showCategoryDropdown());
        break;
      case 'dateRange':
        this.showDateRangeDropdown.set(!this.showDateRangeDropdown());
        break;
    }
  }

  closeAllDropdowns(): void {
    this.showTypeDropdown.set(false);
    this.showCategoryDropdown.set(false);
    this.showDateRangeDropdown.set(false);
  }

  selectDropdownOption(dropdownName: string, value: string): void {
    switch (dropdownName) {
      case 'type':
        this.selectedType.set(value);
        this.filterForm.patchValue({ type: value });
        break;
      case 'category':
        this.selectedCategory.set(value);
        this.filterForm.patchValue({ category: value });
        break;
      case 'dateRange':
        this.selectedDateRange.set(value);
        this.filterForm.patchValue({ dateRange: value });
        break;
    }
    this.closeAllDropdowns();
    this.applyFilters();
  }

  getSelectedLabel(options: any[], currentValue: string): string {
    const option = options.find(opt => opt.value === currentValue);
    return option ? option.label : currentValue;
  }

  trackByOption(index: number, option: any): string {
    return option.value || option;
  }

  // Dropdown options
  typeOptions = [
    { value: 'all', label: '📊 Todas', icon: '📊' },
    { value: 'income', label: '💰 Ingresos', icon: '💰' },
    { value: 'expense', label: '💸 Gastos', icon: '💸' }
  ];

  dateRangeOptions = [
    { value: 'week', label: '📅 Esta semana', icon: '📅' },
    { value: 'month', label: '📆 Este mes', icon: '📆' },
    { value: 'year', label: '📋 Este año', icon: '📋' }
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
