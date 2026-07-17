import { Component, Input, OnInit, signal } from "@angular/core";
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

@Component({
    selector: 'inventory-activity-feed',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60">
        <h2 class="text-sm font-semibold text-regular">Warehouse Activity</h2>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <div *ngIf="loading()" class="flex items-center justify-center py-16">
          <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
        </div>

        <boo-empty-state *ngIf="!loading() && !events().length" icon="activity" title="No recent activity"></boo-empty-state>

        <div class="space-y-2.5">
          <div *ngFor="let e of events()" class="flex items-start gap-2.5">
            <span class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <boo-icon [name]="movementIcon(e.type)" [size]="13" [iconClass]="e.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'"></boo-icon>
            </span>
            <div class="min-w-0">
              <p class="text-xs text-regular leading-tight">
                <span class="font-semibold">{{ e.type }}</span> · {{ e.medicineName }}
                <span [ngClass]="e.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'" class="font-semibold">{{ e.quantity > 0 ? '+' : '' }}{{ e.quantity }}</span>
              </p>
              <p class="text-[11px] text-secondary">{{ e.warehouseZone }} · {{ e.performedBy }} · {{ e.occurredAt | date:'shortTime' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InventoryActivityFeedComponent implements OnInit {
    @Input() limit = 6;

    loading = signal(true);
    events = signal<StockMovementEvent[]>([]);

    constructor(private srv: InventoryManagementService) { }

    ngOnInit(): void {
        this.srv.getMovements().subscribe({
            next: res => { if (res.success) this.events.set(res.data.items.slice(0, this.limit)); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    movementIcon(type: StockMovementType): string {
        return MOVEMENT_ICON[type];
    }
}
