import { Component, HostListener, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { DispensingService } from "../../../../services/admin/dispensing.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    BatchOption,
    DispenseMedicationItem,
    DispenseMedicineAlternative,
    DispenseMedicineDetail,
    DispenseQueueItem,
    DispenseQueueStatus,
    DispenseWorkspace,
} from "../../../../shared/types/dispensing.types";
import { DispenseMedicationDrawerComponent } from "./dispense-medication-drawer.component";
import { DispensePickingPanelComponent } from "./dispense-picking-panel.component";
import { DispenseQueuePanelComponent } from "./dispense-queue-panel.component";
import { DispenseSummaryPanelComponent } from "./dispense-summary-panel.component";

@Component({
    selector: 'admin-prescription-dispense',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        DispenseQueuePanelComponent,
        DispensePickingPanelComponent,
        DispenseSummaryPanelComponent,
        DispenseMedicationDrawerComponent,
    ],
    host: { class: 'block min-h-screen bg-gray-50' },
    template: `
    <div class="sticky top-0 z-20 bg-surface shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-gray-800">Prescription Dispense</h1>
        <p class="text-xs text-secondary">Clinical dispensing workspace · Pharmacist: Current Pharmacist</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-secondary">
        <boo-icon name="clock" [size]="14"></boo-icon>
        <span>{{ now | date:'mediumTime' }}</span>
      </div>
    </div>

    <main class="px-4 sm:px-6 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_2fr_1fr] gap-4">
        <div class="h-[calc(100vh-220px)] min-h-[480px]">
          <dispense-queue-panel
            [items]="queue()"
            [selectedQueueId]="selectedQueueId()"
            [search]="search()"
            [statusFilter]="statusFilter()"
            [autoRefresh]="autoRefresh()"
            (select)="onSelectQueueItem($event)"
            (searchChange)="onSearchChange($event)"
            (statusFilterChange)="statusFilter.set($event)"
            (autoRefreshChange)="autoRefresh.set($event)"
          ></dispense-queue-panel>
        </div>

        <div class="h-[calc(100vh-220px)] min-h-[480px] md:col-span-2 lg:col-span-1">
          <dispense-picking-panel
            [workspace]="workspace()"
            (openDrawer)="openMedicationDrawer($event)"
            (qtyChange)="onQtyChange($event)"
            (pickItem)="onTogglePick($event)"
            (acknowledgeAlert)="onAcknowledgeAlert($event)"
            (replaceItem)="openMedicationDrawer($event)"
            (reserveItem)="onReserveItem($event)"
            (cancelItem)="onCancelItem($event)"
            (notesChange)="onNotesChange($event)"
            (barcodeScan)="onBarcodeScan($event)"
          ></dispense-picking-panel>
        </div>

        <div class="h-[calc(100vh-220px)] min-h-[480px]">
          <dispense-summary-panel
            [workspace]="workspace()"
            (complete)="onCompleteDispensing()"
            (hold)="onHoldPrescription()"
            (cancel)="onCancelPrescription()"
            (printLabels)="onPrintLabels()"
          ></dispense-summary-panel>
        </div>
      </div>
    </main>

    <dispense-medication-drawer
      [isOpen]="drawerOpen()"
      [item]="drawerItem()"
      [detail]="drawerDetail()"
      (close)="drawerOpen.set(false)"
      (selectBatch)="onSelectBatch($event)"
      (selectAlternative)="onSelectAlternative($event)"
    ></dispense-medication-drawer>
  `,
})
export class AdminPrescriptionDispenseComponent implements OnInit {
    now = new Date();

    queue = signal<DispenseQueueItem[]>([]);
    selectedQueueId = signal<string | null>(null);
    workspace = signal<DispenseWorkspace | null>(null);
    search = signal('');
    statusFilter = signal<DispenseQueueStatus | null>(null);
    autoRefresh = signal(true);

    drawerOpen = signal(false);
    drawerItem = signal<DispenseMedicationItem | null>(null);
    drawerDetail = signal<DispenseMedicineDetail | null>(null);

