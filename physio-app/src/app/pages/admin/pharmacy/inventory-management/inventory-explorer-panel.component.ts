import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { InventoryMedicineCard, InventoryQuickCategory, InventoryStockStatus, WarehouseZone } from "../../../../shared/types/inventory-management.types";
import { WarehouseHeatMapComponent } from "./warehouse-heatmap.component";

type ExplorerView = 'List' | 'HeatMap';
type ResultMode = 'All' | 'Favorites' | 'Recent';

@Component({
    selector: 'inventory-explorer-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent, StatusBadgeComponent, WarehouseHeatMapComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-regular">Inventory Explorer</h2>
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button type="button" (click)="view.set('List')" class="px-2 py-1 rounded-md text-[11px] font-semibold" [ngClass]="view() === 'List' ? 'bg-surface shadow-sm text-primary' : 'text-gray-500'">List</button>
            <button type="button" (click)="view.set('HeatMap')" class="px-2 py-1 rounded-md text-[11px] font-semibold" [ngClass]="view() === 'HeatMap' ? 'bg-surface shadow-sm text-primary' : 'text-gray-500'">Heat Map</button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1 relative">
            <boo-icon name="search" [size]="14" iconClass="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
            <input #searchInput type="text" [(ngModel)]="query" placeholder="Search medicine or generic name..."
              class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div class="relative">
            <boo-icon name="scan-barcode" [size]="14" iconClass="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
            <input #barcodeInput type="text" [(ngModel)]="barcode" (keyup.enter)="scanBarcode()" placeholder="Scan barcode"
              class="pl-8 pr-2 py-1.5 w-32 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button type="button" *ngFor="let c of categories()" (click)="activeCategory.set(c.value)"
            class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1"
            [ngClass]="activeCategory() === c.value ? 'bg-primary/10 border-primary text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'">
            <boo-icon [name]="c.icon" [size]="12"></boo-icon> {{ c.label }}
          </button>
        </div>

        <div class="flex items-center gap-1.5">
          <button type="button" *ngFor="let m of resultModes" (click)="resultMode.set(m.key)"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium" [ngClass]="resultMode() === m.key ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ m.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <div *ngIf="loading()" class="flex items-center justify-center py-16">
          <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
        </div>

        <warehouse-heatmap *ngIf="!loading() && view() === 'HeatMap'" [zones]="zones()" (selectZone)="onSelectZone($event)"></warehouse-heatmap>

        <ng-container *ngIf="!loading() && view() === 'List'">
          <boo-empty-state *ngIf="!displayed().length" icon="search-x" title="No medicines match your search">
            <button type="button" (click)="clearFilters()" class="text-primary text-xs font-semibold hover:underline">Clear Filters</button>
          </boo-empty-state>

          <div *ngIf="displayed().length" class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));">
            <button type="button" *ngFor="let med of displayed(); trackBy: trackById" (click)="select.emit(med)"
              class="text-left bg-surface border rounded-1.5 p-3 flex flex-col gap-1.5 transition-all hover:shadow-card hover:-translate-y-0.5"
              [ngClass]="selectedId === med.id ? 'border-primary bg-primary/5' : 'border-borderGray/60'">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-regular leading-tight">{{ med.name }}</p>
                <boo-icon *ngIf="med.isFavorite" name="star" [size]="12" iconClass="text-amber-500"></boo-icon>
              </div>
              <p class="text-[11px] text-secondary">{{ med.genericName }}</p>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold" [ngClass]="stockClass(med.status)">{{ med.currentStock }} units</span>
                <boo-status-badge [label]="statusLabel(med.status)" [tone]="statusTone(med.status)" dotted></boo-status-badge>
              </div>
              <p class="text-[10px] text-secondary">Safety {{ med.safetyStock }} · Reorder {{ med.reorderLevel }}</p>
              <div class="flex items-center justify-between text-[10px] text-secondary">
                <span>{{ med.batchCount }} batch(es)</span>
                <span *ngIf="med.isNearExpiry" class="text-amber-600 font-semibold flex items-center gap-0.5">
                  <boo-icon name="calendar-clock" [size]="10"></boo-icon> Exp {{ med.soonestExpiryDate }}
                </span>
              </div>
              <p class="text-[10px] text-secondary truncate">{{ med.storageLocation }}</p>
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class InventoryExplorerPanelComponent implements OnInit {
    @Input() selectedId: string | null = null;
    @Output() select = new EventEmitter<InventoryMedicineCard>();
    @Output() zoneFilter = new EventEmitter<WarehouseZone>();

    @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
    @ViewChild('barcodeInput') barcodeInputRef!: ElementRef<HTMLInputElement>;

    loading = signal(true);
    allMedicines = signal<InventoryMedicineCard[]>([]);
    categories = signal<InventoryQuickCategory[]>([]);
    zones = signal<WarehouseZone[]>([]);

    query = '';
    barcode = '';
    activeCategory = signal('');
    view = signal<ExplorerView>('List');
    resultMode = signal<ResultMode>('All');

    readonly resultModes: { key: ResultMode; label: string }[] = [
        { key: 'All', label: 'All Medicines' },
        { key: 'Favorites', label: 'Favorites' },
        { key: 'Recent', label: 'Recently Accessed' },
    ];

    constructor(private srv: InventoryManagementService, private toastSrv: ToastService) { }

    ngOnInit(): void {
        this.srv.getQuickCategories().subscribe(res => { if (res.success) this.categories.set(res.data); });
        this.srv.searchMedicines().subscribe({
            next: res => { if (res.success) this.allMedicines.set(res.data.items); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
        this.srv.getWarehouseZones().subscribe(res => { if (res.success) this.zones.set(res.data); });
    }

    focusSearch(): void { this.searchInputRef?.nativeElement.focus(); }
    focusBarcode(): void { this.barcodeInputRef?.nativeElement.focus(); }

    clearFilters(): void {
        this.query = '';
        this.activeCategory.set('');
        this.resultMode.set('All');
    }

    scanBarcode(): void {
        const code = this.barcode.trim();
        if (!code) return;
        this.srv.lookupByBarcode(code).subscribe(res => {
            if (res.success && res.data) {
                this.select.emit(res.data);
                this.toastSrv.success(`${res.data.name} found`, 'Scanned');
            } else {
                this.toastSrv.error(`No medicine found for barcode ${code}`);
            }
            this.barcode = '';
        });
    }

    onSelectZone(zone: WarehouseZone): void {
        this.view.set('List');
        this.query = '';
        this.zoneFilter.emit(zone);
    }

    displayed(): InventoryMedicineCard[] {
        let list = this.allMedicines();
        if (this.resultMode() === 'Favorites') list = list.filter(m => m.isFavorite);
        if (this.resultMode() === 'Recent') list = list.filter(m => m.isRecentlyAccessed);
        if (this.activeCategory()) list = list.filter(m => m.category === this.activeCategory());
        if (this.query) {
            const q = this.query.toLowerCase();
            list = list.filter(m => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q));
        }
        return list;
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

    stockClass(status: InventoryStockStatus): string {
        if (status === 'InStock') return 'text-emerald-600';
        if (status === 'LowStock') return 'text-amber-600';
        return 'text-rose-600';
    }

    trackById(_: number, item: InventoryMedicineCard): string {
        return item.id;
    }
}
