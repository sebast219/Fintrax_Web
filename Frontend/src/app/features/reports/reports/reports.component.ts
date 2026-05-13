import { Component, OnInit, OnDestroy } from '@angular/core';
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

  kpis: KPIData[] = [];
  categories: CategoryData[] = [];
  insights: InsightData[] = [];
  categoryDetails: CategoryDetailData[] = [];
  monthlyReportData: MonthlyReportData | null = null;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadData();
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
      const userId = this.getCurrentUserId();
      
      // Get all reports data for the selected range
      const reportsData = await this.reportsService.getReportsDataForRange(userId, this.selectedRange);
      this.monthlyReportData = reportsData[reportsData.length - 1]; // Keep latest month for compatibility
      
      // Load all data based on the reports
      this.kpis = await this.reportsService.getKPIs(userId, this.selectedRange);
      this.categories = await this.reportsService.getCategories(reportsData);
      this.insights = await this.reportsService.getInsights(reportsData);
      this.categoryDetails = await this.reportsService.getCategoryDetails(reportsData);
      
    } catch (error) {
      console.error('Error loading reports data:', error);
      this.error = 'No se pudieron cargar los datos. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
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
    // Check if there are no transactions or all data arrays are empty
    const hasNoKPIs = this.kpis.length === 0 || this.kpis.every(kpi => kpi.value === '$0.00' || kpi.value === '0%');
    const hasNoCategories = this.categories.length === 0;
    const hasNoInsights = this.insights.length === 0;
    const hasNoCategoryDetails = this.categoryDetails.length === 0;
    const hasNoReportData = !this.monthlyReportData || 
      (this.monthlyReportData.expensesByCategory.length === 0 && 
       this.monthlyReportData.incomeByCategory.length === 0 &&
       this.monthlyReportData.dailyBalance.length === 0);
    
    return hasNoKPIs && hasNoCategories && hasNoInsights && hasNoCategoryDetails && hasNoReportData;
  }

  formatMoney(value: number): string {
    return `$${value.toLocaleString()}`;
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