import { Component, EventEmitter, Input, Output } from "@angular/core";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { InventoryKpis } from "../../../../shared/types/inventory-management.types";

interface KpiDef {
    key: string;
    label: string;
    icon: string;
    tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    value: (k: InventoryKpis) => string | number;
}

@Component({
    selector: 'inventory-kpi-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent],
    template: `
    <div class="flex items-center gap-3 overflow-x-auto pb-1">
      <button type="button" *ngFor="let def of defs" (click)="kpiClick.emit(def.key)" class="shrink-0 text-left">
        <boo-stat-card [label]="def.label" [value]="kpis ? def.value(kpis) : '—'" [icon]="def.icon" [tone]="def.tone"></boo-stat-card>
      </button>
    </div>
  `,
})
export class InventoryKpiStripComponent {
    @Input() kpis: InventoryKpis | null = null;
    @Output() kpiClick = new EventEmitter<string>();

    readonly defs: KpiDef[] = [
        { key: 'value', label: 'Total Inventory Value', icon: 'dollar-sign', tone: 'primary', value: k => '$' + k.totalInventoryValue.toLocaleString() },
        { key: 'medicines', label: 'Total Medicines', icon: 'pill', tone: 'neutral', value: k => k.totalMedicines },
        { key: 'available', label: 'Available Stock', icon: 'package', tone: 'success', value: k => k.availableStock.toLocaleString() },
        { key: 'reserved', label: 'Reserved Stock', icon: 'package-search', tone: 'neutral', value: k => k.reservedStock.toLocaleString() },
        { key: 'lowStock', label: 'Low Stock Items', icon: 'trending-down', tone: 'warning', value: k => k.lowStockCount },
        { key: 'outOfStock', label: 'Out of Stock', icon: 'package-x', tone: 'danger', value: k => k.outOfStockCount },
        { key: 'nearExpiry', label: 'Near Expiry', icon: 'calendar-clock', tone: 'warning', value: k => k.nearExpiryCount },
        { key: 'expired', label: 'Expired Items', icon: 'triangle-alert', tone: 'danger', value: k => k.expiredCount },
        { key: 'movements', label: "Today's Movements", icon: 'activity', tone: 'primary', value: k => k.todayMovementsCount },
        { key: 'pendingPo', label: 'Pending Purchase Orders', icon: 'clipboard-list', tone: 'neutral', value: k => k.pendingPurchaseOrders },
    ];
}
