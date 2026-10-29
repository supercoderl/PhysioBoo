import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, WritableSignal, computed } from "@angular/core";
import { catchError, forkJoin, of } from "rxjs";
import { UserPermissionUserTableCardComponent } from "../../../../components/layout/admin/system/user-permission/user-table-card.component";
import { UserService } from "../../../../services/admin/user.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { TablePageSizeService } from "../../../../services/common/table-page-size.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PagedRequest, PaginationData } from "../../../../shared/types/common";
import { User } from "../../../../shared/types/core.types";
import { FilterConfig, UserFilter } from "../../../../shared/types/filter.types";
import { SortOption } from "../../../../shared/types/sort";
import { BulkAction } from "../../../../shared/types/table.types";

@Component({
    selector: 'admin-user-permission-user-tab',
    standalone: true,
    imports: [
        SharedModule,
        UserPermissionUserTableCardComponent
    ],
    // A flex column of the tab's height, so the table card below gets a definite height and scrolls its own rows.
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' },
    template: `
        <div class="flex flex-1 min-h-0 min-w-0 flex-col" #tableHost>
            <user-permission-user-table-card
                [data]="tableData()"
                [sortOptions]="sort_options"
                [currentSort]="params().sort"
                [filterConfigs]="filter_configs"
                [currentFilter]="params().filter"
                (pageChange)="onPageChanged($event)"
                (editClick)="onEdit($event)"
                (deleteClick)="onDelete($event)"
                (searchChange)="onSearch($event)"
                (reloadClick)="onReloadClick()"
                (bulkAction)="onBulkAction($event)"
                (sortApply)="onSortChange($event)"
                (filterApply)="onSingleFilterChange($event)"
                [filter]="paginationFilter()"
            />
        </div>
    `
})
export class AdminUserPermissionUserTabComponent implements AfterViewInit {
    @ViewChild('tableHost', { static: false }) tableHost?: ElementRef<HTMLElement>;

    // #region Inputs, Outputs, Properties
    @Input({ required: true }) tableData!: WritableSignal<PaginationData<User> | null>;
    @Input({ required: true }) params!: WritableSignal<PagedRequest<UserFilter>>;
    @Output() reloadClick = new EventEmitter<void>();
    @Output() editClick = new EventEmitter<User>();

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

    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        private userSrv: UserService,
        private pageSizeSrv: TablePageSizeService
    ) { }

    /** Fit as many rows as the remaining screen height allows. */
    ngAfterViewInit(): void {
        this.pageSizeSrv
            .watch({
                hostElement: this.tableHost,
                rowHeight: 64,
                toolbarHeight: 48,
                headerHeight: 48,
                footerHeight: 44,
                extraOffset: 36,
                min: 5,
                max: 50
            })
            .subscribe(size => {
                if (size === this.params().pageSize) return;
                this.params.update(p => ({ ...p, pageSize: size, pageNumber: 1 }));
                this.onReloadClick();
            });
    }
    // #endregion

    // #region Methods
    onPageChanged(newPage: number) {
        this.params.update(p => ({ ...p, pageNumber: newPage }));
        this.onReloadClick();
    }



    onEdit(id: string) {
        const user = this.tableData()?.items.find(u => u.id === id);
        if (user) this.editClick.emit(user);
    }

    onReloadClick() {
        this.reloadClick.emit();
    }



    onDelete(id: string | null) {
        if (!id) return;

        this.dialogSrv.confirmDelete(() => {
            const data = this.tableData();
            const wasLastOnPage = !!data && data.items.length === 1 && data.pageNumber > 1;

            this.userSrv.delete(id).subscribe({
                next: () => {
                    this.toastSrv.success('Deleted 1 item.');
                    if (wasLastOnPage) this.params.update(p => ({ ...p, pageNumber: (p.pageNumber ?? 1) - 1 }));
                    this.onReloadClick();
                },
                error: () => this.toastSrv.error('The user could not be deleted.')
            });
        }, 'this user');
    }

    onSearch(val: string) {
        this.params.update(p => ({ ...p, pageNumber: 1, search: val }));
        this.onReloadClick();
    }

    onSortChange(sort: SortOption) {
        this.params.update(p => ({ ...p, pageNumber: 1, sort: sort.value }));
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

    }

    // #endregion
}
