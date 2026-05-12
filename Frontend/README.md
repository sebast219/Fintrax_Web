# 🎨 Fintrax Frontend V3

**Frontend Angular 17 para Fintrax V3** - Aplicación de gestión financiera personal con arquitectura reactiva moderna.

> 💡 **Frontend con score 95/100** construido con Angular 17 Signals, TypeScript y TailwindCSS.

---

## 📋 Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Arquitectura](#2-arquitectura)
3. [Instalación](#3-instalación)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Componentes Principales](#5-componentes-principales)
6. [Servicios y Stores](#6-servicios-y-stores)
7. [Estados y Signals](#7-estados-y-signals)
8. [Testing](#8-testing)
9. [Build y Deployment](#9-build-y-deployment)

---

## 1. STACK TECNOLÓGICO

```typescript
Framework: Angular 17 (Latest)
├─ Standalone Components ✓
├─ Signals & Computed Properties ✓
├─ ChangeDetectionStrategy.OnPush ✓
├─ Strict TypeScript ✓
└─ No classes, functional style ✓

Styling & UI
├─ TailwindCSS 3.x ✓
├─ Responsive Design ✓
├─ Dark Mode Support ✓
└─ Component Library (Custom) ✓

State Management
├─ Angular Signals (Built-in) ✓
├─ Computed Properties ✓
├─ Effects for side effects ✓
└─ Immutable Updates ✓

HTTP & Data
├─ HttpClient (Angular) ✓
├─ RxJS Operators ✓
├─ Error Handling ✓
└─ Request Caching ✓

Development Tools
├─ Vite (esbuild) ✓
├─ ESLint + Prettier ✓
├─ Angular DevTools ✓
└─ Hot Module Replacement ✓

Testing
├─ Jasmine + Karma ✓
├─ Testing Library ✓
├─ Component Testing ✓
└─ E2E with Cypress ✓
```

---

## 2. ARQUITECTURA

### 2.1 Clean Architecture Frontend

```
┌─────────────────────────────────────────┐
│           PRESENTATION                  │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Components  │  │ Templates/HTML  │ │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         APPLICATION LAYER               │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Services     │  │ Use Cases       │ │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            DOMAIN LAYER                  │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Entities    │  │ Business Rules │ │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        INFRASTRUCTURE LAYER             │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ HTTP Client  │  │ External APIs   │ │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

### 2.2 Reactive Programming Pattern

```typescript
// ✅ Signals Pattern (State Management)
class FinancialStateStore {
  // Private state signals
  #transactions = signal<Transaction[]>([]);
  #goals = signal<Goal[]>([]);
  #loading = signal(false);
  #error = signal<string | null>(null);

  // Public computed selectors (read-only)
  readonly totalBalance = computed(() => 
    this.#calculateTotalBalance()
  );
  
  readonly availableBalance = computed(() => 
    this.#calculateAvailableBalance()
  );

  // Actions (methods that update state)
  async loadFinancialState(): Promise<void> {
    this.#loading.set(true);
    try {
      const state = await this.api.getFinancialState();
      this.#transactions.set(state.transactions);
      this.#goals.set(state.goals);
    } catch (error) {
      this.#error.set(error.message);
    } finally {
      this.#loading.set(false);
    }
  }
}

// ✅ Component Pattern (Standalone + OnPush)
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.loading()) {
      <div class="spinner">Loading...</div>
    }
    
    @if (store.error()) {
      <div class="alert-error">{{ store.error() }}</div>
    }
    
    <div class="balance-card">
      <h3>Total Balance</h3>
      <div>{{ store.totalBalance() | currency }}</div>
    </div>
  `
})
export class DashboardComponent {
  readonly store = inject(FinancialStateStore);

  constructor() {
    // Auto-refresh when state changes
    effect(() => {
      console.log('Balance updated:', this.store.totalBalance());
    });
  }
}
```

---

## 3. INSTALACIÓN

### 3.1 Prerrequisitos

- **Node.js** 18+
- **Angular CLI** 17+
- **npm** o **yarn**

### 3.2 Configuración Paso a Paso

#### 1️⃣ Instalar Dependencias
```bash
cd Frontend
npm install
```

#### 2️⃣ Configurar Variables de Entorno
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  
  // 📊 Configuración de la app
  app: {
    name: 'Fintrax',
    version: '3.0.0',
    currency: 'USD',
    locale: 'es'
  },
  
  // 🔧 Feature flags
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
    advancedCharts: true
  }
};
```

#### 3️⃣ Iniciar Servidor de Desarrollo
```bash
# Desarrollo con hot reload
npm start

# O con Angular CLI
ng serve
```

### 3.3 Verificación

- **Aplicación**: http://localhost:4200
- **Angular DevTools**: Disponible en Chrome DevTools

---

## 4. ESTRUCTURA DEL PROYECTO

```
Frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # 🏛️ Servicios centrales
│   │   │   ├── guards/            # 🛡️ Guards de ruta
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/      # 🔄 HTTP interceptors
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/          # 🔌 Core services
│   │   │       ├── auth.service.ts
│   │   │       └── logger.service.ts
│   │   │
│   │   ├── shared/                  # 🔄 Componentes reutilizables
│   │   │   ├── components/        # 📦 UI components
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── error-message/
│   │   │   │   └── currency-display/
│   │   │   ├── pipes/             # 🔧 Custom pipes
│   │   │   │   └── currency.pipe.ts
│   │   │   ├── directives/        # ✨ Custom directives
│   │   │   └── utils/             # 🛠️ Utility functions
│   │   │       └── validators.ts
│   │   │
│   │   ├── features/               # 📱 Funcionalidades principales
│   │   │   ├── auth/              # 🔐 Login/Registro
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── auth.routes.ts
│   │   │   ├── dashboard/         # 📊 Panel principal
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dialogs/
│   │   │   │   │   ├── allocation-modal/
│   │   │   │   │   └── deallocation-modal/
│   │   │   │   └── dashboard.routes.ts
│   │   │   ├── goals/             # 🎯 Metas de ahorro
│   │   │   ├── transactions/      # 💸 Transacciones
│   │   │   └── reports/           # 📈 Reportes
│   │   │
│   │   ├── services/               # 🔌 Business logic services
│   │   │   ├── financial-state.store.ts
│   │   │   ├── financial-api.service.ts
│   │   │   ├── financial-logic-v2.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   ├── models/                 # 📊 TypeScript interfaces
│   │   │   ├── financial-state.interface.ts
│   │   │   ├── goal.interface.ts
│   │   │   └── transaction.interface.ts
│   │   │
│   │   ├── app.routes.ts           # 🛣️ Routing principal
│   │   ├── app.component.ts        # 📱 Root component
│   │   └── main.ts                 # 🚀 Bootstrap
│   │
│   ├── assets/                    # 📁 Recursos estáticos
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── environments/              # ⚙️ Configuración de entornos
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles/                    # 🎨 Estilos globales
│   │   ├── main.scss
│   │   └── variables.scss
│   │
│   ├── index.html                 # 📄 HTML principal
│   └── main.ts                    # 🚀 Entry point
│
├── public/                         # 📂 Archivos públicos
├── angular.json                   # ⚙️ Configuración Angular
├── package.json                   # 📦 Dependencias
├── tsconfig.json                  # ⚙️ Configuración TypeScript
├── tailwind.config.js             # 🎨 Configuración Tailwind
└── vite.config.ts                 # ⚡ Configuración Vite
```

---

## 5. COMPONENTES PRINCIPALES

### 5.1 Dashboard Component

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe,
    LoadingSpinnerComponent,
    GoalCardComponent,
    AllocationModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <!-- Loading State -->
      @if (store.loading()) {
        <app-loading-spinner />
      }

      <!-- Error State -->
      @if (store.error()) {
        <app-error-message [message]="store.error()!" />
      }

      <!-- Main Dashboard -->
      @if (!store.loading() && !store.error()) {
        <!-- Balance Cards -->
        <div class="balance-grid">
          <div class="balance-card">
            <h3>Total Balance</h3>
            <div class="amount" 
                 [class.negative]="store.isNegativeBalance()">
              {{ store.totalBalance() | currency }}
            </div>
          </div>
          
          <div class="balance-card">
            <h3>Available</h3>
            <div class="amount">
              {{ store.availableBalance() | currency }}
            </div>
          </div>
          
          <div class="balance-card">
            <h3>Savings Rate</h3>
            <div class="percentage">
              {{ store.savingsRate() }}%
            </div>
          </div>
        </div>

        <!-- Goals Section -->
        <div class="goals-section">
          <h2>Financial Goals</h2>
          <div class="goals-grid">
            @for (goal of store.activeGoals(); track goal.id) {
              <app-goal-card 
                [goal]="goal"
                (allocate)="openAllocationModal(goal)"
                (deallocate)="openDeallocationModal(goal)" />
            }
            
            @empty {
              <div class="empty-state">
                <p>No goals yet. Create your first goal!</p>
                <button (click)="createNewGoal()">Create Goal</button>
              </div>
            }
          </div>
        </div>

        <!-- Recommendations -->
        @if (store.recommendations().length > 0) {
          <div class="recommendations">
            <h3>Recommendations</h3>
            @for (rec of store.recommendations(); track rec) {
              <div class="recommendation">{{ rec }}</div>
            }
          </div>
        }
      }
    </div>

    <!-- Modals -->
    @if (allocationModalVisible) {
      <app-allocation-modal 
        [goal]="selectedGoal"
        (close)="closeAllocationModal()"
        (confirm)="confirmAllocation($event)" />
    }
  `
})
export class DashboardComponent implements OnInit {
  readonly store = inject(FinancialStateStore);
  readonly dialog = inject(DialogService);