    private searchDebounce: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private srv: DispensingService,
        private toastSrv: ToastService,
        private dialogSrv: DialogService,
    ) { }

    ngOnInit(): void {
        this.loadQueue();
    }

    @HostListener('window:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key.toLowerCase() === 'b') {
            event.preventDefault();
            const barcodeInput = document.querySelector<HTMLInputElement>('input.allow-shortcut');
            barcodeInput?.focus();
        }
        if (event.key === 'Escape') this.drawerOpen.set(false);
    }

    loadQueue(): void {
        this.srv.getQueue(this.search(), this.statusFilter()).subscribe(res => {
            if (res.success) this.queue.set(res.data.items);
        });
    }

    onSearchChange(value: string): void {
        this.search.set(value);
        if (this.searchDebounce) clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => this.loadQueue(), 300);
    }

    onSelectQueueItem(item: DispenseQueueItem): void {
        this.selectedQueueId.set(item.queueId);
        this.srv.getWorkspace(item.queueId).subscribe(res => {
            if (res.success) {
                this.workspace.set({ ...res.data, dispensingStartedAt: res.data.dispensingStartedAt ?? new Date().toISOString() });
            }
        });
    }

    private updateItem(itemId: string, updater: (item: DispenseMedicationItem) => DispenseMedicationItem): void {
        const ws = this.workspace();
        if (!ws) return;
        this.workspace.set({ ...ws, items: ws.items.map(i => i.id === itemId ? updater(i) : i) });
    }

    onQtyChange(payload: { itemId: string; qty: number }): void {
        const ws = this.workspace();
        if (!ws) return;
        this.updateItem(payload.itemId, i => ({ ...i, qtyToDispense: payload.qty }));
        this.srv.updateItem(ws.workspaceId, payload.itemId, { qtyToDispense: payload.qty }).subscribe();
    }

    onTogglePick(item: DispenseMedicationItem): void {
        const ws = this.workspace();
        if (!ws) return;
        const nextStatus = item.status === 'NotPicked' ? 'Picked' : 'NotPicked';
        this.updateItem(item.id, i => ({ ...i, status: nextStatus }));
        this.srv.updateItem(ws.workspaceId, item.id, { status: nextStatus }).subscribe();
        if (nextStatus === 'Picked') this.toastSrv.success(`${item.name} picked`);
    }

    onAcknowledgeAlert(payload: { itemId: string; alertId: string }): void {
        const ws = this.workspace();
        if (!ws) return;
        this.updateItem(payload.itemId, i => ({
            ...i,
            warnings: i.warnings.map(w => w.id === payload.alertId ? { ...w, acknowledged: true } : w),
        }));
        this.srv.acknowledgeAlert(ws.workspaceId, payload.alertId).subscribe();
        this.toastSrv.success('Clinical alert acknowledged');
    }

    onReserveItem(item: DispenseMedicationItem): void {
        const ws = this.workspace();
        if (!ws) return;
        this.updateItem(item.id, i => ({ ...i, status: 'Reserved' }));
        this.srv.reserveItem(ws.workspaceId, item.id).subscribe();
        this.toastSrv.info(`${item.name} reserved for back-order`);
    }

    onCancelItem(item: DispenseMedicationItem): void {
        this.dialogSrv.confirm(
            `Cancel ${item.name} from this prescription? This cannot be undone.`,
            () => {
                this.updateItem(item.id, i => ({ ...i, status: 'OnHold' }));
                this.toastSrv.info(`${item.name} cancelled from dispensing`);
            },
            'Cancel Item',
            'danger',
            'Cancel Item',
            'Keep Item',
        );
    }

    onNotesChange(notes: string): void {
        const ws = this.workspace();
        if (!ws) return;
        this.workspace.set({ ...ws, pharmacistNotes: notes });
    }

    onBarcodeScan(code: string): void {
        const ws = this.workspace();
        if (!ws) return;
        const match = ws.items.find(i => i.batchNo === code || i.medicineId === code);
        if (!match) {
            this.toastSrv.error(`Barcode "${code}" did not match any line in this prescription`);
            return;
        }
        this.srv.scanItem(ws.workspaceId, match.id, code).subscribe(res => {
            if (res.success && res.data.matched) {
                this.onTogglePick(match);
            } else {
                this.toastSrv.error(`Barcode mismatch for ${match.name}`);
            }
        });
    }

    openMedicationDrawer(item: DispenseMedicationItem): void {
        this.drawerItem.set(item);
        this.drawerOpen.set(true);
        this.drawerDetail.set(null);
        this.srv.getMedicineDetail(item.medicineId).subscribe(res => {
            if (res.success) this.drawerDetail.set(res.data);
        });
    }

    onSelectBatch(batch: BatchOption): void {
        const item = this.drawerItem();
        const ws = this.workspace();
        if (!item || !ws) return;
        this.updateItem(item.id, i => ({ ...i, batchNo: batch.batchNo, expiryDate: batch.expiryDate, shelfLocation: batch.location }));
        this.drawerItem.set({ ...item, batchNo: batch.batchNo, expiryDate: batch.expiryDate, shelfLocation: batch.location });
        this.srv.updateItem(ws.workspaceId, item.id, { batchNo: batch.batchNo }).subscribe();
        this.toastSrv.success(`Batch ${batch.batchNo} selected`);
    }

    onSelectAlternative(alt: DispenseMedicineAlternative): void {
        const item = this.drawerItem();
        const ws = this.workspace();
        if (!item || !ws) return;
        this.dialogSrv.confirm(
            `Replace ${item.name} with ${alt.name}?`,
            () => {
                this.updateItem(item.id, i => ({ ...i, name: alt.name, medicineId: alt.id, status: 'Replaced' }));
                this.srv.replaceItem(ws.workspaceId, item.id, alt.id, 'Pharmacist substitution').subscribe();
                this.drawerOpen.set(false);
                this.toastSrv.success(`Replaced with ${alt.name}`);
            },
            'Replace Medicine',
            'warning',
            'Replace',
            'Keep Original',
        );
    }

    onCompleteDispensing(): void {
        const ws = this.workspace();
        if (!ws) return;
        this.dialogSrv.confirm(
            `Complete dispensing for ${ws.prescriptionNumber}? Inventory will be deducted and this cannot be undone.`,
            () => {
                this.srv.completeDispensing(ws.workspaceId, ws.pharmacistNotes).subscribe(res => {
                    if (res.success) {
                        this.workspace.set({ ...ws, status: 'Completed', currentStage: 'Completed' });
                        this.queue.update(list => list.map(q => q.queueId === ws.queueId ? { ...q, status: 'Completed' } : q));
                        this.toastSrv.success(`Prescription ${ws.prescriptionNumber} dispensed successfully`, 'Dispensing Complete');
                    }
                });
            },
            'Complete Dispensing',
            'success',
            'Complete',
            'Review Again',
        );
    }

    onHoldPrescription(): void {
        const ws = this.workspace();
        if (!ws) return;
        this.dialogSrv.confirm(
            `Put ${ws.prescriptionNumber} on hold and return it to the queue?`,
            () => {
                this.srv.holdPrescription(ws.workspaceId, 'Pharmacist hold').subscribe();
                this.queue.update(list => list.map(q => q.queueId === ws.queueId ? { ...q, status: 'OnHold' } : q));
                this.workspace.set(null);
                this.selectedQueueId.set(null);
                this.toastSrv.info(`${ws.prescriptionNumber} put on hold`);
            },
            'Hold Prescription',
            'warning',
            'Put on Hold',
            'Keep Working',
        );
    }

    onCancelPrescription(): void {
        const ws = this.workspace();
        if (!ws) return;
        this.dialogSrv.confirm(
            `Cancel dispensing for ${ws.prescriptionNumber}? This cannot be undone.`,
            () => {
                this.srv.cancelPrescription(ws.workspaceId, 'Pharmacist cancellation').subscribe();
                this.queue.update(list => list.map(q => q.queueId === ws.queueId ? { ...q, status: 'Cancelled' } : q));
                this.workspace.set(null);
                this.selectedQueueId.set(null);
                this.toastSrv.info(`${ws.prescriptionNumber} cancelled`);
            },
            'Cancel Prescription',
            'danger',
            'Cancel Prescription',
            'Keep Working',
        );
    }

    onPrintLabels(): void {
        if (!this.workspace()) return;
        this.toastSrv.success('Medication labels sent to printer');
    }
}
