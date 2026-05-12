import { Component, input, output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  action: string;
  route?: string;
}

@Component({
  selector: 'app-quick-actions-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss'
})
export class QuickActionsWidgetComponent {
  
  // Inputs
  actions = input<QuickAction[]>([]);
  columns = input<number>(2);
  showLabels = input<boolean>(true);
  compactMode = input<boolean>(false);
  
  // Outputs
  actionClick = output<QuickAction>();
  
  constructor(private router: Router) {}
  
  // ============================================
  // ✅ ACCIONES POR DEFECTO
  // ============================================
  
  defaultActions: QuickAction[] = [
    {
      id: 'add-transaction',
      label: 'Nueva Transacción',
      icon: '💰',
      description: 'Agregar ingreso o gasto',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: 'navigate',
      route: '/transactions/new'
    },
    {
      id: 'add-card',
      label: 'Agregar Tarjeta',
      icon: '💳',
      description: 'Registrar nueva tarjeta',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      action: 'navigate',
      route: '/cards/new'
    },
    {
      id: 'add-goal',
      label: 'Nueva Meta',
      icon: '🎯',
      description: 'Crear meta de ahorro',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: 'navigate',
      route: '/goals/new'
    },
    {
      id: 'view-reports',
      label: 'Ver Reportes',
      icon: '📊',
      description: 'Análisis financiero',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      action: 'navigate',
      route: '/reports'
    }
  ];
  
  // ============================================
  // ✅ COMPUTED PROPERTIES
  // ============================================
  
  // Usar acciones por defecto si no se proporcionan
  currentActions = computed(() => {
    return this.actions().length > 0 ? this.actions() : this.defaultActions;
  });
  
  // Clases CSS para grid
  gridClasses = computed(() => {
    const cols = this.columns();
    return `grid grid-cols-${cols} gap-4`;
  });
  
  // ============================================
  // ✅ MÉTODOS DE ACCIÓN
  // ============================================
  
  /**
   * Maneja el click en una acción
   */
  onActionClick(action: QuickAction): void {
    this.actionClick.emit(action);
    
    switch (action.action) {
      case 'navigate':
        if (action.route) {
          this.router.navigate([action.route]);
        }
        break;
      case 'emit':
        // Solo emitir el evento
        break;
      case 'function':
        // Para acciones personalizadas
        break;
      default:
        console.log(`Action: ${action.id}`);
    }
  }
  
  /**
   * Maneja el click con teclado (accesibilidad)
   */
  onActionKeydown(event: KeyboardEvent, action: QuickAction): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onActionClick(action);
    }
  }
  
  // ============================================
  // ✅ UTILIDADES
  // ============================================
  
  /**
   * Verifica si hay acciones disponibles
   */
  hasActions(): boolean {
    return this.currentActions().length > 0;
  }
  
  /**
   * Obtiene el número de acciones
   */
  getActionsCount(): number {
    return this.currentActions().length;
  }
  
  /**
   * Verifica si está en modo compacto
   */
  isCompactMode(): boolean {
    return this.compactMode();
  }
  
  /**
   * Obtiene las clases CSS para una acción
   */
  getActionClasses(action: QuickAction): string {
    const baseClasses = 'action-card p-4 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2';
    const colorClasses = action.bgColor;
    const compactClasses = this.isCompactMode() ? 'p-3' : 'p-4';
    
    return `${baseClasses} ${colorClasses} ${compactClasses}`;
  }
  
  /**
   * Obtiene el tamaño del icono
   */
  getIconSize(): string {
    return this.isCompactMode() ? 'text-2xl' : 'text-3xl';
  }
  
  /**
   * Obtiene el tamaño del texto
   */
  getTextSize(): string {
    return this.isCompactMode() ? 'text-sm' : 'text-base';
  }
}
