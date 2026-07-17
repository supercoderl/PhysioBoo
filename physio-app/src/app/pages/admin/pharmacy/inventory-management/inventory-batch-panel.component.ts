import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { BatchLifecycleStatus, WarehouseBatch } from "../../../../shared/types/inventory-management.types";

@Component({
    selector: 'inventory-batch-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent, StatusBadgeComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-regular">Batch Management</h2>
        <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5" *ngIf="medicineId">
          <button type="button" (click)="setSort('FEFO')" class="px-2 py-1 rounded-md text-[11px] font-semibold" [ngClass]="sort() === 'FEFO' ? 'bg-surface shadow-sm text-primary' : 'text-gray-500'">FEFO</button>
          <button type="button" (click)="setSort('FIFO')" class="px-2 py-1 rounded-md text-[11px] font-semibold" [ngClass]="sort() === 'FIFO' ? 'bg-surface shadow-sm text-primary' : 'text-gray-500'">FIFO</button>
        </div>
      </div>

      <boo-empty-state *ngIf="!medicineId" icon="layers" title="No medicine selected"
        class="flex-1 flex items-center justify-center"></boo-empty-state>

      <div *ngIf="medicineId && loading()" class="flex-1 flex items-center justify-center">
        <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
      </div>

      <div *ngIf="medicineId && !loading()" class="flex-1 overflow-y-auto p-3 space-y-2">
        <boo-empty-state *ngIf="!batches().length" icon="package-x" title="No batches in stock"></boo-empty-state>

        <div *ngFor="let b of batches()" class="rounded-1.5 border p-2.5" [ngClass]="b.isExpired ? 'border-rose-300 bg-rose-50/30' : 'border-borderGray/60'">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-regular">{{ b.batchNo }}</span>
            <boo-status-badge [label]="b.status" [tone]="statusTone(b.status)" dotted></boo-status-badge>
          </div>
          <p class="text-[11px] text-secondary mb-1.5">
            Mfg {{ b.manufacturingDate | date:'mediumDate' }} · Exp
            <span [ngClass]="b.isExpired ? 'text-rose-600 font-semibold' : b.isNearExpiry ? 'text-amber-600 font-semibold' : ''">{{ b.expiryDate | date:'mediumDate' }}</span>
          </p>
          <div class="grid grid-cols-3 gap-1.5 text-[11px] mb-1.5">
            <div><span class="text-secondary">Qty</span><p class="font-semibold text-regular">{{ b.quantity }}</p></div>
            <div><span class="text-secondary">Reserved</span><p class="font-semibold text-regular">{{ b.reservedQuantity }}</p></div>
            <div><span class="text-secondary">Available</span><p class="font-semibold text-regular">{{ b.availableQuantity }}</p></div>
          </div>
          <p class="text-[11px] text-secondary mb-2">{{ b.supplier }} · {{ '$' + b.purchasePrice.toFixed(2) }} · {{ b.storageLocation }}</p>
          <div class="flex items-center gap-1">
            <button type="button" (click)="transfer.emit(b)" title="Transfer" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100">
              <boo-icon name="repeat" [size]="13" iconClass="text-gray-500"></boo-icon>
            </button>
            <button type="button" (click)="lock(b)" title="Lock Batch" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100">
              <boo-icon name="lock" [size]="13" iconClass="text-gray-500"></boo-icon>
            </button>
            <button type="button" (click)="dispose(b)" title="Dispose Batch" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50">
              <boo-icon name="trash-2" [size]="13" iconClass="text-rose-500"></boo-icon>
            </button>
            <button type="button" (click)="printBarcode.emit(b)" title="Print Barcode" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100">
              <boo-icon name="qr-code" [size]="13" iconClass="text-gray-500"></boo-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InventoryBatchPanelComponent implements OnChanges {
    @Input() medicineId: string | null = null;
    @Output() transfer = new EventEmitter<WarehouseBatch>();
    @Output() printBarcode = new EventEmitter<WarehouseBatch>();
    @Output() batchesChanged = new EventEmitter<WarehouseBatch[]>();

    loading = signal(false);
    batches = signal<WarehouseBatch[]>([]);
    sort = signal<'FEFO' | 'FIFO'>('FEFO');

    constructor(private srv: InventoryManagementService, private dialogSrv: DialogService, private toastSrv: ToastService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['medicineId']) this.load();
    }

    setSort(sort: 'FEFO' | 'FIFO'): void {
        this.sort.set(sort);
        this.load();
    }

    private load(): void {
        if (!this.medicineId) { this.batches.set([]); return; }
        this.loading.set(true);
        this.srv.getBatches(this.medicineId, this.sort()).subscribe({
            next: res => { if (res.success) { this.batches.set(res.data); this.batchesChanged.emit(res.data); } this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    lock(batch: WarehouseBatch): void {
        this.dialogSrv.confirm(
            `Lock batch ${batch.batchNo}? It will be quarantined from dispensing/transfer pending review.`,
            () => {
                this.srv.lockBatch(batch.id, 'Pharmacist review').subscribe();
                this.batches.update(list => list.map(b => b.id === batch.id ? { ...b, status: 'Locked' } : b));
                this.toastSrv.success(`Batch ${batch.batchNo} locked`);
            },
            'Lock Batch', 'warning', 'Lock', 'Cancel',
        );
    }

    dispose(batch: WarehouseBatch): void {
        this.dialogSrv.confirm(
            `Dispose batch ${batch.batchNo} (${batch.quantity} units)? This cannot be undone.`,
            () => {
                this.srv.disposeBatch(batch.id, { reason: 'Pharmacist disposal', quantity: batch.quantity }).subscribe();
                this.batches.update(list => list.map(b => b.id === batch.id ? { ...b, status: 'Disposed', quantity: 0, availableQuantity: 0 } : b));
                this.toastSrv.success(`Batch ${batch.batchNo} disposed`);
            },
            'Dispose Batch', 'danger', 'Dispose', 'Cancel',
        );
    }

    statusTone(status: BatchLifecycleStatus): BadgeTone {
        switch (status) {
            case 'Active': return 'success';
            case 'Reserved': return 'primary';
            case 'Locked': return 'warning';
            case 'Disposed': return 'neutral';
            case 'Expired': return 'danger';
            default: return 'neutral';
        }
    }
}
