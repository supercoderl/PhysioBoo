import { Component, EventEmitter, Input, Output, WritableSignal, computed } from "@angular/core";
import { catchError, forkJoin, of } from "rxjs";
import { UserPermissionUserTableCardComponent } from "../../../../components/layout/admin/system/user-permission/user-table-card.component";
import { UserService } from "../../../../services/admin/user.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PagedRequest, PaginationData } from "../../../../shared/types/common";
import { User } from "../../../../shared/types/core";
import { FilterConfig, UserFilter } from "../../../../shared/types/filter";
import { SortOption } from "../../../../shared/types/sort";
import { BulkAction, SavedView, TableComment } from "../../../../shared/types/table";

@Component({
    selector: 'admin-user-permission-user-tab',
    standalone: true,
    imports: [
        SharedModule,
        UserPermissionUserTableCardComponent
    ],
    template: `
        <div class="flex-1 min-h-0" #tableHost>
            <user-permission-user-table-card
                [data]="tableData()"
                [sortOptions]="sort_options"
                [currentSort]="params().sort"
                [filterConfigs]="filter_configs"
                [currentFilter]="params().filter"
                [savedViews]="savedViews"
                [currentViewId]="currentViewId"
                [currentGroupBy]="currentGroupBy"
                [comments]="comments"
                (pageChange)="onPageChanged($event)"
                (editClick)="onOpenDrawer($event)"
                (deleteClick)="onDelete($event)"
                (searchChange)="onSearch($event)"
                (reloadClick)="onReloadClick()"
                (bulkAction)="onBulkAction($event)"
                (sortApply)="onSortChange($event)"
                (filterApply)="onSingleFilterChange($event)"
                (viewSelect)="onViewSelect($event)"
                (viewSaveAsNew)="onViewSaveAsNew()"
                (viewDelete)="onViewDelete($event)"
                (groupApply)="onGroupApply($event)"
                (commentAdd)="onCommentAdd($event)"
                (commentDelete)="onCommentDelete($event)"
                (resetView)="onResetView()"
                [filter]="paginationFilter()"
            />
        </div>
    `
})
export class AdminUserPermissionUserTabComponent {
    // #region Inputs, Outputs, Properties
    @Input({ required: true }) tableData!: WritableSignal<PaginationData<User> | null>;
    @Input({ required: true }) params!: WritableSignal<PagedRequest<UserFilter>>;
    @Output() reloadClick = new EventEmitter<void>();

    paginationFilter = computed(() => ({
        pageNumber: this.params().pageNumber ?? 1,
        pageSize:   this.params().pageSize   ?? 10,
    }));

    sort_options: SortOption[] = [
        { label: 'Recent', value: '-createdAt' },
        { label: 'Oldest', value: '+createdAt' },
        { label: 'Email (A-Z)', value: '+email' },
        { label: 'Email (Z-A)', value: '-email' },
    ];

    isDrawerOpen: boolean = false;
    selectedId: string | null = null;

    filter_configs: FilterConfig[] = [
        {
            key: 'isActive',
            label: 'Status',
            type: 'boolean',
            value: null,
            trueLabel: 'Active',
            falseLabel: 'Inactive'
        }
    ];

