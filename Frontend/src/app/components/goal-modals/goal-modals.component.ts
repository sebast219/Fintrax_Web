import { 
  Component, 
  inject, 
  signal, 
  computed,
  output,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialStateStore } from '../../services/financial-state.store';

@Component({
  selector: 'app-goal-modals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- MODAL DE ASIGNACIÓN -->
    @if (showAllocationModal()) {
      <div class="modal-overlay" (click)="closeAllocationModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Asignar Fondos a Meta</h3>
            <button class="close-btn" (click)="closeAllocationModal()">✕</button>
          </div>
          
          <div class="modal-body">
            @if (selectedGoal()) {
              <div class="goal-summary">
                <h4>{{ selectedGoal()!.name }}</h4>
                <div class="progress-info">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="selectedGoal()!.progress.percentage"></div>
                  </div>
                  <span>{{ selectedGoal()!.progress.percentage }}% completado</span>
                </div>
                <p>
                  {{ selectedGoal()!.currentAmount | currency:'MXN' }} / 
                  {{ selectedGoal()!.targetAmount | currency:'MXN' }}
                </p>
              </div>
            }

            <div class="balance-info">
              <div class="info-row">
                <label>Balance Disponible:</label>
                <span class="available">{{ store.availableBalance() | currency:'MXN' }}</span>
              </div>
              <div class="info-row">
                <label>Monto Máximo Asignable:</label>
                <span class="max-allocatable">{{ maxAllocatable() | currency:'MXN' }}</span>
              </div>
            </div>

            <form (ngSubmit)="allocateToGoal()">
              <div class="form-group">
                <label for="amount">Monto a Asignar</label>
                <input 
                  type="number" 
                  id="amount"
                  [(ngModel)]="allocationAmount"
                  [min]="1"
                  [max]="maxAllocatable()"
                  step="0.01"
                  required
                  class="form-control"
                  #amountInput>
                <div class="input-help">
                  Máximo: {{ maxAllocatable() | currency:'MXN' }}
                </div>
              </div>

              <div class="form-group">
                <label for="account">Cuenta</label>
                <select 
                  id="account"
                  [(ngModel)]="selectedAccountId"
                  required
                  class="form-control">
                  <option value="">Selecciona una cuenta</option>
                  <!-- TODO: Cargar cuentas del store -->
                  <option value="account-1">Cuenta Principal</option>
                </select>
              </div>

              <div class="form-group">
                <label for="note">Nota (opcional)</label>
                <textarea 
                  id="note"
                  [(ngModel)]="allocationNote"
                  rows="3"
                  class="form-control"
                  placeholder="¿Por qué estás asignando estos fondos?"></textarea>
              </div>

              <!-- VALIDACIONES EN TIEMPO REAL -->
              @if (allocationError()) {
                <div class="error-message">
                  {{ allocationError() }}
                </div>
              }

              @if (allocationWarning()) {
                <div class="warning-message">
                  {{ allocationWarning() }}
                </div>
              }

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAllocationModal()">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="!canAllocate() || store.loading()">
                  @if (store.loading()) {
                    <span class="spinner"></span>
                    Asignando...
                  } @else {
                    Asignar {{ allocationAmount() | currency:'MXN' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- MODAL DE RETROCESO -->
    @if (showDeallocationModal()) {
      <div class="modal-overlay" (click)="closeDeallocationModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Retirar Fondos de Meta</h3>
            <button class="close-btn" (click)="closeDeallocationModal()">✕</button>
          </div>
          
          <div class="modal-body">
            @if (selectedGoal()) {
              <div class="goal-summary">
                <h4>{{ selectedGoal()!.name }}</h4>
                <div class="progress-info">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="selectedGoal()!.progress.percentage"></div>
                  </div>
                  <span>{{ selectedGoal()!.progress.percentage }}% completado</span>
                </div>
                <p>
                  Asignado: {{ selectedGoal()!.currentAmount | currency:'MXN' }}
                </p>
              </div>
            }

            <div class="balance-info">
              <div class="info-row">
                <label>Fondos en Meta:</label>
                <span class="allocated">{{ selectedGoal()?.currentAmount | currency:'MXN' }}</span>
              </div>
              <div class="info-row">
                <label>Monto Máximo Retirable:</label>
                <span class="max-deallocatable">{{ maxDeallocatable() | currency:'MXN' }}</span>
              </div>
            </div>

            <form (ngSubmit)="deallocateFromGoal()">
              <div class="form-group">
                <label for="deallocate-amount">Monto a Retirar</label>
                <input 
                  type="number" 
                  id="deallocate-amount"
                  [(ngModel)]="deallocationAmount"
                  [min]="1"
                  [max]="maxDeallocatable()"
                  step="0.01"
                  required
                  class="form-control"
                  #deallocateInput>
                <div class="input-help">
                  Máximo: {{ maxDeallocatable() | currency:'MXN' }}
                </div>
              </div>

              <div class="form-group">
                <label for="deallocate-account">Cuenta Destino</label>
                <select 
                  id="deallocate-account"
                  [(ngModel)]="selectedAccountId"
                  required
                  class="form-control">
                  <option value="">Selecciona una cuenta</option>
                  <!-- TODO: Cargar cuentas del store -->
                  <option value="account-1">Cuenta Principal</option>
                </select>
              </div>

              <div class="form-group">
                <label for="deallocate-note">Motivo (opcional)</label>
                <textarea 
                  id="deallocate-note"
                  [(ngModel)]="deallocationNote"
                  rows="3"
                  class="form-control"
                  placeholder="¿Por qué estás retirando estos fondos?"></textarea>
              </div>

              <!-- VALIDACIONES EN TIEMPO REAL -->
              @if (deallocationError()) {
                <div class="error-message">
                  {{ deallocationError() }}
                </div>
              }

              @if (deallocationWarning()) {
                <div class="warning-message">
                  {{ deallocationWarning() }}
                </div>
              }

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeDeallocationModal()">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-warning"
                  [disabled]="!canDeallocate() || store.loading()">
                  @if (store.loading()) {
                    <span class="spinner"></span>
                    Retirando...
                  } @else {
                    Retirar {{ deallocationAmount() | currency:'MXN' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;

        &:hover {
          background: #f5f5f5;
          color: #333;
        }
      }
    }

    .modal-body {
      padding: 20px;
    }

    .goal-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;

      h4 {
        margin: 0 0 12px 0;
        color: #333;
      }

      .progress-info {
        margin-bottom: 8px;

        .progress-bar {
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #1976d2, #64b5f6);
            transition: width 0.3s;
          }
        }

        span {
          font-size: 12px;
          color: #666;
        }
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #666;
      }
    }

    .balance-info {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;

      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          font-size: 14px;
          color: #666;
        }

        span {
          font-weight: bold;

          &.available {
            color: #1976d2;
          }

          &.max-allocatable {
            color: #388e3c;
          }

          &.allocated {
            color: #f57c00;
          }

          &.max-deallocatable {
            color: #d32f2f;
          }
        }
      }
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s;

        &:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
        }
      }

      textarea.form-control {
        resize: vertical;
      }

      .input-help {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #fbb;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .warning-message {
      background: #fef3cd;
      color: #856404;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ffc107;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;

        &.btn-primary {
          background: #1976d2;
          color: white;

          &:hover:not(:disabled) {
            background: #1565c0;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        &.btn-secondary {
          background: #6c757d;
          color: white;

          &:hover {
            background: #5a6268;
          }
        }

        &.btn-warning {
          background: #f57c00;
          color: white;

          &:hover:not(:disabled) {
            background: #ef6c00;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class GoalModalsComponent {
  readonly store = inject(FinancialStateStore);

  // Inputs
  showAllocationModal = input<boolean>(false);
  showDeallocationModal = input<boolean>(false);

  // Outputs
  allocationClosed = output<void>();
  deallocationClosed = output<void>();

  // Form state
  allocationAmount = signal<number>(0);
  deallocationAmount = signal<number>(0);
  selectedAccountId = signal<string>('');
  allocationNote = signal<string>('');
  deallocationNote = signal<string>('');

  // Computed properties
  readonly selectedGoal = computed(() => this.store.selectedGoal());
  
  readonly maxAllocatable = computed(() => {
    const goal = this.selectedGoal();
    const state = this.store.financialState();
    if (!goal || !state) return 0;
    
    const remaining = goal.targetAmount - goal.currentAmount;
    const available = state.confirmedBalance.availableBalance;
    return Math.min(remaining, available);
  });

  readonly maxDeallocatable = computed(() => {
    const goal = this.selectedGoal();
    if (!goal) return 0;
    return goal.currentAmount;
  });

  // Validaciones en tiempo real
  readonly allocationError = computed(() => {
    const amount = this.allocationAmount();
    const max = this.maxAllocatable();
    const available = this.store.availableBalance();

    if (amount <= 0) return 'El monto debe ser mayor a 0';
    if (amount > max) return `El monto no puede exceder ${max}`;
    if (amount > available) return `Fondos insuficientes. Disponible: ${available}`;
    if (!this.selectedAccountId()) return 'Selecciona una cuenta';
    return '';
  });

  readonly deallocationError = computed(() => {
    const amount = this.deallocationAmount();
    const max = this.maxDeallocatable();

    if (amount <= 0) return 'El monto debe ser mayor a 0';
    if (amount > max) return `El monto no puede exceder ${max}`;
    if (!this.selectedAccountId()) return 'Selecciona una cuenta destino';
    return '';
  });

  readonly allocationWarning = computed(() => {
    const amount = this.allocationAmount();
    const available = this.store.availableBalance();
    const goal = this.selectedGoal();

    if (amount > available * 0.8) {
      return '⚠️ Estás asignando más del 80% de tu balance disponible';
    }

    if (goal && (goal.currentAmount + amount) >= goal.targetAmount * 0.9) {
      return '🎯 Casi completas esta meta';
    }

    return '';
  });

  readonly deallocationWarning = computed(() => {
    const amount = this.deallocationAmount();
    const goal = this.selectedGoal();

    if (goal && (goal.currentAmount - amount) < goal.targetAmount * 0.5) {
      return '⚠️ El progreso de la meta disminuirá significativamente';
    }

    if (goal && (goal.currentAmount - amount) === 0) {
      return '🔄 La meta volverá a 0% de progreso';
    }

    return '';
  });

  readonly canAllocate = computed(() => {
    return !this.allocationError() && this.allocationAmount() > 0 && this.selectedAccountId();
  });

  readonly canDeallocate = computed(() => {
    return !this.deallocationError() && this.deallocationAmount() > 0 && this.selectedAccountId();
  });

  // Methods
  closeAllocationModal(): void {
    this.allocationClosed.emit();
    this.resetAllocationForm();
  }

  closeDeallocationModal(): void {
    this.deallocationClosed.emit();
    this.resetDeallocationForm();
  }

  async allocateToGoal(): Promise<void> {
    if (!this.canAllocate() || !this.selectedGoal()) return;

    const success = await this.store.allocateToGoal(
      this.allocationAmount(),
      this.selectedGoal()!.id,
      this.selectedAccountId(),
      this.allocationNote()
    );

    if (success) {
      this.closeAllocationModal();
    }
  }

  async deallocateFromGoal(): Promise<void> {
    if (!this.canDeallocate() || !this.selectedGoal()) return;

    const success = await this.store.deallocateFromGoal(
      this.deallocationAmount(),
      this.selectedGoal()!.id,
      this.selectedAccountId(),
      this.deallocationNote()
    );

    if (success) {
      this.closeDeallocationModal();
    }
  }

  private resetAllocationForm(): void {
    this.allocationAmount.set(0);
    this.selectedAccountId.set('');
    this.allocationNote.set('');
  }

  private resetDeallocationForm(): void {
    this.deallocationAmount.set(0);
    this.selectedAccountId.set('');
    this.deallocationNote.set('');
  }
}
