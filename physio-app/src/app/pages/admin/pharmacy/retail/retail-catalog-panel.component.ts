import { Component, DestroyRef, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooFilterChip, BooFilterChipsComponent, BooInputComponent, BooPaginationComponent, BooSearchFieldComponent } from '@physioboo/ui';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, map } from "rxjs";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCategory, RetailMedicineCard, RetailSuggestionMode } from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney } from "../../../../shared/utils/retail-pos.utils";

type CatalogView = 'Catalog' | RetailSuggestionMode;
interface CatalogPage { items: RetailMedicineCard[]; totalPages: number; totalCount: number; }

const PAGE_SIZE = 12;

@Component({
  selector: 'retail-catalog-panel',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooFilterChipsComponent,
    BooInputComponent,
    BooPaginationComponent,
    BooSearchFieldComponent,
    BooSelectComponent,
  ],
  template: `
    <section class="flex h-full min-h-0 flex-col bg-surface border border-borderGray/60 rounded-2" aria-label="Medicine catalog">
      <div class="shrink-0 p-4 space-y-3 border-b border-borderGray/60">
        <boo-search-field label="Search medicines" placeholder="Search by name, generic name or exact barcode (F2)" [busy]="loading() && view() === 'Catalog'"
          [ngModel]="search" (ngModelChange)="onSearchInput($event)" (clear)="clearSearch()"></boo-search-field>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <boo-select *ngIf="categories().length" label="Category" [options]="categories()" bindLabel="name" bindValue="id"
            [ngModel]="categoryId" (ngModelChange)="onCategoryChange($event)"></boo-select>
          <boo-input #barcodeInput label="Scan barcode (Ctrl+B)" [(ngModel)]="barcode" (keydown.enter)="scanBarcode()" [disabled]="scanning()"></boo-input>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Catalog view">
            <button *ngFor="let v of views" boo-button size="sm" [variant]="view() === v.key ? 'soft' : 'ghost'" (click)="setView(v.key)"
              [attr.aria-pressed]="view() === v.key">{{ v.label }}</button>
          </div>
          <boo-filter-chips [chips]="activeChips()" (remove)="removeChip($event)"></boo-filter-chips>
        </div>
        <p *ngIf="view() !== 'Catalog'" class="text-xs text-secondary m-0">{{ viewHint() }}</p>
      </div>

      <div class="flex min-h-0 flex-1 flex-col" aria-live="polite" [attr.aria-busy]="loading()">
        <div *ngIf="loading() && !items().length" class="p-4 space-y-2">
          <div *ngFor="let n of skeleton" class="h-14 rounded-1.5 bg-gray-50 animate-pulse"></div>
        </div>

        <boo-error-state *ngIf="!loading() && error()" title="Couldn't load medicines" [description]="error()" (retry)="reload()"></boo-error-state>

        <boo-empty-state *ngIf="!loading() && !error() && !items().length" icon="search-x" [title]="emptyTitle()" [description]="emptyDescription()">
          <button *ngIf="hasFilters()" boo-button variant="outline" size="sm" (click)="clearFilters()">Clear filters</button>
        </boo-empty-state>

        <div *ngIf="!error() && items().length" class="boo-scrollbar min-h-0 flex-1 overflow-auto transition-opacity" [class.opacity-60]="loading()">
          <table class="w-full min-w-[520px] text-sm border-collapse">
            <caption class="sr-only">Medicines available for retail sale</caption>
            <thead class="sticky top-0 z-10 bg-gray-50">
              <tr class="text-left text-[11px] uppercase tracking-wide text-secondary bg-gray-50">
                <th scope="col" class="px-4 py-2.5 font-semibold">Medicine</th>
                <th scope="col" class="px-3 py-2.5 font-semibold hidden xl:table-cell">Category</th>
                <th scope="col" class="px-3 py-2.5 font-semibold hidden lg:table-cell">Batch · expiry</th>
                <th scope="col" class="px-3 py-2.5 font-semibold text-right">Stock</th>
                <th scope="col" class="px-3 py-2.5 font-semibold text-right">Price</th>
                <th scope="col" class="px-4 py-2.5 font-semibold text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let med of items(); trackBy: trackById" class="border-t border-borderGray/60 hover:bg-gray-50/70" [class.text-gray-500]="med.stock <= 0">
                <th scope="row" class="px-4 py-3 text-left font-normal align-top">
                  <button type="button" (click)="viewDetail.emit(med.id)" class="text-left font-semibold text-regular hover:text-primaryDeep hover:underline break-words bg-transparent p-0 border-0 cursor-pointer">{{ med.name }}</button>
                  <span class="block text-xs text-secondary break-words">{{ subtitle(med) }}</span>
                  <span *ngIf="med.barcode" class="block text-[11px] text-gray-500 tabular-nums">{{ med.barcode }}</span>
                </th>
                <td class="px-3 py-3 align-top text-xs text-secondary hidden xl:table-cell">{{ med.category }}<span *ngIf="med.manufacturer" class="block text-gray-500">{{ med.manufacturer }}</span></td>
                <td class="px-3 py-3 align-top text-xs text-secondary hidden lg:table-cell">
                  <ng-container *ngIf="med.batchNo || med.expiryDate; else noBatch">{{ med.batchNo }}<span *ngIf="med.expiryDate" class="block text-gray-500">{{ med.expiryDate | date:'mediumDate' }}</span></ng-container>
                  <ng-template #noBatch>—</ng-template>
                </td>
                <td class="px-3 py-3 align-top text-right tabular-nums whitespace-nowrap">
                  <span *ngIf="med.stock > 0" class="text-regular">{{ med.stock }}</span>
                  <span *ngIf="med.stock <= 0" class="text-xs font-semibold text-danger">Out of stock</span>
                </td>
                <td class="px-3 py-3 align-top text-right tabular-nums whitespace-nowrap">
                  <span class="font-semibold text-regular">{{ money(med.price) }}</span>
                  <span *ngIf="med.mrp && med.mrp > med.price" class="block text-[11px] text-gray-500 line-through">{{ money(med.mrp) }}</span>
                </td>
                <td class="px-4 py-3 align-top text-right">
                  <button boo-button variant="outline" size="sm" (click)="addToCart.emit(med)" [disabled]="med.stock <= 0 || addDisabled"
                    [loading]="pendingMedicineId === med.id" [attr.aria-label]="'Add ' + med.name + ' to sale'" [attr.title]="addDisabled ? addDisabledReason : null">Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="items().length" class="shrink-0 px-4 py-3 border-t border-borderGray/60 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs text-secondary">{{ view() === 'Catalog' ? totalCount() + ' medicines' : items().length + ' medicines' }}</span>
        <boo-pagination *ngIf="view() === 'Catalog'" [page]="pageNumber()" [totalPages]="totalPages()" (pageChange)="goToPage($event)"></boo-pagination>
      </div>
    </section>
  `,})