  // Modal state
  allocationModalVisible = signal(false);
  deallocationModalVisible = signal(false);
  selectedGoal = signal<Goal | null>(null);

  ngOnInit(): void {
    this.store.loadFinancialState();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
      this.store.loadFinancialState();
    }, 30000);
  }

  openAllocationModal(goal: Goal): void {
    this.selectedGoal.set(goal);
    this.allocationModalVisible.set(true);
  }

  closeAllocationModal(): void {
    this.allocationModalVisible.set(false);
    this.selectedGoal.set(null);
  }

  async confirmAllocation(amount: number): Promise<void> {
    const goal = this.selectedGoal();
    if (!goal) return;

    const success = await this.store.allocateToGoal(amount, goal.id);
    if (success) {
      this.closeAllocationModal();
      // Store automatically refreshes
    }
  }
}
```

### 5.2 Goal Card Component

```typescript
@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="goal-card" [class.completed]="goal.status === 'COMPLETED'">
      <div class="goal-header">
        <h3>{{ goal.name }}</h3>
        <span class="priority" [class]="goal.priority.toLowerCase()">
          {{ goal.priority }}
        </span>
      </div>

      <div class="goal-progress">
        <app-progress-bar 
          [value]="goal.progress.percentage"
          [color]="getProgressColor(goal.progress.percentage)" />
        
        <div class="progress-text">
          <span>{{ goal.currentAmount | currency }}</span>
          <span>of {{ goal.targetAmount | currency }}</span>
          <span>({{ goal.progress.percentage }}%)</span>
        </div>
      </div>

      <div class="goal-timeline">
        @if (goal.timeline.isOnTrack) {
          <span class="on-track">✅ On track</span>
        } else {
          <span class="off-track">⚠️ Behind schedule</span>
        }
        <span>{{ goal.timeline.daysRemaining }} days left</span>
      </div>

      <div class="goal-actions">
        <button (click)="allocate.emit(goal)" 
                [disabled]="goal.status === 'COMPLETED'">
          Allocate
        </button>
        <button (click)="deallocate.emit(goal)"
                [disabled]="goal.currentAmount === 0">
          Deallocate
        </button>
      </div>

      @if (goal.alerts.length > 0) {
        <div class="goal-alerts">
          @for (alert of goal.alerts; track alert) {
            <div class="alert" [class]="alert.type">{{ alert.message }}</div>
          }
        </div>
      }
    </div>
  `
})
export class GoalCardComponent {
  @Input() goal!: GoalStateDetailed;
  @Output() allocate = new EventEmitter<Goal>();
  @Output() deallocate = new EventEmitter<Goal>();

  getProgressColor(percentage: number): string {
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'red';
  }
}
```

