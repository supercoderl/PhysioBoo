import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { curveCatmullRom } from 'd3-shape';
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { InventoryHistoryEntry, InventoryMedicineDetail, WarehouseBatch } from "../../../../shared/types/inventory-management.types";

type DrawerTab = 'Summary' | 'Batches' | 'Trends' | 'Purchase' | 'Dispensing' | 'Supplier' | 'Locations';

@Component({
    selector: 'inventory-detail-drawer',
    standalone: true,
    imports: [SharedModule, BooIconComponent, DrawerComponent, EmptyStateComponent],
    template: `
    <drawer [isOpen]="isOpen" [width]="560" (close)="close.emit()">
      <div class="flex flex-col h-full" *ngIf="detail">
        <div class="p-4 border-b border-borderGray/60 flex items-start justify-between">
          <div>
            <h3 class="text-base font-semibold text-regular">{{ detail.name }}</h3>
            <p class="text-xs text-secondary">{{ detail.genericName }} · {{ detail.manufacturer }}</p>
          </div>
          <button type="button" (click)="close.emit()" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <boo-icon name="x" [size]="16"></boo-icon>
          </button>
        </div>

        <div class="flex items-center gap-1 px-4 pt-2 border-b border-borderGray/60 overflow-x-auto">
          <button type="button" *ngFor="let t of tabs" (click)="tab.set(t)"
            class="px-3 py-2 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap"
            [ngClass]="tab() === t ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-regular'">
            {{ t }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <section *ngIf="tab() === 'Summary'">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Current Stock</span><p class="font-semibold text-regular">{{ detail.currentStock }} {{ detail.unit }}</p></div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Status</span><p class="font-semibold text-regular">{{ detail.status }}</p></div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Safety Stock</span><p class="font-semibold text-regular">{{ detail.safetyStock }}</p></div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Reorder Level</span><p class="font-semibold text-regular">{{ detail.reorderLevel }}</p></div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2"><span class="text-secondary">Avg Unit Cost</span><p class="font-semibold text-regular">{{ '$' + detail.averageUnitCost.toFixed(2) }}</p></div>
              <div class="rounded-1.5 bg-primary/5 px-3 py-2"><span class="text-secondary">Total Value</span><p class="font-semibold text-primary">{{ '$' + detail.totalValue.toFixed(2) }}</p></div>
            </div>
          </section>

          <section *ngIf="tab() === 'Batches'">
            <boo-empty-state *ngIf="!batches.length" icon="package-x" title="No batches"></boo-empty-state>
            <div *ngFor="let b of batches" class="rounded-1.5 border border-borderGray/60 p-2.5 mb-2">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-regular">{{ b.batchNo }}</span>
                <span class="text-[11px] text-secondary">Exp {{ b.expiryDate | date:'mediumDate' }}</span>
              </div>
              <p class="text-[11px] text-secondary">Qty {{ b.quantity }} · Available {{ b.availableQuantity }} · {{ b.storageLocation }}</p>
            </div>
          </section>

          <section *ngIf="tab() === 'Trends'" class="space-y-4">
            <div>
              <p class="text-[11px] font-semibold text-secondary uppercase mb-1">Inventory Trend</p>
              <div class="h-[140px]">
                <ngx-charts-line-chart [results]="inventoryTrendSeries" [scheme]="trendScheme" [curve]="curve"
                  [xAxis]="true" [yAxis]="true" [legend]="false" [showGridLines]="true" [autoScale]="true" [animations]="true"></ngx-charts-line-chart>
              </div>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-secondary uppercase mb-1">Consumption Trend</p>
              <div class="h-[140px]">
                <ngx-charts-line-chart [results]="consumptionTrendSeries" [scheme]="consumptionScheme" [curve]="curve"
                  [xAxis]="true" [yAxis]="true" [legend]="false" [showGridLines]="true" [autoScale]="true" [animations]="true"></ngx-charts-line-chart>
              </div>
            </div>
          </section>

          <section *ngIf="tab() === 'Purchase'">
            <boo-empty-state *ngIf="!purchaseHistory.length" icon="shopping-cart" title="No purchase history"></boo-empty-state>
            <div *ngFor="let h of purchaseHistory" class="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
              <span class="text-secondary">{{ h.date | date:'mediumDate' }} · {{ h.description }}</span>
              <span class="font-semibold text-regular">{{ h.quantity > 0 ? '+' : '' }}{{ h.quantity }}</span>
            </div>
          </section>

          <section *ngIf="tab() === 'Dispensing'">
            <boo-empty-state *ngIf="!dispensingHistory.length" icon="pill" title="No dispensing history"></boo-empty-state>
            <div *ngFor="let h of dispensingHistory" class="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
              <span class="text-secondary">{{ h.date | date:'mediumDate' }} · {{ h.description }}</span>
              <span class="font-semibold text-rose-600">{{ h.quantity }}</span>
            </div>
          </section>

          <section *ngIf="tab() === 'Supplier'">
            <boo-empty-state *ngIf="!supplierHistory.length" icon="truck" title="No supplier history"></boo-empty-state>
            <div *ngFor="let h of supplierHistory" class="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
              <span class="text-secondary">{{ h.date | date:'mediumDate' }} · {{ h.description }}</span>
              <span class="font-semibold text-emerald-600">+{{ h.quantity }}</span>
            </div>
          </section>

          <section *ngIf="tab() === 'Locations'">
            <div class="flex flex-wrap gap-1.5">
              <span *ngFor="let loc of detail.storageLocations" class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px]">{{ loc }}</span>
            </div>
          </section>
        </div>

        <div class="p-3 border-t border-borderGray/60 grid grid-cols-3 gap-2">
          <button type="button" (click)="receiveStock.emit()" class="py-2 rounded-lg text-[11px] font-semibold border border-gray-300 hover:bg-gray-50">Receive Stock</button>
          <button type="button" (click)="transferStock.emit()" class="py-2 rounded-lg text-[11px] font-semibold border border-gray-300 hover:bg-gray-50">Transfer</button>
          <button type="button" (click)="adjustQuantity.emit()" class="py-2 rounded-lg text-[11px] font-semibold border border-gray-300 hover:bg-gray-50">Adjust Qty</button>
          <button type="button" (click)="reserveStock.emit()" class="py-2 rounded-lg text-[11px] font-semibold border border-gray-300 hover:bg-gray-50">Reserve Stock</button>
          <button type="button" (click)="disposeBatchAction.emit()" class="py-2 rounded-lg text-[11px] font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50">Dispose Batch</button>
          <button type="button" (click)="printBarcode.emit()" class="py-2 rounded-lg text-[11px] font-semibold border border-gray-300 hover:bg-gray-50">Print Barcode</button>
        </div>
      </div>
    </drawer>
  `,
})
export class InventoryDetailDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() detail: InventoryMedicineDetail | null = null;
    @Input() batches: WarehouseBatch[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() receiveStock = new EventEmitter<void>();
    @Output() transferStock = new EventEmitter<void>();
    @Output() adjustQuantity = new EventEmitter<void>();
    @Output() reserveStock = new EventEmitter<void>();
    @Output() disposeBatchAction = new EventEmitter<void>();
    @Output() printBarcode = new EventEmitter<void>();

    tab = signal<DrawerTab>('Summary');
    readonly tabs: DrawerTab[] = ['Summary', 'Batches', 'Trends', 'Purchase', 'Dispensing', 'Supplier', 'Locations'];

    purchaseHistory: InventoryHistoryEntry[] = [];
    dispensingHistory: InventoryHistoryEntry[] = [];
    supplierHistory: InventoryHistoryEntry[] = [];

    curve = curveCatmullRom;
    inventoryTrendSeries: any[] = [];
    consumptionTrendSeries: any[] = [];
    trendScheme: Color = { name: 'inventory', selectable: true, group: ScaleType.Ordinal, domain: ['#4f46e5'] };
    consumptionScheme: Color = { name: 'consumption', selectable: true, group: ScaleType.Ordinal, domain: ['#ef4444'] };

    constructor(private srv: InventoryManagementService, private toastSrv: ToastService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['detail'] && this.detail) {
            this.tab.set('Summary');
            this.loadHistory();
            this.buildTrends();
        }
    }

    private loadHistory(): void {
        if (!this.detail) return;
        this.srv.getHistory(this.detail.id, 'purchase').subscribe(res => { if (res.success) this.purchaseHistory = res.data.items; });
        this.srv.getHistory(this.detail.id, 'dispensing').subscribe(res => { if (res.success) this.dispensingHistory = res.data.items; });
        this.srv.getHistory(this.detail.id, 'supplier').subscribe(res => { if (res.success) this.supplierHistory = res.data.items; });
    }

    private buildTrends(): void {
        if (!this.detail) return;
        const base = this.detail.currentStock;
        this.inventoryTrendSeries = [{
            name: 'Stock Level',
            series: [base * 1.3, base * 1.2, base * 1.05, base * 0.95, base].map((v, i) => ({ name: `Wk ${i + 1}`, value: Math.round(v) })),
        }];
        this.consumptionTrendSeries = [{
            name: 'Consumption',
            series: [12, 18, 15, 22, 20].map((v, i) => ({ name: `Wk ${i + 1}`, value: v })),
        }];
    }
}
