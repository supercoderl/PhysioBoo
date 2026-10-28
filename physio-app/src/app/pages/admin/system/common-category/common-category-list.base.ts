import { AfterViewInit, DestroyRef, Directive, ElementRef, ViewChild, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, Subscription, catchError, finalize, forkJoin, map, of } from "rxjs";
import { CategoryFilterChip } from "../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { AuthService } from "../../../../services/auth/auth.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { TablePageSizeService } from "../../../../services/common/table-page-size.service";
import { ToastService } from "../../../../services/common/toast.service";
import { PagedRequest, PagedResponse, PaginationData } from "../../../../shared/types/common";
import { FilterConfig } from "../../../../shared/types/filter.types";
import { SortOption } from "../../../../shared/types/sort";
import { BulkAction } from "../../../../shared/types/table.types";

/** The part of each catalog service the list page uses. */
export interface CategoryListService<T> {
    search(request: PagedRequest<any>): Observable<PagedResponse<PaginationData<T>>>;
    /** 204 with no body. */
    delete(id: string): Observable<unknown>;
}

export interface CategoryListConfig<T> {
    service: CategoryListService<T>;
    /** Singular and plural noun for counts, toasts and confirmations, e.g. ['supplier', 'suppliers']. */
    noun: [string, string];
    permissions: { create: string; update: string; delete: string };
    /** Boolean filters the search endpoint applies; keys are the backend filter properties. */
    filters?: FilterConfig[];
    /** Label used in the delete confirmation. */
    itemName: (item: T) => string;
}

/** Every catalog search endpoint sorts by these keys (see the *SortProvider classes on the server). */
export const CATEGORY_SORT_OPTIONS: SortOption[] = [
    { label: 'Recently added', value: '-createdAt' },
    { label: 'Oldest first', value: '+createdAt' },
    { label: 'Name (A-Z)', value: '+name' },
    { label: 'Name (Z-A)', value: '-name' },
    { label: 'Code (A-Z)', value: '+code' },
    { label: 'Code (Z-A)', value: '-code' },
];

const DEFAULT_SORT = '-createdAt';

/**
 * Shared state and API wiring for the Common Category list pages: server-side search, boolean filters, sort and
 * paging; delete with confirmation; drawer open/close; load and error state. Each page supplies its service,
 * nouns, permissions and the filters its endpoint supports, and renders its own table card.
 */
@Directive()
export abstract class CommonCategoryListBase<T extends { id: string }> implements AfterViewInit {
    @ViewChild('tableHost', { static: false }) tableHost?: ElementRef<HTMLElement>;

    // #region Inputs, Outputs, Properties
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly pageSizeSrv = inject(TablePageSizeService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    readonly sortOptions = CATEGORY_SORT_OPTIONS;
    readonly filterConfigs: FilterConfig[];
    readonly canCreate: boolean;
    readonly canUpdate: boolean;
    readonly canDelete: boolean;

    readonly tableData = signal<PaginationData<T> | null>(null);
    /** True from the start: the first request goes out as soon as the table's height is known. */
    readonly loading = signal(true);
    readonly loadFailed = signal(false);

    params = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: DEFAULT_SORT,
        filter: {} as Record<string, boolean | null>
    };

    isDrawerOpen = false;
    selectedId: string | null = null;

    private loadSub?: Subscription;
    // #endregion

    // #region Init (Lifecycle + Setup)
    protected constructor(private readonly config: CategoryListConfig<T>) {
        this.filterConfigs = config.filters ?? [];
        this.params.filter = Object.fromEntries(this.filterConfigs.map(f => [f.key, null]));
        this.canCreate = this.authSrv.hasPermission(config.permissions.create);
        this.canUpdate = this.authSrv.hasPermission(config.permissions.update);
        this.canDelete = this.authSrv.hasPermission(config.permissions.delete);
    }