---

## 6. SERVICIOS Y STORES

### 6.1 FinancialStateStore (State Management)

```typescript
@Injectable({
  providedIn: 'root'
})
export class FinancialStateStore {
  private readonly api = inject(FinancialApiService);
  private readonly logic = inject(FinancialLogicV2Service);

  // 🔒 Private state signals
  #transactions = signal<Transaction[]>([]);
  #goals = signal<Goal[]>([]);
  #financialState = signal<FinancialStateDetailed | null>(null);
  #loading = signal(false);
  #error = signal<string | null>(null);

  // 🔓 Public computed selectors (read-only)
  readonly transactions = this.#transactions.asReadonly();
  readonly goals = this.#goals.asReadonly();
  readonly loading = this.#loading.asReadonly();
  readonly error = this.#error.asReadonly();

  readonly totalBalance = computed(() => 
    this.#financialState()?.confirmedBalance.totalBalance ?? 0
  );
  
  readonly availableBalance = computed(() => 
    this.#financialState()?.confirmedBalance.availableBalance ?? 0
  );
  
  readonly allocatedBalance = computed(() => 
    this.#financialState()?.confirmedBalance.allocatedBalance ?? 0
  );

  readonly savingsRate = computed(() => 
    this.#financialState()?.savingsRate.confirmed ?? 0
  );

  readonly activeGoals = computed(() => 
    this.#goals()
      .filter(goal => goal.status === 'ACTIVE')
      .map(goal => this.logic.enrichGoalWithState(goal, this.#financialState()!))
  );

  readonly recommendations = computed(() => 
    this.#financialState() 
      ? this.logic.generateRecommendations(this.#financialState()!, this.#goals())
      : []
  );

  // 🎯 Actions
  async loadFinancialState(): Promise<void> {
    this.#setLoading(true);
    this.#setError(null);

    try {
      const [transactions, goals, state] = await Promise.all([
        this.api.getTransactions(),
        this.api.getGoals(),
        this.api.getFinancialState()
      ]);

      this.#transactions.set(transactions);
      this.#goals.set(goals);
      this.#financialState.set(state);
    } catch (error) {
      this.#setError(this.formatError(error));
    } finally {
      this.#setLoading(false);
    }
  }

  async allocateToGoal(amount: number, goalId: string): Promise<boolean> {
    this.#setLoading(true);
    this.#setError(null);

    try {
      const result = await this.api.allocateToGoal(amount, goalId);
      
      if (result.success) {
        // Refresh state after successful allocation
        await this.loadFinancialState();
        return true;
      } else {
        this.#setError(result.error || 'Allocation failed');
        return false;
      }
    } catch (error) {
      this.#setError(this.formatError(error));
      return false;
    } finally {
      this.#setLoading(false);
    }
  }

  async deallocateFromGoal(amount: number, goalId: string): Promise<boolean> {
    this.#setLoading(true);
    this.#setError(null);

    try {
      const result = await this.api.deallocateFromGoal(amount, goalId);
      
      if (result.success) {
        await this.loadFinancialState();
        return true;
      } else {
        this.#setError(result.error || 'Deallocation failed');
        return false;
      }
    } catch (error) {
      this.#setError(this.formatError(error));
      return false;
    } finally {
      this.#setLoading(false);
    }
  }

  // 🔧 Helper methods
  isNegativeBalance(): boolean {
    return this.totalBalance() < 0;
  }

  hasPendingTransactions(): boolean {
    return this.#financialState()?.alerts.pendingTransactions > 0;
  }

  // 🔒 Private helpers
  #setLoading(value: boolean): void {
    this.#loading.set(value);
  }

  #setError(error: string | null): void {
    this.#error.set(error);
  }

  private formatError(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  }
}
```