    savedViews: SavedView[] = [
        { id: 'all', name: 'All accounts', isDefault: true, icon: 'rows-4' },
        { id: 'recent', name: 'Recent', icon: 'clock' },
    ];
    currentViewId: string | null = 'all';
    currentGroupBy: string | null = null;
    comments: TableComment[] = [];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        private userSrv: UserService
    ) { }
    // #endregion

    // #region Methods
    onPageChanged(newPage: number) {
        this.params.update(p => ({ ...p, pageNumber: newPage }));
        this.onReloadClick();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onReloadClick() {
        this.reloadClick.emit();
    }

    onSaveSuccess(result: User) {
        this.onCloseDrawer();
        this.tableData.update(currentData => {
            if (!currentData) {
                return {
                    items: [result],
                    totalCount: 1,
                    pageNumber: 1,
                    pageSize: this.params().pageSize ?? 10,
                    totalPages: 1,
                    hasNext: false,
                    hasPrevious: false
                };
            }

            const existingIndex = currentData.items.findIndex(x => x.id === result.id);
            if (existingIndex > -1) {
                const updatedItems = [...currentData.items];
                updatedItems[existingIndex] = result;
                return { ...currentData, items: updatedItems };
            }

            return {
                ...currentData,
                totalCount: currentData.totalCount + 1,
                items: [result, ...currentData.items],
                totalPages: Math.ceil((currentData.totalCount + 1) / currentData.pageSize)
            };
        });
    }

    onDelete(id: string | null) {
        if (!id) return;

        this.dialogSrv.confirmDelete(() => {
            const currentData = this.tableData();
            if (!currentData) return;

            const isLastItemOnPage = currentData.items.length === 1;
            const isNotFirstPage = currentData.pageNumber > 1;

            if (isLastItemOnPage && isNotFirstPage) {
                this.toastSrv.success("Deleted 1 item.");
                this.userSrv.delete(id).subscribe({
                    next: () => {
                        this.params.update(p => ({ ...p, pageNumber: currentData.pageNumber - 1 }));
                        this.onReloadClick();
                    },
                    error: () => this.toastSrv.error("System error occurred.")
                });
                if (this.isDrawerOpen) this.onCloseDrawer();
                return;
            }

            const backupItems = [...currentData.items];
            const backupCount = currentData.totalCount;

            this.tableData.update(data => {
                if (!data) return null;
                return {
                    ...data,
                    items: data.items.filter(item => item.id !== id),
                    totalCount: data.totalCount - 1
                };
            });

            this.toastSrv.success("Deleted 1 item.");
            this.userSrv.delete(id)
                .pipe(
                    catchError(_ => {
                        this.toastSrv.error("System error occurred. Rolling back data...");
                        this.tableData.update(data => {
                            if (!data) return null;
                            return { ...data, items: backupItems, totalCount: backupCount };
                        });
                        return of(null);
                    })
                )
                .subscribe({ next: _ => { if (this.isDrawerOpen) this.onCloseDrawer(); } });
        });
    }

    onSearch(val: string) {
        this.params.update(p => ({ ...p, pageNumber: 1, search: val }));
        this.onReloadClick();
    }

    onSortChange(sort: SortOption) {
        this.params.update(p => ({ ...p, pageNumber: 1, sort: sort.value }));
        this.onReloadClick();
    }

    onFilterApply(event: any) {
        this.params.update(p => ({
            ...p,
            pageNumber: 1,
            filter: { ...p.filter, ...event }
        }));
        this.onReloadClick();
    }

    onSingleFilterChange(event: { key: string; value: any }) {
        this.params.update(p => ({
            ...p,
            pageNumber: 1,
            filter: { ...(p.filter ?? { isActive: null }), [event.key]: event.value } as UserFilter
        }));
        this.onReloadClick();
    }

    onViewSelect(v: SavedView) {
        this.currentViewId = v.id;
        switch (v.id) {
            case 'all':
                this.params.update(p => ({
                    ...p,
                    pageNumber: 1,
                    filter: { isActive: null },
                    sort: '-createdAt'
                }));
                break;
            case 'recent':
                this.params.update(p => ({ ...p, pageNumber: 1, sort: '-createdAt' }));
                break;
        }
        this.onReloadClick();
    }

    onViewSaveAsNew() {
        const name = prompt('Name for this view?');
        if (!name) return;
        const newView: SavedView = { id: `view_${Date.now()}`, name, icon: 'bookmark' };
        this.savedViews = [...this.savedViews, newView];
        this.currentViewId = newView.id;
    }

    onViewDelete(v: SavedView) {
        this.savedViews = this.savedViews.filter(x => x.id !== v.id);
        if (this.currentViewId === v.id) this.currentViewId = 'all';
    }

    onGroupApply(key: string | null) {
        this.currentGroupBy = key;
    }

    onCommentAdd(text: string) {
        this.comments = [
            ...this.comments,
            {
                id: `c_${Date.now()}`,
                author: 'You',
                text,
                createdAt: new Date().toLocaleString()
            }
        ];
    }

    onCommentDelete(c: TableComment) {
        this.comments = this.comments.filter(x => x.id !== c.id);
    }

    onResetView() {
        this.params.update(p => ({
            pageNumber: 1,
            pageSize: p.pageSize,
            search: '',
            sort: '-createdAt',
            filter: { isActive: null }
        }));
        this.currentGroupBy = null;
        this.currentViewId = 'all';
        this.onReloadClick();
    }

    onBulkAction(event: { action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }) {
        const { action, ids } = event;
        if (!ids.length) return;

        if (action.key === 'delete') {
            const calls = ids.map(id => this.userSrv.delete(String(id)).pipe(
                catchError(_ => of(null))
            ));
            forkJoin(calls).subscribe(results => {
                const failed = results.filter(r => r === null).length;
                if (failed === 0) {
                    this.toastSrv.success(`Deleted ${ids.length} item(s).`);
                } else {
                    this.toastSrv.error(`${failed} of ${ids.length} item(s) failed to delete.`);
                }
                this.onReloadClick();
            });
            return;
        }

        if (action.key === 'export') {
            this.toastSrv.success(`Exporting ${ids.length} item(s)...`);
            return;
        }
    }

    // #endregion
}
