import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    InventoryAlert,
    InventoryKpis,
    InventoryMedicineCard,
    InventoryMedicineDetail,
    WarehouseBatch,
    WarehouseZone,
} from "../../../../shared/types/inventory-management.types";
import { InventoryActivityFeedComponent } from "./inventory-activity-feed.component";
import { InventoryAlertsPanelComponent } from "./inventory-alerts-panel.component";
import { InventoryBatchPanelComponent } from "./inventory-batch-panel.component";
import { InventoryDetailDrawerComponent } from "./inventory-detail-drawer.component";
import { InventoryDetailPanelComponent } from "./inventory-detail-panel.component";
import { InventoryExplorerPanelComponent } from "./inventory-explorer-panel.component";
import { InventoryIntelligencePanelComponent } from "./inventory-intelligence-panel.component";
import { InventoryKpiStripComponent } from "./inventory-kpi-strip.component";
import { InventoryQuickActionsComponent, QuickOperation } from "./inventory-quick-actions.component";
import { InventoryTimelinePanelComponent } from "./inventory-timeline-panel.component";

@Component({
    selector: 'admin-inventory-management',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        ErrorStateComponent,
        InventoryKpiStripComponent,
        InventoryExplorerPanelComponent,
        InventoryIntelligencePanelComponent,
        InventoryActivityFeedComponent,
        InventoryDetailPanelComponent,
        InventoryBatchPanelComponent,
        InventoryAlertsPanelComponent,
        InventoryTimelinePanelComponent,
        InventoryDetailDrawerComponent,
        InventoryQuickActionsComponent,
    ],
    host: { class: 'block min-h-screen bg-gray-50' },
    template: `
    <div class="sticky top-0 z-20 bg-surface shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-gray-800">Inventory Management</h1>
        <p class="text-xs text-secondary">Warehouse command center · Last sync {{ lastSync | date:'shortTime' }}</p>
      </div>
      <button type="button" (click)="refresh()" class="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
        <boo-icon name="refresh-cw" [size]="14"></boo-icon> Refresh
      </button>
    </div>

    <main class="px-4 sm:px-6 py-4 space-y-4">
      <div *ngIf="error()" class="bg-surface rounded-2 border border-borderGray/60">
        <boo-error-state title="Couldn't load inventory KPIs" [description]="error()" (retry)="retryLoad()"></boo-error-state>
      </div>
      <inventory-kpi-strip *ngIf="!error()" [kpis]="kpis()" (kpiClick)="onKpiClick($event)"></inventory-kpi-strip>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1.1fr_1fr] gap-4">
        <div class="h-[560px]">
          <inventory-explorer-panel [selectedId]="selectedMedicineId()" (select)="onSelectMedicine($event)" (zoneFilter)="onZoneFilter($event)"></inventory-explorer-panel>
        </div>
        <div class="h-[560px]">
          <inventory-intelligence-panel [medicineId]="selectedMedicineId()" [medicineName]="selectedMedicineName()"></inventory-intelligence-panel>
        </div>
        <div class="h-[560px] md:col-span-2 lg:col-span-1">
          <inventory-activity-feed [limit]="8"></inventory-activity-feed>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr] gap-4">
        <div class="h-[420px]">
          <inventory-detail-panel [medicineId]="selectedMedicineId()" (viewFullDetail)="openDrawer()"></inventory-detail-panel>
        </div>
        <div class="h-[420px] md:col-span-2 lg:col-span-1">
          <inventory-batch-panel [medicineId]="selectedMedicineId()" (transfer)="onTransfer($event)" (printBarcode)="onPrintBarcode($event)" (batchesChanged)="batches.set($event)"></inventory-batch-panel>
        </div>
        <div class="h-[420px]">
          <inventory-alerts-panel [medicineId]="selectedMedicineId()" (acknowledge)="onAlertAcknowledged($event)"></inventory-alerts-panel>
        </div>
      </div>

      <inventory-timeline-panel></inventory-timeline-panel>
    </main>

    <inventory-detail-drawer
      [isOpen]="drawerOpen()"
      [detail]="drawerDetail()"
      [batches]="batches()"
      (close)="drawerOpen.set(false)"
      (receiveStock)="onQuickAction('Receiving')"
      (transferStock)="onQuickAction('Transfer')"
      (adjustQuantity)="onQuickAction('Adjustment')"
      (reserveStock)="onReserveStock()"
      (disposeBatchAction)="onDisposeFromDrawer()"
      (printBarcode)="onPrintBarcodeFromDrawer()"
    ></inventory-detail-drawer>

    <inventory-quick-actions (select)="onQuickAction($event)"></inventory-quick-actions>
  `,
})
export class AdminInventoryManagementComponent implements OnInit {
    lastSync = new Date();