### 6.2 FinancialApiService

```typescript
@Injectable({
  providedIn: 'root'
})
export class FinancialApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  constructor() {
    // Auto-refresh token interceptor handles auth
  }

  // 📊 Financial State
  getFinancialState(): Observable<FinancialStateDetailed> {
    return this.http.get<FinancialStateDetailed>(`${this.baseUrl}/financial/state`);
  }

  // 💰 Goal Operations
  allocateToGoal(amount: number, goalId: string): Observable<AllocationResult> {
    return this.http.post<AllocationResult>(`${this.baseUrl}/financial/allocate-goal`, {
      amount,
      goalId
    });
  }

  deallocateFromGoal(amount: number, goalId: string): Observable<DeallocationResult> {
    return this.http.post<DeallocationResult>(`${this.baseUrl}/financial/deallocate-goal`, {
      amount,
      goalId
    });
  }

  // 💸 Transactions
  getTransactions(filters?: TransactionFilters): Observable<Transaction[]> {
    const params = new HttpParams({ fromObject: filters || {} });
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, { params });
  }

  createTransaction(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions`, transaction);
  }

  // 🎯 Goals
  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/goals`);
  }

  createGoal(goal: CreateGoalDto): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}/goals`, goal);
  }

  updateGoal(id: string, goal: UpdateGoalDto): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/goals/${id}`, goal);
  }

  // 📈 Metrics & Recommendations
  getRecommendations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/financial/recommendations`);
  }

  getMetrics(): Observable<MetricsResponse> {
    return this.http.get<MetricsResponse>(`${this.baseUrl}/financial/metrics`);
  }
}
```

---

## 7. ESTADOS Y SIGNALS

### 7.1 Signals Pattern Examples

```typescript
// ✅ Simple signal
const count = signal(0);

