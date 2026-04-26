import { Component, OnInit, signal } from "@angular/core";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { BooActionAdminComponent } from "../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooDateAdminComponent } from "../../../components/table/boo-table-admin/boo-date-admin.component";
import { BooFilterAdminComponent } from "../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../components/table/boo-table-admin/boo-sort-admin.component";
import { UserService } from "../../../services/admin/user.service";
import { DateService } from "../../../services/common/date.service";
import { DialogService } from "../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../services/common/local-loading.service";
import { ToastService } from "../../../services/common/toast.service";
import { SharedModule } from "../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../shared/types/common";
import { User } from "../../../shared/types/core";
import { DateRange } from "../../../shared/types/date";
import { FilterConfig } from "../../../shared/types/filter";
import { SortOption } from "../../../shared/types/sort";

@Component({
    selector: 'superadmin-user-list',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        BooIconComponent,
        BooInputComponent,
        BooSortAdminComponent,
        BooFilterAdminComponent,
        BooDateAdminComponent,
        BooActionAdminComponent
    ],
    templateUrl: './list.component.html'
})
export class SuperadminUserListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<User> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 20,
        search: '',
        sort: 'createdAt:desc',
        filter: {
            start: null as Date | null,
            end: null as Date | null,
            isActive: null as boolean | null,
        }
    };

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

    readonly tableActions: ActionItem[] = [
        { label: 'View', onClick: (item: any) => this.onViewUser(item) }
    ];

    get totalActive(): number {
        return this.tableData()?.items.filter(u => u.isActive).length ?? 0;
    }

    get totalVerified(): number {
        return this.tableData()?.items.filter(u => u.isVerified).length ?? 0;
    }
    // #endregion

    // #region Init
    constructor(
        private userSrv: UserService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService
    ) { }

    ngOnInit() {
        this.loadUsers();
    }
    // #endregion

    // #region Methods
    loadUsers() {
        this.userSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: {
                ...this.params.filter,
                start: this.dateSrv.format(this.params.filter.start, "YYYY-MM-DD"),
                end: this.dateSrv.format(this.params.filter.end, "YYYY-MM-DD")
            }
        }).subscribe(res => {
            if (res.success) this.tableData.set(res.data);
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadUsers();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadUsers();
    }

    onFilterApply(event: any) {
        this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter, ...event } };
        this.loadUsers();
    }

    onDateChange(range: DateRange) {
        this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter, start: range.start, end: range.end } };
        this.loadUsers();
    }

    onPageClick(page: number) {
        this.params.pageNumber = page;
        this.loadUsers();
    }

    min(a: number, b: number) { return Math.min(a, b); }

    getPages(current: number, total: number): number[] {
        const delta = 2;
        const pages: number[] = [];
        for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) pages.push(i);
        return pages;
    }

    onViewUser(user: User) {
        this.toastSrv.info(`User: ${user.email}`);
    }
    // #endregion
}
