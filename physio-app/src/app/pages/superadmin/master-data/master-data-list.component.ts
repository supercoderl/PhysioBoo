import { Component, ComponentRef, DestroyRef, inject, OnInit, signal, ViewChild, ViewContainerRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from "rxjs";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { SuperadminMasterDataTableCardComponent } from "../../../components/layout/superadmin/master-data/master-data-table-card.component";
import { SuperadminPageHeaderComponent } from "../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { ErrorStateComponent } from "../../../components/ui/error-state.component";
import { AuthService } from "../../../services/auth/auth.service";
import { MasterDataRegistry } from "../../../services/admin/master-data.registry";
import { DialogService } from "../../../services/common/dialog.service";
import { ToastService } from "../../../services/common/toast.service";
import { SharedModule } from "../../../shared/shared-imports";
import { PaginationData } from "../../../shared/types/common";
import { FilterConfig } from "../../../shared/types/filter.types";
import { MasterDataConfig, MasterDataDrawer } from "../../../shared/types/master-data.types";
import { SortOption } from "../../../shared/types/sort";

const SORT_OPTIONS: SortOption[] = [
    { label: 'Recent', value: '-createdAt' },
    { label: 'Oldest', value: '+createdAt' },
    { label: 'Name (A-Z)', value: '+name' },
    { label: 'Name (Z-A)', value: '-name' },
    { label: 'Code (A-Z)', value: '+code' },
    { label: 'Code (Z-A)', value: '-code' },
];

/**
 * One list for every platform-wide catalog (route `master-data/:catalog`).
 * The catalog's service, columns, filters and drawer come from `MasterDataRegistry`; the drawer is
 * created dynamically because every catalog drawer shares the same inputs and outputs.
 */
@Component({
    selector: 'superadmin-master-data-list',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        SuperadminPageHeaderComponent,
        SuperadminMasterDataTableCardComponent,
        ErrorStateComponent
    ],
    host: { class: 'block h-full min-h-0' },
    template: `
        <div *ngIf="config() as cfg" class="h-full flex flex-col gap-5">
            <a
                *ngIf="cfg.group === 'master-data'"
                routerLink="/superadmin/master-data"
                class="inline-flex items-center gap-1.5 -ml-1 px-1 py-1 rounded-1.5 text-xs text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
            >
                <physio-icon name="arrow-left" [size]="14" />
                Master data
            </a>

            <superadmin-page-header [title]="cfg.title" [description]="cfg.description">
                <boo-button-admin
                    [icon]="{ name: 'plus', size: 14 }"
                    textColor="white"
                    (click)="openDrawer(null)"
                >
                    New {{ cfg.singular }}
                </boo-button-admin>
            </superadmin-page-header>

            <div *ngIf="loadFailed(); else tableCard" class="bg-surface rounded-2 border border-borderGray/60" role="alert">
                <boo-error-state
                    icon="info"
                    [title]="'Couldn\\'t load ' + cfg.title.toLowerCase()"
                    description="Check your connection and try again."
                    (retry)="loadItems()"
                />
            </div>
            <ng-template #tableCard>
                <div class="flex-1 min-h-[320px]">
                    <superadmin-master-data-table-card
                        [data]="tableData()"
                        [nameKey]="cfg.nameKey"
                        [columns]="cfg.columns"
                        [filter]="{ pageNumber: params.pageNumber, pageSize: params.pageSize }"
                        [sortOptions]="cfg.sortOptions ?? sortOptions"
                        [currentSort]="params.sort"
                        [filterConfigs]="filterConfigs()"
                        [currentFilter]="params.filters"
                        [loading]="loading()"
                        (pageChange)="onPageClick($event)"
                        (searchChange)="onSearch($event)"
                        (reloadClick)="loadItems()"
                        (sortApply)="onSortChange($event)"
                        (filterApply)="onFilterApply($event)"
                        (editClick)="openDrawer($event)"
                        (deleteClick)="onDelete($event)"
                    />
                </div>
            </ng-template>
        </div>

        <ng-container #drawerHost></ng-container>
    `
})
export class SuperadminMasterDataListComponent implements OnInit {
    // #region Inject Services
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly registry = inject(MasterDataRegistry);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    // #endregion