export class RetailCatalogPanelComponent implements OnInit {
  /** Disables every Add button, e.g. the cart is on hold or the cashier cannot edit carts. */
  @Input() addDisabled = false;
  @Input() addDisabledReason = '';
  /** Medicine whose add request is in flight; its button shows a spinner. */
  @Input() pendingMedicineId: string | null = null;
  /** Categories need pharmacy:medicine-category:read; without it the filter is simply not offered. */
  @Input() canReadCategories = false;
  @Output() addToCart = new EventEmitter<RetailMedicineCard>();
  @Output() viewDetail = new EventEmitter<string>();
  /** Fires with every list the panel receives so the page can keep a stock lookup for cart quantity hints. */
  @Output() medicinesLoaded = new EventEmitter<RetailMedicineCard[]>();
  @Output() barcodeScanned = new EventEmitter<RetailMedicineCard>();

  @ViewChild('barcodeInput') private barcodeInput?: BooInputComponent;
  @ViewChild(BooSearchFieldComponent, { read: ElementRef }) private searchField?: ElementRef<HTMLElement>;

  private readonly srv = inject(RetailPosService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();
  private loadSub?: Subscription;

  readonly skeleton = Array.from({ length: 6 });
  readonly views: { key: CatalogView; label: string }[] = [
    { key: 'Catalog', label: 'Catalog' },
    { key: 'RecentlySold', label: 'Recently sold' },
    { key: 'Recommended', label: 'Best selling' },
  ];

  items = signal<RetailMedicineCard[]>([]);
  categories = signal<RetailCategory[]>([]);
  loading = signal(true);
  scanning = signal(false);
  error = signal<string | null>(null);
  view = signal<CatalogView>('Catalog');
  pageNumber = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  search = '';
  categoryId: string | null = null;
  barcode = '';

  ngOnInit(): void {
    this.search$.pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pageNumber.set(1);
      this.reload();
    });
    if (this.canReadCategories) {
      this.srv.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: res => { if (res.success) this.categories.set(res.data.items); },
        error: () => { /* optional filter: the catalog stays usable without it */ },
      });
    }
    this.reload();
  }

  focusSearch(): void {
    this.searchField?.nativeElement.querySelector('input')?.focus();
  }

  focusBarcode(): void {
    this.barcodeInput?.focusInput();
  }

  reload(): void {
    this.loadSub?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    const view = this.view();
    const request$: Observable<CatalogPage> = view === 'Catalog'
      ? this.srv.searchCatalog({ search: this.search, categoryId: this.categoryId, pageNumber: this.pageNumber(), pageSize: PAGE_SIZE }).pipe(
        map(res => ({ items: res.success ? res.data?.items ?? [] : [], totalPages: res.data?.totalPages ?? 1, totalCount: res.data?.totalCount ?? 0 })))
      : this.srv.getSuggestions(view).pipe(
        map(res => ({ items: res.success ? res.data ?? [] : [], totalPages: 1, totalCount: res.data?.length ?? 0 })));

    this.loadSub = request$.subscribe({
      next: page => {
        this.items.set(page.items);
        this.totalPages.set(Math.max(1, page.totalPages));
        this.totalCount.set(page.totalCount);
        this.loading.set(false);
        this.medicinesLoaded.emit(this.items());
      },
      error: () => {
        this.items.set([]);
        this.loading.set(false);
        this.error.set('Check your connection and try again.');
      },
    });
  }

  onSearchInput(value: string): void {
    this.search = value ?? '';
    if (this.view() !== 'Catalog') this.view.set('Catalog');
    this.search$.next(this.search.trim());
  }

  clearSearch(): void {
    this.search = '';
    this.search$.next('');
  }

  onCategoryChange(value: string | null): void {
    this.categoryId = value || null;
    this.view.set('Catalog');
    this.pageNumber.set(1);
    this.reload();
  }

  setView(key: CatalogView): void {
    if (this.view() === key) return;
    this.view.set(key);
    this.pageNumber.set(1);
    this.reload();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.reload();
  }

  clearFilters(): void {
    this.search = '';
    this.categoryId = null;
    this.view.set('Catalog');
    this.pageNumber.set(1);
    this.reload();
  }

  activeChips(): (BooFilterChip & { kind: 'search' | 'category' })[] {
    const chips: (BooFilterChip & { kind: 'search' | 'category' })[] = [];
    if (this.view() === 'Catalog' && this.search.trim()) chips.push({ label: `"${this.search.trim()}"`, kind: 'search' });
    if (this.view() === 'Catalog' && this.categoryId) {
      chips.push({ label: this.categories().find(c => c.id === this.categoryId)?.name ?? 'Category', kind: 'category' });
    }
    return chips;
  }

  removeChip(chip: BooFilterChip): void {
    if ((chip as { kind?: string }).kind === 'search') {
      this.search = '';
      this.pageNumber.set(1);
      this.reload();
    } else {
      this.onCategoryChange(null);
    }
  }

  hasFilters(): boolean {
    return this.view() !== 'Catalog' || !!this.search.trim() || !!this.categoryId;
  }

  scanBarcode(): void {
    const code = (this.barcode ?? '').trim();
    if (!code || this.scanning()) return;
    this.scanning.set(true);
    this.srv.lookupByBarcode(code).subscribe({
      next: res => {
        this.scanning.set(false);
        if (res.success && res.data) {
          this.barcodeScanned.emit(res.data);
          this.barcode = '';
        } else {
          this.toastSrv.error(`No medicine found for barcode ${code}`);
        }
      },
      error: () => this.scanning.set(false), // barcode kept so the cashier can rescan or correct it
    });
  }

  viewHint(): string {
    return this.view() === 'RecentlySold'
      ? 'Medicines sold at retail in the last 30 days, most recent first. Search and category filters do not apply here.'
      : 'Best-selling medicines at retail over the last 30 days, by units sold. Search and category filters do not apply here.';
  }

  emptyTitle(): string {
    if (this.view() !== 'Catalog') return 'No retail sales in the last 30 days';
    return this.hasFilters() ? 'No medicines match your search' : 'No medicines available';
  }

  emptyDescription(): string {
    if (this.view() !== 'Catalog') return 'Suggestions appear once medicines have been sold at retail.';
    return this.hasFilters() ? 'Try a different name, barcode or category.' : 'Active medicines will appear here once they are added to the catalog.';
  }

  subtitle(med: RetailMedicineCard): string {
    return [med.genericName, med.strength, med.packageLabel].filter(Boolean).join(' · ');
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }

  trackById(_: number, item: RetailMedicineCard): string {
    return item.id;
  }
}