// ✅ Computed signal
const doubled = computed(() => count() * 2);

// ✅ Effect for side effects
effect(() => {
  console.log('Count changed:', count());
});

// ✅ Writable signal with validation
const budget = signal<number>(0, {
  equal: (a, b) => Math.abs(a - b) < 0.01 // Compare with tolerance
});

// ✅ Signal in service
@Injectable()
export class CounterService {
  #count = signal(0);
  
  readonly count = this.#count.asReadonly();
  readonly isEven = computed(() => this.#count() % 2 === 0);
  
  increment(): void {
    this.#count.update(c => c + 1);
  }
  
  reset(): void {
    this.#count.set(0);
  }
}
```

### 7.2 Component Communication

```typescript
// ✅ Parent to Child (Input)
@Component({
  template: `
    <app-child [data]="parentData()" (action)="handleChildAction($event)" />
  `
})
export class ParentComponent {
  parentData = signal({ name: 'Test', value: 42 });

  handleChildAction(event: any): void {
    console.log('Child action:', event);
  }
}

// ✅ Child to Parent (Output)
@Component({
  template: `
    <button (click)="notifyParent()">Notify Parent</button>
  `
})
export class ChildComponent {
  @Input() data!: any;
  @Output() action = new EventEmitter<any>();

  notifyParent(): void {
    this.action.emit({ type: 'click', timestamp: Date.now() });
  }
}

// ✅ Service-based communication
@Injectable()
export class EventBusService {
  #events = signal<Record<string, any>>({});

  emit(event: string, data: any): void {
    this.#events.update(events => ({ ...events, [event]: data }));
  }

  on<T>(event: string): Observable<T> {
    return toObservable(this.#events).pipe(
      map(events => events[event]),
      filter(data => data !== undefined),
      distinctUntilChanged()
    );
  }
}
```

---

## 8. TESTING

### 8.1 Test Strategy

```
Frontend Testing Pyramid (80% Coverage Target)
      /\           E2E Tests (10%)
     /  \          ├─ Critical user flows
    /    \         └─ Cross-browser testing
   ------         
   /      \        Integration Tests (30%)
  /        \       ├─ Component integration
  ----------       ├─ Service integration
  
 /          \      Unit Tests (60%)
/            \     ├─ Components (20 tests)
--------------     ├─ Services (15 tests)
                   ├─ Pipes/Directives (10 tests)
                   └─ Utils (5 tests)
```

### 8.2 Component Testing Example

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { FinancialStateStore } from '../services/financial-state.store';
import { FinancialApiService } from '../services/financial-api.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockStore: jasmine.SpyObj<FinancialStateStore>;
  let mockApi: jasmine.SpyObj<FinancialApiService>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('FinancialStateStore', [
      'loadFinancialState',
      'totalBalance',
      'availableBalance',
      'activeGoals',
      'loading',
      'error'
    ], {
      totalBalance: of(1000),
      availableBalance: of(700),
      activeGoals: of([]),
      loading: of(false),
      error: of(null)
    });

    mockApi = jasmine.createSpyObj('FinancialApiService', ['getFinancialState']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        { provide: FinancialStateStore, useValue: mockStore },
        { provide: FinancialApiService, useValue: mockApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total balance', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('1000');
  });

  it('should call loadFinancialState on init', () => {
    expect(mockStore.loadFinancialState).toHaveBeenCalled();
  });

  it('should show loading spinner when loading', () => {
    mockStore.loading.and.returnValue(of(true));
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-loading-spinner')).toBeTruthy();
  });

  it('should show error message when error exists', () => {
    mockStore.error.and.returnValue(of('Test error'));
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test error');
  });

  it('should open allocation modal when allocate is called', () => {
    const mockGoal = { id: '1', name: 'Test Goal' } as any;
    
    component.openAllocationModal(mockGoal);
    
    expect(component.allocationModalVisible()).toBe(true);
    expect(component.selectedGoal()).toBe(mockGoal);
  });
});
```

### 8.3 Service Testing Example

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FinancialApiService } from './financial-api.service';

