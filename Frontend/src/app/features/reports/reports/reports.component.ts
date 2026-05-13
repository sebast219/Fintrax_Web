import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../layout/navbar/navbar';
import { ReportsService, KPIData, CategoryData, InsightData, CategoryDetailData, MonthlyReportData } from '../../../core/services/reports.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.scss'],
  standalone: true,
  imports: [CommonModule, Navbar]
})
export class ReportsComponent implements OnInit, OnDestroy {
  selectedRange: string = '30';
  loading: boolean = false;
  error: string | null = null;
  private dataSubscription: Subscription | null = null;
  
  // Dropdown properties
  showDropdown: boolean = false;
  
  // Range options
  rangeOptions = [
    { value: '30', label: 'Últimos 30 días', icon: '📅' },
    { value: '6', label: 'Últimos 6 meses', icon: '📊' },
    { value: '12', label: 'Último año', icon: '📈' }
  ];

  kpis: KPIData[] = [];
  categories: CategoryData[] = [];
  insights: InsightData[] = [];
  categoryDetails: CategoryDetailData[] = [];
  monthlyReportData: MonthlyReportData | null = null;

  constructor(
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Add safety timeout to ensure loading is never stuck
    setTimeout(() => {
      if (this.loading) {
        console.warn('⚠️ Loading timeout - forcing loading state to false');
        this.loading = false;
        this.error = 'Tiempo de espera agotado. Por favor, recarga la página.';
      }
    }, 30000); // 30 second timeout
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private async loadData() {
    this.loading = true;
    this.error = null;
    
    try {
      console.log('🔄 Starting to load reports data...');
      const userId = this.getCurrentUserId();
      console.log('👤 User ID:', userId);
      console.log('📅 Selected range:', this.selectedRange);
      
      // Get all reports data for the selected range
      console.log('📊 Fetching reports data...');
      const reportsData = await this.reportsService.getReportsDataForRange(userId, this.selectedRange);
      console.log('📊 Reports data received:', reportsData.length, 'months');
      
      this.monthlyReportData = reportsData[reportsData.length - 1]; // Keep latest month for compatibility
      console.log('📈 Latest month data set');
      
      // Load all data based on the reports - with individual error handling
      console.log('🔢 Calculating KPIs...');
      this.kpis = await this.reportsService.getKPIs(userId, this.selectedRange);
      console.log('✅ KPIs calculated:', this.kpis.length);
      
      console.log('📂 Processing categories...');
      this.categories = await this.reportsService.getCategories(reportsData);
      console.log('✅ Categories processed:', this.categories.length);
      
      console.log('💡 Generating insights...');
      this.insights = await this.reportsService.getInsights(reportsData);
      console.log('✅ Insights generated:', this.insights.length);
      
      console.log('📋 Getting category details...');
      this.categoryDetails = await this.reportsService.getCategoryDetails(reportsData);
      console.log('✅ Category details processed:', this.categoryDetails.length);
      
      console.log('🎉 All data loaded successfully!');
      
    } catch (error: any) {
      console.error('❌ Error loading reports data:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        status: error?.status,
        statusText: error?.statusText
      });
      
      // More specific error messages
      if (error?.status === 401) {
        this.error = 'No autorizado. Por favor, inicia sesión nuevamente.';
      } else if (error?.status === 403) {
        this.error = 'No tienes permisos para ver estos datos.';
      } else if (error?.status === 404) {
        this.error = 'No se encontraron datos para el período seleccionado.';
      } else if (error?.status >= 500) {
        this.error = 'Error del servidor. Por favor, intenta nuevamente más tarde.';
      } else {
        this.error = 'No se pudieron cargar los datos. Por favor, intenta nuevamente.';
      }
    } finally {
      this.loading = false;
      console.log('🏁 Loading finished, loading state set to false');
      console.log('🔄 Forcing change detection...');
      this.cdr.detectChanges();
      console.log('✅ Change detection completed');
    }
  }

  private getCurrentUserId(): string {
    // This should come from authentication service
    // For now, return a placeholder - in real implementation this would come from JWT token or auth state
    const token = localStorage.getItem('fintrax_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      } catch {
        return 'default-user';
      }
    }
    return 'default-user';
  }

  hasNoData(): boolean {
    // Check if there are no real transactions - all values are zero/empty
    const hasNoRealKPIs = this.kpis.length === 0 || this.kpis.every(kpi => 
      kpi.value === '$0.00' || kpi.value === '$0' || kpi.value === '0%' || kpi.value === 'N/A'
    );
    const hasNoCategories = this.categories.length === 0;
    const hasNoInsights = this.insights.length === 0;
    const hasNoCategoryDetails = this.categoryDetails.length === 0;
    const hasNoReportData = !this.monthlyReportData || 
      (this.monthlyReportData.expensesByCategory.length === 0 && 
       this.monthlyReportData.incomeByCategory.length === 0 &&
       this.monthlyReportData.dailyBalance.length === 0);
    
    // The key check: if there are no transactions in the report data, it's empty
    const hasNoTransactions = !this.monthlyReportData || 
      (this.monthlyReportData.expensesByCategory.length === 0 && 
       this.monthlyReportData.incomeByCategory.length === 0);
    
    console.log('🔍 hasNoData check:', {
      loading: this.loading,
      error: this.error,
      hasNoRealKPIs,
      hasNoCategories,
      hasNoInsights,
      hasNoCategoryDetails,
      hasNoReportData,
      hasNoTransactions,
      kpisLength: this.kpis.length,
      categoriesLength: this.categories.length,
      insightsLength: this.insights.length,
      categoryDetailsLength: this.categoryDetails.length,
      monthlyReportDataExists: !!this.monthlyReportData,
      expensesByCategoryLength: this.monthlyReportData?.expensesByCategory.length || 0,
      incomeByCategoryLength: this.monthlyReportData?.incomeByCategory.length || 0,
      dailyBalanceLength: this.monthlyReportData?.dailyBalance.length || 0,
      kpiValues: this.kpis.map(k => k.value)
    });
    
    // User has no data if there are no transactions, regardless of calculated KPIs
    const result = hasNoTransactions && hasNoCategories && hasNoCategoryDetails;
    console.log('🎯 hasNoData result:', result);
    
    return result;
  }

  formatMoney(value: number): string {
    return `$${value.toLocaleString()}`;
  }

  // Dropdown methods
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  selectRange(range: string): void {
    this.selectedRange = range;
    this.showDropdown = false;
    this.onRangeChange({ target: { value: range } });
  }

  getSelectedLabel(): string {
    const option = this.rangeOptions.find(opt => opt.value === this.selectedRange);
    return option ? option.label : 'Seleccionar rango';
  }

  trackByOption(index: number, option: any): string {
    return option.value;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.showDropdown = false;
    }
  }

  onRangeChange(event: any) {
    this.selectedRange = event.target.value;
    console.log('Rango seleccionado:', this.selectedRange);
    this.loadData(); // Reload data with new range
  }

  exportPDF() {
    console.log('Exportando PDF...');
    // TODO: Implement PDF export functionality
  }
}