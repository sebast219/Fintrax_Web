import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface KPIData {
  title: string;
  value: string;
  color: string;
}

export interface CategoryData {
  name: string;
  percentage: number;
  icon: string;
  color: string;
}

export interface InsightData {
  title: string;
  text: string;
}

export interface CategoryDetailData {
  name: string;
  amount: number;
  percentage: number;
}

export interface MonthlyReportData {
  year: number;
  month: number;
  incomeByCategory: {
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    amount: number;
  }[];
  expensesByCategory: {
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    amount: number;
  }[];
  dailyBalance: {
    date: string;
    income: number;
    expenses: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/reports`;

  async getMonthlyReport(year: number, month: number): Promise<MonthlyReportData> {
    console.log(`📅 Fetching monthly report for ${year}-${month}`);
    
    try {
      const result = await firstValueFrom(
        this.http.get<MonthlyReportData>(`${this.API_URL}/monthly`, {
          params: { year: year.toString(), month: month.toString() }
        })
      );
      console.log(`✅ Monthly report received for ${year}-${month}`);
      return result;
    } catch (error: any) {
      console.error(`❌ Error fetching monthly report for ${year}-${month}:`, error);
      
      // If it's a timeout or network error, provide a default empty response
      if (error.name === 'TimeoutError' || error.name === 'HttpErrorResponse') {
        console.log(`⚠️ Using empty data for ${year}-${month} due to error`);
        return {
          year,
          month,
          incomeByCategory: [],
          expensesByCategory: [],
          dailyBalance: []
        };
      }
      
      throw error;
    }
  }

  async getReportsDataForRange(userId: string, range: string): Promise<MonthlyReportData[]> {
    const reports: MonthlyReportData[] = [];
    const now = new Date();
    
    switch (range) {
      case '30':
        // Last 30 days - get current month
        reports.push(await this.getMonthlyReport(now.getFullYear(), now.getMonth() + 1));
        break;
        
      case '6':
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          reports.push(await this.getMonthlyReport(date.getFullYear(), date.getMonth() + 1));
        }
        break;
        
      case '12':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          reports.push(await this.getMonthlyReport(date.getFullYear(), date.getMonth() + 1));
        }
        break;
        
      default:
        // Default to current month
        reports.push(await this.getMonthlyReport(now.getFullYear(), now.getMonth() + 1));
    }
    
    return reports;
  }

  async getKPIs(userId: string, range: string = '30'): Promise<KPIData[]> {
    const reports = await this.getReportsDataForRange(userId, range);
    
    // Aggregate data across all reports
    const totalExpenses = reports.reduce((sum, report) => 
      sum + report.expensesByCategory.reduce((monthSum, cat) => monthSum + cat.amount, 0), 0);
    const totalIncome = reports.reduce((sum, report) => 
      sum + report.incomeByCategory.reduce((monthSum, cat) => monthSum + cat.amount, 0), 0);
    
    // Calculate days based on range
    const days = range === '30' ? 30 : range === '6' ? 180 : 365;
    const dailyAverage = totalExpenses / days;
    
    // Find most expensive category across all months
    const allExpenses = reports.flatMap(report => report.expensesByCategory);
    const mostExpensiveCategory = allExpenses.reduce((max, cat) => 
      !max || cat.amount > max.amount ? cat : max, null as any);

    // Calculate ant expenses (small transactions under $50)
    const antExpenses = reports.reduce((sum, report) => 
      sum + report.dailyBalance
        .filter(day => day.expenses < 50)
        .reduce((daySum, day) => daySum + day.expenses, 0), 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return [
      { 
        title: 'Gasto Promedio Diario', 
        value: `$${dailyAverage.toFixed(2)}`, 
        color: 'default' 
      },
      { 
        title: 'Categoría más costosa', 
        value: mostExpensiveCategory?.category.name || 'N/A', 
        color: 'danger' 
      },
      { 
        title: 'Gastos Hormiga', 
        value: `$${antExpenses.toFixed(0)}`, 
        color: 'warning' 
      },
      { 
        title: 'Tasa de Ahorro', 
        value: `${savingsRate.toFixed(1)}%`, 
        color: savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'warning' : 'danger' 
      }
    ];
  }

  async getCategories(reports: MonthlyReportData[]): Promise<CategoryData[]> {
    // Aggregate all expenses across all reports
    const allExpenses = reports.flatMap(report => report.expensesByCategory);
    const totalExpenses = allExpenses.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Group by category name and sum amounts
    const categoryMap = new Map<string, { amount: number; category: any }>();
    
    allExpenses.forEach(cat => {
      const key = cat.category.name;
      if (categoryMap.has(key)) {
        categoryMap.get(key)!.amount += cat.amount;
      } else {
        categoryMap.set(key, { amount: cat.amount, category: cat.category });
      }
    });
    
    return Array.from(categoryMap.values()).map(cat => ({
      name: cat.category.name,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
      icon: cat.category.icon || cat.category.name,
      color: cat.category.color || '#6B7280'
    }));
  }

  async getInsights(reports: MonthlyReportData[]): Promise<InsightData[]> {
    const insights: InsightData[] = [];
    
    // Aggregate all daily balance data
    const allDailyBalance = reports.flatMap(report => report.dailyBalance);
    
    // Weekend spending analysis
    const weekendExpenses = allDailyBalance
      .filter(day => {
        const date = new Date(day.date);
        return date.getDay() === 0 || date.getDay() === 6;
      })
      .reduce((sum, day) => sum + day.expenses, 0);
    
    const weekdayExpenses = allDailyBalance
      .filter(day => {
        const date = new Date(day.date);
        return date.getDay() !== 0 && date.getDay() !== 6;
      })
      .reduce((sum, day) => sum + day.expenses, 0);
    
    if (weekdayExpenses > 0) {
      const weekendIncrease = ((weekendExpenses / weekdayExpenses) - 1) * 100;
      if (weekendIncrease > 20) {
        insights.push({
          title: 'Gastos de fin de semana',
          text: `Estás gastando más los fines de semana (+${weekendIncrease.toFixed(0)}%)`
        });
      }
    }

    // Coffee optimization (assuming coffee transactions are small and frequent)
    const smallFrequentExpenses = allDailyBalance
      .filter(day => day.expenses > 0 && day.expenses < 10)
      .length;
    
    if (smallFrequentExpenses > 15) {
      insights.push({
        title: 'Optimización de cafés',
        text: 'Reduciendo cafés diarios podrías ahorrar $90/mes'
      });
    }

    // Monthly trend analysis
    if (reports.length > 1) {
      const latestMonth = reports[reports.length - 1];
      const previousMonth = reports[reports.length - 2];
      
      const latestExpenses = latestMonth.expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
      const previousExpenses = previousMonth.expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
      
      if (previousExpenses > 0) {
        const change = ((latestExpenses - previousExpenses) / previousExpenses) * 100;
        if (change < 0) {
          insights.push({
            title: 'Reducción de gastos',
            text: `Tu gasto total bajó un ${Math.abs(change).toFixed(0)}% comparado al mes anterior`
          });
        }
      }
    }

    // Total summary
    const totalExpenses = reports.reduce((sum, report) => 
      sum + report.expensesByCategory.reduce((monthSum, cat) => monthSum + cat.amount, 0), 0);
    
    insights.push({
      title: 'Resumen del período',
      text: `Tu gasto total en este período fue de $${totalExpenses.toFixed(2)}`
    });

    return insights;
  }

  async getCategoryDetails(reports: MonthlyReportData[]): Promise<CategoryDetailData[]> {
    // Aggregate all expenses across all reports
    const allExpenses = reports.flatMap(report => report.expensesByCategory);
    const totalExpenses = allExpenses.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Group by category name and sum amounts
    const categoryMap = new Map<string, { amount: number; name: string }>();
    
    allExpenses.forEach(cat => {
      const key = cat.category.name;
      if (categoryMap.has(key)) {
        categoryMap.get(key)!.amount += cat.amount;
      } else {
        categoryMap.set(key, { amount: cat.amount, name: cat.category.name });
      }
    });
    
    return Array.from(categoryMap.values()).map(cat => ({
      name: cat.name,
      amount: cat.amount,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
    }));
  }
}