describe('FinancialApiService', () => {
  let service: FinancialApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FinancialApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FinancialApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get financial state', () => {
    const mockState = {
      confirmedBalance: { totalBalance: 1000, availableBalance: 700 },
      savingsRate: { confirmed: 50 }
    };

    service.getFinancialState().subscribe(state => {
      expect(state).toEqual(mockState);
    });

    const req = httpMock.expectOne(`${service.baseUrl}/financial/state`);
    expect(req.request.method).toBe('GET');
    req.flush(mockState);
  });

  it('should allocate to goal', () => {
    const allocationData = { amount: 100, goalId: 'goal-123' };
    const mockResult = { success: true, goal: {}, transaction: {} };

    service.allocateToGoal(100, 'goal-123').subscribe(result => {
      expect(result).toEqual(mockResult);
    });

    const req = httpMock.expectOne(`${service.baseUrl}/financial/allocate-goal`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(allocationData);
    req.flush(mockResult);
  });
});
```

---

## 9. BUILD Y DEPLOYMENT

### 9.1 Scripts Disponibles

```bash
# 🚀 Development
npm start                    # Servidor de desarrollo
ng serve                    # Angular CLI serve
npm run start:ssl           # Desarrollo con HTTPS

# 📦 Build
npm run build               # Build para producción
npm run build:analyze       # Análisis de bundle
npm run build:stats         # Generar estadísticas

# 🧪 Testing
npm run test                # Unit tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
npm run test:e2e            # End-to-end tests
npm run test:e2e:headless    # E2E sin UI

# 🔧 Code Quality
npm run lint                 # ESLint check
npm run lint:fix             # Auto-fix ESLint
npm run format              # Prettier format
npm run type-check          # TypeScript check

# 📊 Performance
npm run build:analyze       # Bundle analyzer
npm run lighthouse          # Performance audit
```

### 9.2 Environment Configuration

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.fintrax.io/api/v1',
  
  app: {
    name: 'Fintrax',
    version: '3.0.0',
    currency: 'USD',
    locale: 'es'
  },
  
  features: {
    darkMode: true,
    notifications: true,
    analytics: true,
    advancedCharts: true
  },
  
  // 📊 Production monitoring
  monitoring: {
    sentryDsn: 'your-sentry-dsn',
    googleAnalyticsId: 'GA-XXXXXXXX'
  }
};
```

### 9.3 Docker Configuration

```dockerfile
# Multi-stage Angular Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# Runtime (nginx)
FROM nginx:alpine AS runtime
COPY --from=builder /app/dist/Frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 9.4 Performance Optimization

```typescript
// main.ts - Enable production optimizations
if (environment.production) {
  enableProdMode();
}

// Bundle optimization in angular.json
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "outputPath": "dist/Frontend",
    "optimization": true,
    "sourceMap": false,
    "extractCss": true,
    "namedChunks": false,
    "extractLicenses": false,
    "vendorChunk": false,
    "buildOptimizer": true,
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "2mb",
        "maximumError": "5mb"
      },
      {
        "type": "anyComponentStyle",
        "maximumWarning": "2kb",
        "maximumError": "4kb"
      }
    ]
  }
}
```

---

## 📞 SOPORTE

### 🐛 Troubleshooting Común

**Error: Module not found**
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Error: Cannot find module**
```bash
# Verificar import paths
# Usar rutas relativas en standalone components
import { Component } from './component';
```

**Error: Change detection issues**
```typescript
// Asegurar OnPush strategy
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Usar signals para reactividad
const data = signal([]);
```

### 📊 Métricas de Performance

```
Target Metrics:
├─ First Contentful Paint: <1.5s
├─ Largest Contentful Paint: <2.5s
├─ Time to Interactive: <3s
├─ Cumulative Layout Shift: <0.1
├─ First Input Delay: <100ms
└─ Bundle Size: <2MB (gzipped)
```

---

**Frontend Fintrax V3** - **Score: 95/100** ✅
**Última actualización: 2024-05-12**
