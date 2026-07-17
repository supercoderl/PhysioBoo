import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailMedicineCard, RetailQuickCategory, RetailSuggestionMode } from "../../../../shared/types/retail-pos.types";

type ResultMode = 'Search' | RetailSuggestionMode;

@Component({
  selector: 'retail-catalog-panel',
  standalone: true,
  imports: [SharedModule, BooIconComponent, EmptyStateComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg flex flex-col h-full">
      <!-- Search + barcode -->
      <div class="p-3 border-b border-gray-200 space-y-2">
        <div class="flex items-center gap-2">
          <div class="flex-1 relative">
            <boo-icon name="search" [size]="16" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
            <input #searchInput type="text" [(ngModel)]="query" (ngModelChange)="onSearchChange()"
              placeholder="Search medicine by name, generic, or batch..."
              class="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <div class="relative">
            <boo-icon name="scan-barcode" [size]="16" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
            <input #barcodeInput type="text" [(ngModel)]="barcode" (keyup.enter)="scanBarcode()"
              placeholder="Scan barcode (Ctrl+B)"
              class="pl-9 pr-3 h-10 w-44 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
        </div>

        <!-- Quick categories -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button *ngFor="let c of categories()" type="button" (click)="setCategory(c.value)"
            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors"
            [ngClass]="activeCategory() === c.value ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-gray-200 text-gray-600 hover:border-gray-300'">
            <boo-icon [name]="c.icon" [size]="14"></boo-icon>
            {{ c.label }}
          </button>
        </div>

        <!-- Result mode chips -->
        <div class="flex items-center gap-2">
          <button *ngFor="let m of resultModes" type="button" (click)="setMode(m.key)"
            class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            [ngClass]="mode() === m.key ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Product grid -->
      <div class="flex-1 overflow-y-auto p-3">
        <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
          <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
        </div>

        <boo-empty-state *ngIf="!isLoading() && !displayedMedicines().length" icon="search-x" title="No medicines match your search">
          <button (click)="clearFilters()" class="text-primary text-xs font-semibold hover:underline">Clear Filters</button>
        </boo-empty-state>

        <div *ngIf="!isLoading() && displayedMedicines().length" class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
          <div *ngFor="let med of displayedMedicines(); trackBy: trackById"
            class="relative bg-surface border border-gray-200 rounded-lg p-3 flex flex-col gap-1.5 transition-all hover:shadow-card hover:-translate-y-0.5"
            [class.opacity-60]="med.stock === 0">
            <span *ngIf="med.promotionLabel" class="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">{{ med.promotionLabel }}</span>

            <button type="button" (click)="viewDetail.emit(med.id)" class="absolute top-2 right-2 text-gray-400 hover:text-primary" aria-label="View details">
              <boo-icon name="info" [size]="14"></boo-icon>
            </button>

            <div class="pr-5">
              <p class="text-sm font-semibold text-gray-800 leading-tight">{{ med.name }}</p>
              <p class="text-xs text-gray-500">{{ med.genericName }} · {{ med.strength }}</p>
              <p class="text-[11px] text-gray-400">{{ med.packageLabel }}</p>
            </div>

            <div class="flex items-center justify-between text-xs mt-1">
              <span [ngClass]="stockClass(med.stock)">{{ med.stock === 0 ? 'Out of stock' : med.stock + ' units' }}</span>
              <span *ngIf="med.insuranceCovered" class="text-primary font-medium flex items-center gap-0.5">
                <boo-icon name="shield-check" [size]="12"></boo-icon> Insured
              </span>
            </div>

            <div class="flex items-center justify-between mt-1">
              <span class="text-sm font-bold text-gray-900">\${{ med.price.toFixed(2) }}</span>
              <button type="button" (click)="addToCart.emit(med)" [disabled]="med.stock === 0" [attr.aria-disabled]="med.stock === 0"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                [ngClass]="med.stock > 0 ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RetailCatalogPanelComponent implements OnInit {
  @Output() addToCart = new EventEmitter<RetailMedicineCard>();
  @Output() viewDetail = new EventEmitter<string>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('barcodeInput') barcodeInputRef!: ElementRef<HTMLInputElement>;

  isLoading = signal(true);
  allMedicines = signal<RetailMedicineCard[]>([]);
  categories = signal<RetailQuickCategory[]>([]);
  suggestionResults = signal<RetailMedicineCard[]>([]);

  query = '';
  barcode = '';
  activeCategory = signal<string>('');
  mode = signal<ResultMode>('Search');

  readonly resultModes: { key: ResultMode; label: string }[] = [
    { key: 'Search', label: 'Search Results' },
    { key: 'Favorites', label: 'Favorites' },
    { key: 'RecentlySold', label: 'Recently Sold' },
    { key: 'Recommended', label: 'Recommended' },
  ];

  constructor(private srv: RetailPosService, private toastSrv: ToastService) { }

  ngOnInit(): void {
    this.srv.getQuickCategories().subscribe(res => { if (res.success) this.categories.set(res.data); });
    this.srv.searchCatalog().subscribe({
      next: (res) => { if (res.success) this.allMedicines.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  focusSearch(): void {
    this.searchInputRef?.nativeElement.focus();
  }

  focusBarcode(): void {
    this.barcodeInputRef?.nativeElement.focus();
  }

  onSearchChange(): void {
    if (this.query) this.mode.set('Search');
  }

  setCategory(value: string): void {
    this.activeCategory.set(value);
  }

  setMode(key: ResultMode): void {
    this.mode.set(key);
    if (key !== 'Search') {
      this.srv.getSuggestions(key).subscribe(res => { if (res.success) this.suggestionResults.set(res.data); });
    }
  }

  clearFilters(): void {
    this.query = '';
    this.activeCategory.set('');
    this.mode.set('Search');
  }

  scanBarcode(): void {
    const code = this.barcode.trim();
    if (!code) return;
    this.srv.lookupByBarcode(code).subscribe(res => {
      if (res.success && res.data) {
        this.addToCart.emit(res.data);
        this.toastSrv.success(`${res.data.name} added to cart`, 'Scanned');
      } else {
        this.toastSrv.error(`No medicine found for barcode ${code}`);
      }
      this.barcode = '';
    });
  }

  displayedMedicines(): RetailMedicineCard[] {
    if (this.mode() !== 'Search') return this.suggestionResults();

    let list = this.allMedicines();
    if (this.activeCategory()) list = list.filter(m => m.category === this.activeCategory());
    if (this.query) {
      const q = this.query.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.batchNo.toLowerCase().includes(q));
    }
    return list;
  }

  stockClass(stock: number): string {
    if (stock === 0) return 'text-rose-600 font-semibold';
    if (stock < 10) return 'text-rose-600 font-semibold';
    if (stock < 50) return 'text-amber-600';
    return 'text-emerald-600';
  }

  trackById(_: number, item: RetailMedicineCard): string {
    return item.id;
  }
}
