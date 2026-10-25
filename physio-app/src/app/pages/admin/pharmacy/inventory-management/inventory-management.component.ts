import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { catchError, of, Subject, switchMap, takeUntil } from "rxjs";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { MedicineCategoryService } from "../../../../services/admin/medicine-category.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup, PaginationData } from "../../../../shared/types/common";
import { InventoryKpis, InventoryMedicine } from "../../../../shared/types/inventory-management.types";
import { InventoryDetailDrawerComponent } from "./inventory-detail-drawer.component";
import { InventoryFilterBarComponent } from "./inventory-filter-bar.component";
import { InventoryKpiStripComponent } from "./inventory-kpi-strip.component";
import { InventoryMedicineTableComponent } from "./inventory-medicine-table.component";

type LoadState = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 20;

@Component({
    selector: 'admin-inventory-management',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        InventoryKpiStripComponent,
        InventoryFilterBarComponent,
        InventoryMedicineTableComponent,
        InventoryDetailDrawerComponent,
    ],
    template: `
    <main class="flex flex-1 min-h-0 flex-col gap-5 pb-5">
      <header class="flex shrink-0 flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div class="min-w-0">
          <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Inventory</h1>
          <p class="text-sm text-secondary mt-1 mb-0 max-w-2xl">
            Medicines, on-hand stock and batches. Open a medicine to receive, adjust, transfer or dispose stock.
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button boo-button variant="secondary" (click)="refresh()" [loading]="listState() === 'loading'">
            <physio-icon name="refresh" [size]="16"></physio-icon>Refresh
          </button>
          <a boo-button variant="primary" routerLink="/admin/pharmacy/stock-take">
            <physio-icon name="clipboard-check" [size]="16"></physio-icon>Stock take
          </a>
        </div>
      </header>

      <inventory-kpi-strip class="shrink-0" [kpis]="kpis()" [error]="kpiState() === 'error'" [retrying]="kpiRetrying()" (retry)="loadKpis(true)"></inventory-kpi-strip>

      <inventory-filter-bar
        class="shrink-0"
        [search]="search"
        [categoryId]="categoryId"
        [categories]="categories()"
        (searchChange)="onSearchChange($event)"
        (categoryChange)="onCategoryChange($event)"
        (reset)="onReset()"
      ></inventory-filter-bar>

      <section class="flex flex-1 min-h-[22rem] flex-col" aria-label="Medicines" [attr.aria-busy]="listState() === 'loading'">
        <boo-error-state
          *ngIf="listState() === 'error'"
          appearance="panel"
          title="We couldn't load the medicines"
          description="Check your connection and try again. Your filters are kept."
          (retry)="loadList()"
        ></boo-error-state>

        <ng-container *ngIf="listState() !== 'error'">
          <boo-empty-state
            *ngIf="listState() === 'ready' && !data()?.items?.length"
            appearance="panel"
            icon="package-x"
            [title]="hasFilters ? 'No medicines match your search' : 'No medicines yet'"
            [description]="hasFilters ? 'Try a different name or barcode, or clear the filters.' : 'Medicines added to the catalogue appear here with their stock.'"
          >
            <button *ngIf="hasFilters" boo-button variant="secondary" (click)="onReset()">Reset filters</button>
          </boo-empty-state>

          <inventory-medicine-table
            class="flex-1 min-h-0"
            *ngIf="listState() === 'loading' || data()?.items?.length"
            [data]="data()"
            [loading]="listState() === 'loading'"
            (pageChange)="onPageChange($event)"
            (view)="openPanel($event)"
          ></inventory-medicine-table>
        </ng-container>
      </section>
    </main>

    <inventory-detail-drawer
      [isOpen]="panelOpen()"
      [medicine]="selected()"
      (close)="panelOpen.set(false)"
      (changed)="onStockChanged()"
    ></inventory-detail-drawer>
  `,
})
export class AdminInventoryManagementComponent implements OnInit, OnDestroy {
    private readonly srv = inject(InventoryManagementService);
    private readonly categorySrv = inject(MedicineCategoryService);

    kpis = signal<InventoryKpis | null>(null);
    kpiState = signal<LoadState>('loading');
    kpiRetrying = signal(false);

    data = signal<PaginationData<InventoryMedicine> | null>(null);
    listState = signal<LoadState>('loading');
    categories = signal<Lookup[]>([]);

    search = '';
    categoryId: string | null = null;
    pageNumber = 1;

    selected = signal<InventoryMedicine | null>(null);
    panelOpen = signal(false);

    private readonly load$ = new Subject<void>();
    private readonly destroy$ = new Subject<void>();

    get hasFilters(): boolean {
        return !!this.search.trim() || !!this.categoryId;
    }

    ngOnInit(): void {
        // switchMap drops the response of a request that a newer search or page change has superseded.
        this.load$.pipe(
            switchMap(() => {
                this.listState.set('loading');
                return this.srv.searchMedicines({ search: this.search, categoryId: this.categoryId, pageNumber: this.pageNumber, pageSize: PAGE_SIZE })
                    .pipe(catchError(() => of(null)));
            }),
            takeUntil(this.destroy$),
        ).subscribe(res => {
            if (!res?.success) {
                this.listState.set('error');
                return;
            }
            this.data.set(res.data);
            this.listState.set('ready');
        });

        this.loadKpis();
        this.loadCategories();
        this.loadList();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // #region Loading
    loadList(): void {
        this.load$.next();
    }

    loadKpis(retry = false): void {
        if (retry) this.kpiRetrying.set(true);
        else this.kpiState.set('loading');

        this.srv.getKpis().subscribe({
            next: res => {
                this.kpiRetrying.set(false);
                if (res.success) {
                    this.kpis.set(res.data);
                    this.kpiState.set('ready');
                } else {
                    this.kpiState.set('error');
                }
            },
            error: () => { this.kpiRetrying.set(false); this.kpiState.set('error'); },
        });
    }

    private loadCategories(): void {
        this.categorySrv.search({ pageNumber: 1, pageSize: 100, filter: { start: '', end: '' } }).subscribe({
            next: res => { if (res.success) this.categories.set(res.data.items.map(c => ({ id: c.id, name: c.name }))); },
            // Without categories the filter is simply empty; search still works.
            error: () => this.categories.set([]),
        });
    }

    refresh(): void {
        this.loadKpis();
        this.loadList();
    }
    // #endregion

    // #region Filters and paging
    onSearchChange(value: string): void {
        // Keep the raw text (the input is bound to it); only a change in the trimmed text triggers a search.
        if (value.trim() === this.search.trim()) return;
        this.search = value;
        this.pageNumber = 1;
        this.loadList();
    }

    onCategoryChange(categoryId: string | null): void {
        if ((categoryId ?? null) === this.categoryId) return;
        this.categoryId = categoryId ?? null;
        this.pageNumber = 1;
        this.loadList();
    }

    onReset(): void {
        this.search = '';
        this.categoryId = null;
        this.pageNumber = 1;
        this.loadList();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadList();
    }
    // #endregion

    // #region Detail panel
    openPanel(medicine: InventoryMedicine): void {
        this.selected.set(medicine);
        this.panelOpen.set(true);
    }

    /** A batch changed: refresh the current page and the overview, keeping filters and page. */
    onStockChanged(): void {
        this.loadKpis();
        this.loadList();
    }
    // #endregion
}
