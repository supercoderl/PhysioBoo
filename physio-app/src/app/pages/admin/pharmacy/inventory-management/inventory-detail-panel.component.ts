import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { InventoryMedicineDetail, InventoryStockStatus } from "../../../../shared/types/inventory-management.types";

@Component({
    selector: 'inventory-detail-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent, StatusBadgeComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-regular">Inventory Details</h2>
        <button type="button" *ngIf="detail()" (click)="viewFullDetail.emit()" class="text-[11px] font-semibold text-primary hover:underline">View Full Detail</button>
      </div>

      <boo-empty-state *ngIf="!medicineId" icon="package" title="Select a medicine" description="Choose a medicine from the Inventory Explorer to see its details."
        class="flex-1 flex items-center justify-center"></boo-empty-state>

      <div *ngIf="medicineId && loading()" class="flex-1 flex items-center justify-center">
        <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
      </div>

      <div *ngIf="medicineId && !loading() && detail()" class="flex-1 overflow-y-auto p-3 space-y-3">
        <div>
          <div class="flex items-center justify-between mb-1">
            <p class="text-sm font-semibold text-regular">{{ detail()!.name }}</p>
            <boo-status-badge [label]="statusLabel(detail()!.status)" [tone]="statusTone(detail()!.status)" dotted></boo-status-badge>
          </div>
          <p class="text-[11px] text-secondary">{{ detail()!.genericName }} · {{ detail()!.manufacturer }} · {{ detail()!.category }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Current Stock</span><p class="font-semibold text-regular">{{ detail()!.currentStock }} {{ detail()!.unit }}</p></div>
          <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Safety Stock</span><p class="font-semibold text-regular">{{ detail()!.safetyStock }}</p></div>
          <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Reorder Level</span><p class="font-semibold text-regular">{{ detail()!.reorderLevel }}</p></div>
          <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Avg Unit Cost</span><p class="font-semibold text-regular">{{ '$' + detail()!.averageUnitCost.toFixed(2) }}</p></div>
        </div>

        <div class="rounded-1.5 bg-primary/5 px-3 py-2 flex items-center justify-between">
          <span class="text-xs text-secondary">Total Inventory Value</span>
          <span class="text-sm font-bold text-primary">{{ '$' + detail()!.totalValue.toFixed(2) }}</span>
        </div>

        <div>
          <p class="text-[11px] font-semibold text-secondary uppercase mb-1.5">Storage Locations</p>
          <div class="flex flex-wrap gap-1.5">
            <span *ngFor="let loc of detail()!.storageLocations" class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px]">{{ loc }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InventoryDetailPanelComponent implements OnChanges {
    @Input() medicineId: string | null = null;
    @Output() viewFullDetail = new EventEmitter<void>();

    loading = signal(false);
    detail = signal<InventoryMedicineDetail | null>(null);

    constructor(private srv: InventoryManagementService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['medicineId']) {
            if (!this.medicineId) { this.detail.set(null); return; }
            this.loading.set(true);
            this.srv.getMedicineDetail(this.medicineId).subscribe({
                next: res => { if (res.success) this.detail.set(res.data); this.loading.set(false); },
                error: () => this.loading.set(false),
            });
        }
    }

    statusLabel(status: InventoryStockStatus): string {
        if (status === 'InStock') return 'In Stock';
        if (status === 'LowStock') return 'Low Stock';
        return 'Out of Stock';
    }

    statusTone(status: InventoryStockStatus): BadgeTone {
        if (status === 'InStock') return 'success';
        if (status === 'LowStock') return 'warning';
        return 'danger';
    }
}