    ngAfterViewInit(): void {
        // Rows fill the height left under the heading; resizing the window re-pages from the first page.
        this.pageSizeSrv
            .watch({
                hostElement: this.tableHost,
                rowHeight: 53,
                toolbarHeight: 48,
                headerHeight: 48,
                footerHeight: 45,
                extraOffset: 32,
                min: 8,
                max: 50
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(size => {
                if (this.tableData() && size === this.params.pageSize) return;
                // The first size arrives during ngAfterViewInit; applying it a tick later keeps this check stable.
                queueMicrotask(() => {
                    this.params.pageSize = size;
                    this.params.pageNumber = 1;
                    this.load();
                });
            });
    }
    // #endregion

    // #region Getters
    get total(): number | null {
        return this.tableData()?.totalCount ?? null;
    }

    /** "12 suppliers" / "1 supplier match" for the heading. */
    get countLabel(): string {
        const total = this.total;
        if (total === null) return '';
        const [one, many] = this.config.noun;
        return `${total} ${total === 1 ? one : many}${this.hasFilters ? (total === 1 ? ' matches' : ' match') : ''}`;
    }

    get hasFilters(): boolean {
        return this.chips.length > 0;
    }

    /** One chip per active search term or filter, so what narrows the list stays visible and removable. */
    get chips(): CategoryFilterChip[] {
        const chips: CategoryFilterChip[] = [];
        if (this.params.search) chips.push({ key: 'search', label: `“${this.params.search}”` });
        for (const cfg of this.filterConfigs) {
            const value = this.params.filter[cfg.key];
            if (value === null || value === undefined) continue;
            chips.push({ key: cfg.key, label: `${cfg.label}: ${value ? (cfg.trueLabel ?? 'Yes') : (cfg.falseLabel ?? 'No')}` });
        }
        return chips;
    }
    // #endregion

    // #region Methods
    load(): void {
        this.loadSub?.unsubscribe();
        this.loading.set(true);
        this.loadFailed.set(false);

        const filter = Object.fromEntries(
            Object.entries(this.params.filter).filter(([, value]) => value !== null && value !== undefined)
        );

        this.loadSub = this.config.service.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            // No catalog page filters by creation date; empty bounds disable that filter on the server.
            filter: { ...filter, start: '', end: '' }
        })
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: res => {
                    if (res.success && res.data) this.tableData.set(res.data);
                    else this.loadFailed.set(true);
                },
                // The HTTP interceptor toasts the reason; the page keeps the last results and offers a retry.
                error: () => this.loadFailed.set(true)
            });
    }

    onPageChanged(page: number): void {
        this.params.pageNumber = page;
        this.load();
    }

    onSearch(value: string): void {
        const search = (value ?? '').trim();
        if (search === this.params.search) return;
        this.params = { ...this.params, pageNumber: 1, search };
        this.load();
    }

    onSortChange(sort: SortOption): void {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.load();
    }

    onFilterChange(event: { key: string; value: any }): void {
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: { ...this.params.filter, [event.key]: event.value ?? null }
        };
        this.load();
    }

    removeChip(chip: CategoryFilterChip): void {
        if (chip.key === 'search') this.onSearch('');
        else this.onFilterChange({ key: chip.key, value: null });
    }

    /** Clears search and every filter in one request; the sort order is a view preference and stays. */
    clearFilters(): void {
        this.params = {
            ...this.params,
            pageNumber: 1,
            search: '',
            filter: Object.fromEntries(Object.keys(this.params.filter).map(key => [key, null]))
        };
        this.load();
    }

    onOpenDrawer(id: string | null): void {
        if (id ? !this.canUpdate : !this.canCreate) return;
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer(): void {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    /** A saved row may sort anywhere on the server, so reload the page instead of patching it in. */
    onSaveSuccess(): void {
        this.onCloseDrawer();
        this.load();
    }

    onDelete(id: string | null): void {
        if (!id || !this.canDelete) return;

        const item = this.tableData()?.items.find(x => x.id === id);
        const name = item ? this.config.itemName(item) : `this ${this.config.noun[0]}`;

        this.dialogSrv.confirmDelete(() => {
            const data = this.tableData();
            const wasLastOnPage = !!data && data.items.length === 1 && data.pageNumber > 1;

            this.config.service.delete(id).subscribe({
                next: () => {
                    this.toastSrv.success(`${this.capitalize(this.config.noun[0])} deleted.`);
                    if (wasLastOnPage) this.params.pageNumber -= 1;
                    if (this.isDrawerOpen) this.onCloseDrawer();
                    this.load();
                },
                // The interceptor shows the server's reason (for example, the record is still referenced).
                error: () => undefined
            });
        }, `“${name}”`);
    }

    /** Bulk delete from the table's selection bar: one confirmation, one request per row, one summary. */
    onBulkAction(event: { action: BulkAction; ids: (number | string)[]; clearSelection: () => void }): void {
        const ids = event.ids.map(String);
        if (event.action.key !== 'delete' || !ids.length || !this.canDelete) return;

        const [one, many] = this.config.noun;
        const what = `${ids.length} ${ids.length === 1 ? one : many}`;

        this.dialogSrv.confirmDelete(() => {
            const data = this.tableData();
            const clearsPage = !!data && ids.length >= data.items.length && data.pageNumber > 1;

            forkJoin(ids.map(id => this.config.service.delete(id).pipe(
                map(() => true),
                catchError(() => of(false))
            ))).subscribe(results => {
                const failed = results.filter(ok => !ok).length;
                const deleted = ids.length - failed;
                if (failed === 0) this.toastSrv.success(`Deleted ${what}.`);
                else if (deleted > 0) this.toastSrv.error(`Deleted ${deleted} of ${ids.length}. ${failed} could not be deleted.`);
                if (clearsPage && failed === 0) this.params.pageNumber -= 1;
                event.clearSelection();
                this.load();
            });
        }, what);
    }

    private capitalize(value: string): string {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
    // #endregion
}
