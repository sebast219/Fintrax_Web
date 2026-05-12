import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialStateStore } from '../../services/financial-state.store';

@Component({
  selector: 'app-dashboard-v3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <!-- ERROR BANNER -->
      @if (store.error()) {
        <div class="alert alert-error">
          <span>{{ store.error() }}</span>
          <button (click)="store.clearError()">✕</button>
        </div>
      }

      <!-- LOADING STATE -->
      @if (store.loading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>Cargando estado financiero...</p>
        </div>
      }

      <div [class.dimmed]="store.loading()">
        <!-- BALANCE CARDS -->
        <section class="balance-section">
          <div class="balance-card">
            <h3>Balance Total</h3>
            <div [class.negative]="store.isNegativeBalance()">
              {{ store.totalBalance() | currency:'MXN' }}
            </div>
            @if (store.hasPendingTransactions()) {
              <small>
                Esperado: {{ store.expectedTotalBalance() | currency:'MXN' }}
                ({{ store.pendingTransactionsCount() }} pendiente)
              </small>
            }
          </div>

          <div class="balance-card">
            <h3>Balance Disponible</h3>
            <div>{{ store.availableBalance() | currency:'MXN' }}</div>
            <small>{{ store.allocatedBalance() | currency:'MXN' }} en metas</small>
          </div>

          <div class="balance-card">
            <h3>Tasa de Ahorro</h3>
            <div [class.goal-met]="store.savingsRate() >= 30">
              {{ store.savingsRate() }}%
            </div>
            <small>Meta: 30%</small>
          </div>
        </section>

        <!-- MONTHLY METRICS -->
        <section class="metrics-section">
          <div class="metric">
            <label>Ingresos Este Mes</label>
            <div class="amount">{{ store.monthlyIncome() | currency:'MXN' }}</div>
            @if (store.expectedMonthlyIncome() > store.monthlyIncome()) {
              <small>
                +{{ store.expectedMonthlyIncome() - store.monthlyIncome() | currency:'MXN' }} pendiente
              </small>
            }
          </div>

          <div class="metric">
            <label>Gastos Este Mes</label>
            <div class="amount">{{ store.monthlyExpense() | currency:'MXN' }}</div>
            @if (store.expectedMonthlyExpense() > store.monthlyExpense()) {
              <small>
                +{{ store.expectedMonthlyExpense() - store.monthlyExpense() | currency:'MXN' }} pendiente
              </small>
            }
          </div>
        </section>

        <!-- ALERTS -->
        @if (store.isNegativeBalance()) {
          <div class="alert alert-critical">
            🔴 Tu balance es negativo. Considera agregar ingresos urgentemente.
          </div>
        }

        @if (store.offTrackGoals().length > 0) {
          <div class="alert alert-warning">
            ⚠️ Tienes {{ store.offTrackGoals().length }} meta(s) que no van al ritmo esperado.
          </div>
        }

        <!-- RECOMMENDATIONS -->
        @if (store.recommendations().length > 0) {
          <section class="recommendations-section">
            <h3>💡 Recomendaciones</h3>
            <ul>
              @for (rec of store.recommendations(); track rec.type) {
                <li>
                  <strong>{{ rec.title }}</strong>: {{ rec.message }}
                  @if (rec.action) {
                    <br><em>Acción: {{ rec.action }}</em>
                  }
                </li>
              }
            </ul>
          </section>
        }

        <!-- GOALS SECTION -->
        <section class="goals-section">
          <h2>Metas Financieras</h2>
          
          <div class="tabs">
            <button 
              [class.active]="selectedTab() === 'active'"
              (click)="selectedTab.set('active')">
              Activas ({{ store.activeGoals().length }})
            </button>
            <button 
              [class.active]="selectedTab() === 'completed'"
              (click)="selectedTab.set('completed')">
              Completadas ({{ store.completedGoals().length }})
            </button>
          </div>

          @switch (selectedTab()) {
            @case ('active') {
              @if (store.activeGoals().length > 0) {
                <div class="goals-grid">
                  @for (goal of store.activeGoals(); track goal.id) {
                    <div class="goal-card">
                      <h4>{{ goal.name }}</h4>
                      <div class="progress">
                        <div 
                          class="progress-bar" 
                          [style.width.%]="goal.progress.percentage">
                        </div>
                        <span>{{ goal.progress.percentage }}%</span>
                      </div>
                      <div class="goal-info">
                        <p>
                          {{ goal.currentAmount | currency:'MXN' }} / 
                          {{ goal.targetAmount | currency:'MXN' }}
                        </p>
                        @if (goal.timeline.isOnTrack) {
                          <p class="on-track">
                            ✅ Vas bien ({{ goal.timeline.monthlyVelocity | currency:'MXN' }}/mes)
                          </p>
                        } @else {
                          <p class="off-track">
                            ❌ Necesitas {{ goal.timeline.monthlyVelocity | currency:'MXN' }}/mes
                          </p>
                        }
                      </div>
                      <div class="goal-actions">
                        <button 
                          (click)="openAllocationModal(goal.id)"
                          class="btn-allocate">
                          Asignar
                        </button>
                        <button 
                          [disabled]="goal.currentAmount === 0"
                          (click)="openDeallocationModal(goal.id)"
                          class="btn-deallocate">
                          Retroceder
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <p>No tienes metas activas. Crea una para comenzar.</p>
                </div>
              }
            }
            @case ('completed') {
              @if (store.completedGoals().length > 0) {
                <div class="goals-grid">
                  @for (goal of store.completedGoals(); track goal.id) {
                    <div class="goal-card completed">
                      <h4>{{ goal.name }} 🎉</h4>
                      <p>Completada: {{ goal.currentAmount | currency:'MXN' }}</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <p>Aún no has completado ninguna meta.</p>
                </div>
              }
            }
          }
        </section>

        <!-- QUICK ACTIONS -->
        <section class="actions-section">
          <button (click)="openIncomeModal()" class="btn btn-primary">
            + Agregar Ingreso
          </button>
          <button (click)="openExpenseModal()" class="btn btn-secondary">
            + Registrar Gasto
          </button>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dimmed {
      opacity: 0.6;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 1000;

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #1976d2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      p {
        margin-top: 16px;
        color: #333;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.alert-error {
        background: #fee;
        color: #c33;
        border: 1px solid #fbb;
      }

      &.alert-warning {
        background: #fef3cd;
        color: #856404;
        border: 1px solid #ffc107;
      }

      &.alert-critical {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: inherit;
      }
    }

    .balance-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .balance-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      h3 {
        font-size: 14px;
        color: #666;
        margin: 0 0 8px 0;
      }

      > div {
        font-size: 28px;
        font-weight: bold;
        color: #333;

        &.negative {
          color: #d32f2f;
        }

        &.goal-met {
          color: #388e3c;
        }
      }

      small {
        display: block;
        margin-top: 8px;
        color: #999;
        font-size: 12px;
      }
    }

    .metrics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .metric {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      label {
        font-size: 12px;
        color: #666;
        display: block;
        margin-bottom: 8px;
      }

      .amount {
        font-size: 24px;
        font-weight: bold;
      }

      small {
        display: block;
        margin-top: 8px;
        color: #999;
        font-size: 11px;
      }
    }

    .recommendations-section {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 32px;

      h3 {
        margin-top: 0;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 8px 0;
          color: #666;
          border-bottom: 1px solid #eee;

          &:last-child {
            border-bottom: none;
          }

          strong {
            color: #333;
          }

          em {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }

    .goals-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 32px;

      h2 {
        margin-top: 0;
      }
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;

      button {
        padding: 12px 16px;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #666;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;

        &.active {
          color: #1976d2;
          border-bottom-color: #1976d2;
        }

        &:hover {
          color: #1976d2;
        }
      }
    }

    .goals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .goal-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        background: white;
      }

      &.completed {
        background: #e8f5e9;
        border-color: #4caf50;
      }

      h4 {
        margin: 0 0 12px 0;
      }

      .progress {
        margin-bottom: 12px;

        .progress-bar {
          display: block;
          height: 8px;
          background: linear-gradient(90deg, #1976d2, #64b5f6);
          border-radius: 4px;
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
          color: #666;
        }
      }

      .goal-info {
        margin-bottom: 12px;
        font-size: 14px;

        p {
          margin: 6px 0;

          &.on-track {
            color: #388e3c;
          }

          &.off-track {
            color: #d32f2f;
          }
        }
      }

      .goal-actions {
        display: flex;
        gap: 8px;

        button {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;

          &:hover:not(:disabled) {
            background: #1976d2;
            color: white;
            border-color: #1976d2;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #999;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 20px 0;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 32px;

      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;

        &.btn-primary {
          background: #1976d2;
          color: white;

          &:hover {
            background: #1565c0;
          }
        }

        &.btn-secondary {
          background: #f50057;
          color: white;

          &:hover {
            background: #c51162;
          }
        }
      }
    }
  `]
})
export class DashboardV3Component implements OnInit {
  
  readonly store = inject(FinancialStateStore);
  
  // UI State
  readonly selectedTab = signal<'active' | 'completed'>('active');

  ngOnInit(): void {
    // Cargar estado financiero
    this.store.loadFinancialState();
  }

  // Acciones
  openIncomeModal(): void {
    console.log('TODO: Open income modal');
  }

  openExpenseModal(): void {
    console.log('TODO: Open expense modal');
  }

  openAllocationModal(goalId: string): void {
    console.log('TODO: Open allocation modal for goal:', goalId);
    this.store.selectGoal(goalId);
  }

  openDeallocationModal(goalId: string): void {
    console.log('TODO: Open deallocation modal for goal:', goalId);
    this.store.selectGoal(goalId);
  }
}
