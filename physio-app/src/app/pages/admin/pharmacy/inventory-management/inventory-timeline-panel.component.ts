import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockMovementEvent, StockMovementType } from "../../../../shared/types/inventory-management.types";

const MOVEMENT_ICON: Record<StockMovementType, string> = {
    Purchase: 'shopping-cart',
    Receiving: 'truck',
    Transfer: 'repeat',
    Dispense: 'pill',
    RetailSale: 'receipt',
    Return: 'undo-2',
    Adjustment: 'settings-2',
    Disposal: 'trash-2',
    Expiry: 'calendar-clock',
};

interface DayGroup {
    label: string;
    events: StockMovementEvent[];
}

@Component({
    selector: 'inventory-timeline-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-regular">Warehouse Timeline</h2>
        <div class="flex items-center gap-2">
          <select [(ngModel)]="typeFilter" (ngModelChange)="apply()" class="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg">
            <option value="">All Movement Types</option>
            <option *ngFor="let t of movementTypes" [value]="t">{{ t }}</option>
          </select>
          <div class="relative">
            <boo-icon name="search" [size]="13" iconClass="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
            <input type="text" [(ngModel)]="query" (ngModelChange)="apply()" placeholder="Filter by medicine, zone, or user..."
              class="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg w-64" />
          </div>
        </div>
      </div>

      <div class="p-3">
        <div *ngIf="loading()" class="flex items-center justify-center py-12">
          <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
        </div>

        <boo-empty-state *ngIf="!loading() && !groups().length" icon="clock" title="No movements match these filters"></boo-empty-state>

        <div *ngFor="let group of groups()" class="mb-4">
          <p class="text-[11px] font-semibold text-secondary uppercase mb-2">{{ group.label }}</p>
          <div class="space-y-2 border-l-2 border-gray-100 pl-3">
            <div *ngFor="let e of group.events" class="flex items-start gap-2.5">
              <span class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 -ml-[27px] ring-4 ring-surface">
                <boo-icon [name]="movementIcon(e.type)" [size]="13" [iconClass]="e.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'"></boo-icon>
              </span>
              <div class="min-w-0">
                <p class="text-xs text-regular">
                  <span class="font-semibold">{{ e.type }}</span> · {{ e.medicineName }}
                  <span [ngClass]="e.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'" class="font-semibold">{{ e.quantity > 0 ? '+' : '' }}{{ e.quantity }}</span>
                  <span *ngIf="e.batchNo" class="text-secondary"> · Batch {{ e.batchNo }}</span>
                </p>
                <p class="text-[11px] text-secondary">{{ e.warehouseZone }} · {{ e.performedBy }} · {{ e.occurredAt | date:'short' }} <span *ngIf="e.reference"> · {{ e.reference }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InventoryTimelinePanelComponent implements OnInit {
    loading = signal(true);
    allEvents = signal<StockMovementEvent[]>([]);
    groups = signal<DayGroup[]>([]);

    query = '';
    typeFilter: StockMovementType | '' = '';

    readonly movementTypes: StockMovementType[] = ['Purchase', 'Receiving', 'Transfer', 'Dispense', 'RetailSale', 'Return', 'Adjustment', 'Disposal', 'Expiry'];

    constructor(private srv: InventoryManagementService) { }

    ngOnInit(): void {
        this.srv.getMovements().subscribe({
            next: res => { if (res.success) this.allEvents.set(res.data.items); this.apply(); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    movementIcon(type: StockMovementType): string {
        return MOVEMENT_ICON[type];
    }

    apply(): void {
        let list = this.allEvents();
        if (this.typeFilter) list = list.filter(e => e.type === this.typeFilter);
        if (this.query) {
            const q = this.query.toLowerCase();
            list = list.filter(e => e.medicineName.toLowerCase().includes(q) || e.warehouseZone.toLowerCase().includes(q) || e.performedBy.toLowerCase().includes(q));
        }
        const byDay = new Map<string, StockMovementEvent[]>();
        for (const e of list) {
            const label = new Date(e.occurredAt).toDateString();
            byDay.set(label, [...(byDay.get(label) ?? []), e]);
        }
        this.groups.set(Array.from(byDay.entries()).map(([label, events]) => ({ label, events })));
    }
}
