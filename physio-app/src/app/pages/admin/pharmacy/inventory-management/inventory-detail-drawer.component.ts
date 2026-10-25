import { Component, EventEmitter, HostListener, inject, Input, OnChanges, Output, signal, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    BatchActionKind,
    BatchActionRequest,
    batchStatusTone,
    freeQuantity,
    InventoryBatch,
    InventoryHistoryEntry,
    InventoryMedicine,
    InventoryMedicineDetail,
    InventoryZone,
    stockStatusLabel,
    stockStatusTone,
} from "../../../../shared/types/inventory-management.types";
import { InventoryBatchActionDialogComponent } from "./inventory-batch-action-dialog.component";

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type PanelTab = 'batches' | 'history';

@Component({
    selector: 'inventory-detail-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooInlineErrorComponent,
        BooStatusBadgeComponent,
        InventoryBatchActionDialogComponent,
    ],
    template: `
    <drawer [isOpen]="isOpen" (close)="close.emit()">
      <div *ngIf="medicine as med" class="flex flex-col h-screen bg-surface" role="dialog" aria-modal="true" aria-labelledby="inventory-panel-title">
        <header class="flex-none px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 id="inventory-panel-title" class="text-xl font-bold text-regular leading-tight m-0 break-words">{{ med.name }}</h2>
              <boo-status-badge [label]="statusLabel(detail()?.status ?? med.status)" [tone]="statusTone(detail()?.status ?? med.status)" dotted></boo-status-badge>
            </div>
            <p class="text-sm text-secondary mt-1 mb-0">
              {{ detail()?.genericName || med.genericName || 'No generic name' }}
              <ng-container *ngIf="detail()?.manufacturer"> · {{ detail()?.manufacturer }}</ng-container>
              <ng-container *ngIf="detail()?.category || med.category"> · {{ detail()?.category || med.category }}</ng-container>
            </p>
          </div>
          <button boo-button variant="ghost" size="sm" [iconOnly]="true" (click)="close.emit()" aria-label="Close stock panel">
            <physio-icon name="x" [size]="20"></physio-icon>
          </button>
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto" custom-scrollbar>
          <div class="px-6 py-5 space-y-6">
            <!-- Summary -->
            <section aria-label="Stock summary">
              <boo-inline-error *ngIf="detailState() === 'error'" what="the stock summary" (retry)="loadDetail()"></boo-inline-error>

              <dl *ngIf="detailState() !== 'error'" class="grid grid-cols-2 sm:grid-cols-3 gap-3 m-0">
                <ng-container *ngIf="detail() as d; else summarySkeleton">
                  <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                    <dt class="text-[11px] font-medium text-secondary">On hand</dt>
                    <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ d.currentStock | number }}<span *ngIf="d.unit" class="ml-1 text-xs font-medium text-secondary">{{ d.unit }}</span></dd>
                  </div>
                  <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                    <dt class="text-[11px] font-medium text-secondary">Reorder level</dt>
                    <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ d.reorderLevel | number }}</dd>
                  </div>
                  <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                    <dt class="text-[11px] font-medium text-secondary">Safety stock</dt>
                    <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ d.safetyStock | number }}</dd>
                  </div>
                  <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                    <dt class="text-[11px] font-medium text-secondary">Average unit cost</dt>
                    <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ d.averageUnitCost | currency:'USD':'symbol':'1.2-2' }}</dd>
                  </div>
                  <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                    <dt class="text-[11px] font-medium text-secondary">Stock value</dt>
                    <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ d.totalValue | currency:'USD':'symbol':'1.2-2' }}</dd>
                  </div>
                  <div class="rounded-1.5 bg-gray-50 px-3 py-2.5 col-span-2 sm:col-span-1">
                    <dt class="text-[11px] font-medium text-secondary">Storage</dt>
                    <dd class="m-0 mt-0.5 text-sm font-semibold text-regular break-words">{{ d.storageLocations.length ? d.storageLocations.join(', ') : 'Not recorded' }}</dd>
                  </div>
                </ng-container>
                <ng-template #summarySkeleton>
                  <div *ngFor="let s of [1,2,3,4,5,6]" class="rounded-1.5 bg-gray-50 px-3 py-2.5" aria-hidden="true">
                    <div class="h-2.5 w-16 rounded bg-gray-200 animate-pulse"></div>
                    <div class="h-4 w-20 rounded bg-gray-200 animate-pulse mt-2"></div>
                  </div>
                </ng-template>
              </dl>
            </section>

            <!-- Tabs -->
            <section>
              <div role="tablist" aria-label="Batches and history" class="flex items-center gap-1 border-b border-borderGray/60">
                <button role="tab" type="button" id="inventory-tab-batches" [attr.aria-selected]="tab() === 'batches'" aria-controls="inventory-panel-batches"
                  (click)="tab.set('batches')"
                  class="px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap"
                  [ngClass]="tab() === 'batches' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-regular'">
                  Batches<span *ngIf="batchState() === 'ready'" class="ml-1.5 text-xs font-medium text-secondary">{{ batches().length }}</span>
                </button>
                <button role="tab" type="button" id="inventory-tab-history" [attr.aria-selected]="tab() === 'history'" aria-controls="inventory-panel-history"
                  (click)="openHistory()"
                  class="px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap"
                  [ngClass]="tab() === 'history' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-regular'">
                  History
                </button>
              </div>

              <!-- Batches -->
              <div *ngIf="tab() === 'batches'" id="inventory-panel-batches" role="tabpanel" aria-labelledby="inventory-tab-batches" class="pt-4 space-y-3">
                <boo-inline-error *ngIf="batchState() === 'error'" what="batches" (retry)="loadBatches()"></boo-inline-error>

                <ng-container *ngIf="batchState() === 'loading'">
                  <div *ngFor="let s of [1,2]" class="rounded-2 border border-borderGray/60 p-4 space-y-3" aria-hidden="true">
                    <div class="h-4 w-32 rounded bg-gray-200 animate-pulse"></div>
                    <div class="h-3 w-full rounded bg-gray-100 animate-pulse"></div>
                    <div class="h-3 w-2/3 rounded bg-gray-100 animate-pulse"></div>
                  </div>
                </ng-container>

                <boo-empty-state *ngIf="batchState() === 'ready' && !batches().length" icon="package-x" title="No batches recorded"
                  description="This medicine has no stock batches yet."></boo-empty-state>

                <article *ngFor="let b of batches(); trackBy: trackById" class="rounded-2 border border-borderGray/60 p-4">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h3 class="text-sm font-semibold text-regular m-0 break-all">{{ b.batchNo || 'No batch number' }}</h3>
                    <div class="flex items-center gap-1.5">
                      <boo-status-badge *ngIf="b.isNearExpiry && !b.isExpired" label="Near expiry" tone="warning"></boo-status-badge>
                      <boo-status-badge [label]="b.status" [tone]="batchTone(b.status)" dotted></boo-status-badge>
                    </div>
                  </div>

                  <dl class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-3 mb-0 text-sm">
                    <div>
                      <dt class="text-[11px] text-secondary">Expiry</dt>
                      <dd class="m-0 font-medium" [ngClass]="b.isExpired ? 'text-rose-600' : b.isNearExpiry ? 'text-amber-700' : 'text-regular'">{{ b.expiryDate ? (b.expiryDate | date:'mediumDate') : '—' }}</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] text-secondary">On hand</dt>
                      <dd class="m-0 font-medium text-regular tabular-nums">{{ b.quantity | number }}</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] text-secondary">Reserved</dt>
                      <dd class="m-0 font-medium text-regular tabular-nums">{{ b.reservedQuantity | number }}</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] text-secondary">Free</dt>
                      <dd class="m-0 font-medium text-regular tabular-nums">{{ free(b) | number }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="text-[11px] text-secondary">Location</dt>
                      <dd class="m-0 text-regular break-words">{{ b.storageLocation || '—' }}</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] text-secondary">Supplier</dt>
                      <dd class="m-0 text-regular break-words">{{ b.supplier || '—' }}</dd>
                    </div>
                    <div>
                      <dt class="text-[11px] text-secondary">Unit cost</dt>
                      <dd class="m-0 text-regular tabular-nums">{{ b.purchasePrice !== null ? (b.purchasePrice | currency:'USD':'symbol':'1.2-2') : '—' }}</dd>
                    </div>
                  </dl>

                  <div *ngIf="b.status !== 'Disposed' && hasAnyAction" class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-borderGray/60">
                    <button *ngIf="canReceive" boo-button variant="secondary" size="sm" (click)="openAction('receive', b)">
                      <physio-icon name="inbox" [size]="16"></physio-icon>Receive
                    </button>
                    <button *ngIf="canUpdate" boo-button variant="secondary" size="sm" (click)="openAction('adjust', b)">
                      <physio-icon name="pencil" [size]="16"></physio-icon>Adjust
                    </button>
                    <button *ngIf="canUpdate && canReadZones" boo-button variant="secondary" size="sm" [disabled]="free(b) <= 0" (click)="openAction('transfer', b)">
                      <physio-icon name="truck" [size]="16"></physio-icon>Transfer
                    </button>
                    <button *ngIf="canDispose" boo-button variant="secondary" size="sm" classname="!text-rose-700 hover:!bg-rose-50" [disabled]="free(b) <= 0" (click)="openAction('dispose', b)">
                      <physio-icon name="trash" [size]="16"></physio-icon>Dispose
                    </button>
                  </div>
                </article>
              </div>

              <!-- History -->
              <div *ngIf="tab() === 'history'" id="inventory-panel-history" role="tabpanel" aria-labelledby="inventory-tab-history" class="pt-4">
                <boo-inline-error *ngIf="historyState() === 'error'" what="the movement history" (retry)="loadHistory()"></boo-inline-error>

                <ul *ngIf="historyState() === 'loading'" class="list-none m-0 p-0 space-y-3" aria-hidden="true">
                  <li *ngFor="let s of [1,2,3,4]" class="space-y-2">
                    <div class="h-3.5 w-48 rounded bg-gray-200 animate-pulse"></div>
                    <div class="h-3 w-32 rounded bg-gray-100 animate-pulse"></div>
                  </li>
                </ul>

                <boo-empty-state *ngIf="historyState() === 'ready' && !history().length" icon="history" title="No stock movements"
                  description="Receipts, adjustments, transfers and write-offs will be listed here."></boo-empty-state>

                <ol *ngIf="historyState() === 'ready' && history().length" class="list-none m-0 p-0 divide-y divide-borderGray/60">
                  <li *ngFor="let h of history()" class="py-3 flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <p class="m-0 text-sm font-semibold text-regular break-words">{{ h.description }}</p>
                      <p class="m-0 mt-0.5 text-xs text-secondary break-words">
                        {{ h.date | date:'medium' }}<ng-container *ngIf="h.actor"> · {{ h.actor }}</ng-container><ng-container *ngIf="h.reference"> · Ref {{ h.reference }}</ng-container>
                      </p>
                    </div>
                    <span class="flex-none text-sm font-semibold text-regular tabular-nums">{{ h.quantity | number }}</span>
                  </li>
                </ol>
              </div>
            </section>
          </div>
        </div>
      </div>
    </drawer>

    <inventory-batch-action-dialog
      [isOpen]="actionKind() !== null"
      [kind]="actionKind()"
      [batch]="actionBatch()"
      [medicineName]="medicine?.name ?? ''"
      [unit]="detail()?.unit ?? null"
      [zones]="zones()"
      [zonesState]="zonesState()"
      [submitting]="submitting()"
      (close)="closeAction()"
      (confirm)="onConfirm($event)"
    ></inventory-batch-action-dialog>
  `,
})
export class InventoryDetailDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() medicine: InventoryMedicine | null = null;
    @Output() close = new EventEmitter<void>();
    /** Stock changed: the list and the overview are out of date. */
    @Output() changed = new EventEmitter<void>();

    private readonly srv = inject(InventoryManagementService);
    private readonly toastSrv = inject(ToastService);
    private readonly authSrv = inject(AuthService);

    readonly canReceive = this.authSrv.hasPermission(Permissions.Pharmacy.MedicineInventoryCreate);
    readonly canUpdate = this.authSrv.hasPermission(Permissions.Pharmacy.MedicineInventoryUpdate);
    readonly canDispose = this.authSrv.hasPermission(Permissions.Pharmacy.MedicineInventoryDelete);
    readonly canReadZones = this.authSrv.hasPermission(Permissions.Pharmacy.WarehouseZoneRead);
    readonly hasAnyAction = this.canReceive || this.canUpdate || this.canDispose;

    tab = signal<PanelTab>('batches');
    detail = signal<InventoryMedicineDetail | null>(null);
    detailState = signal<LoadState>('idle');
    batches = signal<InventoryBatch[]>([]);
    batchState = signal<LoadState>('idle');
    history = signal<InventoryHistoryEntry[]>([]);
    historyState = signal<LoadState>('idle');
    zones = signal<InventoryZone[]>([]);
    zonesState = signal<LoadState>('idle');

    actionKind = signal<BatchActionKind | null>(null);
    actionBatch = signal<InventoryBatch | null>(null);
    submitting = signal(false);

    readonly statusLabel = stockStatusLabel;
    readonly statusTone = stockStatusTone;
    readonly batchTone = batchStatusTone;
    readonly free = freeQuantity;

    /** Bumped whenever the panel switches medicine, so a slow response for the previous one is ignored. */
    private session = 0;

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['isOpen'] && this.isOpen;
        const switched = changes['medicine'] && this.isOpen;
        if (!this.medicine || !(opened || switched)) return;

        this.session++;
        this.tab.set('batches');
        this.detail.set(null);
        this.batches.set([]);
        this.history.set([]);
        this.historyState.set('idle');
        this.closeAction();
        this.loadDetail();
        this.loadBatches();
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscape(event: Event): void {
        // An open batch dialog handles Escape itself.
        if (!this.isOpen || event.defaultPrevented || this.actionKind()) return;
        this.close.emit();
    }

    trackById(_: number, batch: InventoryBatch): string {
        return batch.id;
    }

    // #region Loading
    loadDetail(): void {
        const med = this.medicine;
        if (!med) return;
        const session = this.session;
        this.detailState.set('loading');
        this.srv.getMedicineDetail(med.id).subscribe({
            next: res => {
                if (session !== this.session) return;
                this.detail.set(res.data ?? null);
                this.detailState.set(res.success && res.data ? 'ready' : 'error');
            },
            error: () => { if (session === this.session) this.detailState.set('error'); },
        });
    }

    loadBatches(): void {
        const med = this.medicine;
        if (!med) return;
        const session = this.session;
        this.batchState.set('loading');
        this.srv.getBatches(med.id).subscribe({
            next: res => {
                if (session !== this.session) return;
                this.batches.set(res.success ? res.data : []);
                this.batchState.set(res.success ? 'ready' : 'error');
            },
            error: () => { if (session === this.session) this.batchState.set('error'); },
        });
    }

    openHistory(): void {
        this.tab.set('history');
        if (this.historyState() === 'idle') this.loadHistory();
    }

    loadHistory(): void {
        const med = this.medicine;
        if (!med) return;
        const session = this.session;
        this.historyState.set('loading');
        this.srv.getHistory(med.id).subscribe({
            next: res => {
                if (session !== this.session) return;
                this.history.set(res.success ? res.data ?? [] : []);
                this.historyState.set(res.success ? 'ready' : 'error');
            },
            error: () => { if (session === this.session) this.historyState.set('error'); },
        });
    }

    private loadZones(): void {
        if (this.zonesState() === 'loading' || this.zonesState() === 'ready') return;
        this.zonesState.set('loading');
        this.srv.getZones().subscribe({
            next: res => {
                this.zones.set(res.success ? (res.data ?? []).map(z => ({ id: z.id, name: z.name })) : []);
                this.zonesState.set(res.success ? 'ready' : 'error');
            },
            error: () => this.zonesState.set('error'),
        });
    }
    // #endregion

    // #region Batch actions
    openAction(kind: BatchActionKind, batch: InventoryBatch): void {
        if (kind === 'transfer') this.loadZones();
        this.actionBatch.set(batch);
        this.actionKind.set(kind);
    }

    closeAction(): void {
        this.actionKind.set(null);
        this.actionBatch.set(null);
        this.submitting.set(false);
    }

    onConfirm(request: BatchActionRequest): void {
        const batch = this.actionBatch();
        if (!batch || this.submitting()) return;

        this.submitting.set(true);
        const call$ = request.kind === 'receive' ? this.srv.receiveStock(batch.id, request.payload)
            : request.kind === 'adjust' ? this.srv.adjustQuantity(batch.id, request.payload)
                : request.kind === 'transfer' ? this.srv.transferBatch(batch.id, request.payload)
                    : this.srv.disposeBatch(batch.id, request.payload);

        const session = this.session;
        call$.subscribe({
            next: res => {
                this.submitting.set(false);
                if (!res.success) {
                    // The dialog stays open with its values so the user can correct them.
                    this.toastSrv.error('The change was not saved. Please check the values and try again.');
                    return;
                }
                this.toastSrv.success(this.successMessage(request, batch));
                this.closeAction();
                this.changed.emit();
                if (session !== this.session) return;
                this.loadDetail();
                this.loadBatches();
                // History is only fetched when it was already opened; otherwise it loads fresh on first view.
                this.historyState.set('idle');
                if (this.tab() === 'history') this.loadHistory();
            },
            // The global interceptor shows the server's message; keep the dialog open and its values intact.
            error: () => this.submitting.set(false),
        });
    }

    private successMessage(request: BatchActionRequest, batch: InventoryBatch): string {
        const batchNo = batch.batchNo || 'batch';
        switch (request.kind) {
            case 'receive': return `Received ${request.payload.quantity} units into ${batchNo}`;
            case 'adjust': return `${batchNo} adjusted to ${request.payload.newQuantity} on hand`;
            case 'transfer': return `Moved ${request.payload.quantity} units from ${batchNo}`;
            case 'dispose': return `Disposed ${request.payload.quantity} units from ${batchNo}`;
        }
    }
    // #endregion
}