    // #region Inputs, Outputs, Properties
    @ViewChild('drawerHost', { read: ViewContainerRef, static: true }) private drawerHost!: ViewContainerRef;
    private drawerRef: ComponentRef<MasterDataDrawer> | null = null;

    readonly sortOptions = SORT_OPTIONS;

    config = signal<MasterDataConfig | null>(null);
    filterConfigs = signal<FilterConfig[]>([]);
    tableData = signal<PaginationData<any> | null>(null);
    loading = signal(false);
    loadFailed = signal(false);
    selectedId: string | null = null;

    params = this.initialParams();
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            // `master-data/:catalog` carries the slug in the URL; fixed pages (e.g. sequence rules) carry it in route data.
            const config = this.registry.get(params.get('catalog') ?? this.route.snapshot.data['catalog']);
            if (!config) {
                this.router.navigate(['/superadmin']);
                return;
            }
            if (!this.authSrv.hasPermission(config.permission)) {
                this.router.navigate(['/exception/403']);
                return;
            }
            this.open(config);
        });
    }
    // #endregion

    // #region Methods
    private initialParams() {
        return {
            pageNumber: 1,
            pageSize: 20,
            search: '',
            sort: '-createdAt',
            filters: {} as Record<string, any>
        };
    }

    /** (Re)initialises the page for a catalog; also runs when the route param changes between catalogs. */
    private open(config: MasterDataConfig): void {
        this.params = this.initialParams();
        this.tableData.set(null);
        this.loadFailed.set(false);
        this.selectedId = null;
        this.config.set(config);
        // FilterConfig holds the user's selection in `value`, so each catalog gets its own copies.
        this.filterConfigs.set(config.filters.map(f => ({ ...f })));
        this.mountDrawer(config);
        this.loadItems();
    }

    private mountDrawer(config: MasterDataConfig): void {
        this.drawerHost.clear();
        const ref = this.drawerHost.createComponent(config.drawer);
        ref.setInput('isOpen', false);
        ref.setInput('currentId', null);
        ref.instance.close.subscribe(() => this.closeDrawer());
        ref.instance.saveSuccess.subscribe(() => this.onSaved());
        ref.instance.delete.subscribe((id: string) => this.onDelete(id));
        this.drawerRef = ref;
    }

    loadItems(): void {
        const config = this.config();
        if (!config) return;

        this.loading.set(true);
        this.loadFailed.set(false);
        config.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: { start: '', end: '', ...this.params.filters }
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (res.success) this.tableData.set(res.data);
                else this.loadFailed.set(true);
            },
            error: () => this.loadFailed.set(true)
        });
    }

    onSearch(value: string): void {
        this.params = { ...this.params, pageNumber: 1, search: value };
        this.loadItems();
    }

    onSortChange(sort: SortOption): void {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadItems();
    }

    onFilterApply(event: { key: string; value: any }): void {
        this.params = { ...this.params, pageNumber: 1, filters: { ...this.params.filters, [event.key]: event.value } };
        this.loadItems();
    }

    onPageClick(page: number): void {
        this.params.pageNumber = page;
        this.loadItems();
    }

    openDrawer(id: string | null): void {
        this.selectedId = id;
        this.drawerRef?.setInput('currentId', id);
        this.drawerRef?.setInput('isOpen', true);
    }

    closeDrawer(): void {
        this.selectedId = null;
        this.drawerRef?.setInput('isOpen', false);
        this.drawerRef?.setInput('currentId', null);
    }

    onSaved(): void {
        this.closeDrawer();
        this.loadItems();
    }

    onDelete(id: string | null): void {
        const config = this.config();
        if (!id || !config) return;

        this.dialogSrv.confirmDelete(() => {
            config.remove(id).subscribe({
                next: () => {
                    this.toastSrv.success(`Deleted ${config.singular}`);
                    if (this.selectedId === id) this.closeDrawer();

                    const data = this.tableData();
                    if (data && data.items.length === 1 && data.pageNumber > 1) {
                        this.params.pageNumber = data.pageNumber - 1;
                    }
                    this.loadItems();
                },
                error: () => this.toastSrv.error(`Failed to delete ${config.singular}`)
            });
        }, `this ${config.singular}`);
    }
    // #endregion
}