    kpis = signal<InventoryKpis | null>(null);
    error = signal<string | null>(null);
    selectedMedicineId = signal<string | null>(null);
    selectedMedicineName = signal<string | null>(null);
    batches = signal<WarehouseBatch[]>([]);

    drawerOpen = signal(false);
    drawerDetail = signal<InventoryMedicineDetail | null>(null);

    constructor(
        private srv: InventoryManagementService,
        private toastSrv: ToastService,
        private dialogSrv: DialogService,
    ) { }

    ngOnInit(): void {
        this.refresh();
    }

    retryLoad(): void {
        this.refresh();
    }

    refresh(): void {
        this.lastSync = new Date();
        this.error.set(null);
        this.srv.getKpis().subscribe({
            next: res => { if (res.success) this.kpis.set(res.data); },
            error: () => { this.error.set('Failed to load inventory KPIs. Please try again.'); },
        });
    }

    onKpiClick(key: string): void {
        this.toastSrv.info(`Filtering Inventory Explorer by "${key}" (placeholder — backend filter not wired yet)`);
    }

    onSelectMedicine(med: InventoryMedicineCard): void {
        this.selectedMedicineId.set(med.id);
        this.selectedMedicineName.set(med.name);
    }

    onZoneFilter(zone: WarehouseZone): void {
        this.toastSrv.info(`Showing medicines stored in ${zone.name}`);
    }

    openDrawer(): void {
        const id = this.selectedMedicineId();
        if (!id) return;
        this.srv.getMedicineDetail(id).subscribe(res => {
            if (res.success) {
                this.drawerDetail.set(res.data);
                this.drawerOpen.set(true);
            }
        });
    }

    onTransfer(batch: WarehouseBatch): void {
        this.dialogSrv.confirm(
            `Transfer batch ${batch.batchNo} to another warehouse zone?`,
            () => {
                this.srv.transferBatch(batch.id, { toZoneId: 'central-warehouse', quantity: batch.availableQuantity }).subscribe();
                this.toastSrv.success(`Batch ${batch.batchNo} transfer initiated`);
            },
            'Transfer Batch', 'info', 'Transfer', 'Cancel',
        );
    }

    onPrintBarcode(batch: WarehouseBatch): void {
        this.srv.printBarcode(batch.id).subscribe(() => this.toastSrv.success(`Barcode for ${batch.batchNo} sent to printer`));
    }

    onAlertAcknowledged(alert: InventoryAlert): void {
        this.refresh();
    }

    onReserveStock(): void {
        const id = this.selectedMedicineId();
        const batch = this.batches()[0];
        if (!id || !batch) return;
        this.srv.reserveBatch(batch.id, { quantity: 1, reference: 'Manual reservation' }).subscribe();
        this.toastSrv.success('Stock reserved');
    }

    onDisposeFromDrawer(): void {
        const batch = this.batches().find(b => b.isExpired) ?? this.batches()[0];
        if (!batch) return;
        this.dialogSrv.confirm(
            `Dispose batch ${batch.batchNo}? This cannot be undone.`,
            () => {
                this.srv.disposeBatch(batch.id, { reason: 'Pharmacist disposal', quantity: batch.quantity }).subscribe();
                this.toastSrv.success(`Batch ${batch.batchNo} disposed`);
            },
            'Dispose Batch', 'danger', 'Dispose', 'Cancel',
        );
    }

    onPrintBarcodeFromDrawer(): void {
        const batch = this.batches()[0];
        if (!batch) return;
        this.onPrintBarcode(batch);
    }

    onQuickAction(op: QuickOperation): void {
        const labels: Record<QuickOperation, string> = {
            Receiving: 'Stock Receiving', Transfer: 'Stock Transfer', Adjustment: 'Stock Adjustment',
            StockCount: 'Stock Count', BatchMerge: 'Batch Merge', BatchSplit: 'Batch Split', Audit: 'Inventory Audit',
        };
        this.dialogSrv.confirm(
            `Start ${labels[op]}? This will open the guided workflow (placeholder until the dedicated wizard ships).`,
            () => this.toastSrv.success(`${labels[op]} started`),
            labels[op], 'info', 'Start', 'Cancel',
        );
    }
}
