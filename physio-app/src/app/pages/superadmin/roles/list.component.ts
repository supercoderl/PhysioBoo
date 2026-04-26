import { Component, OnInit, signal } from "@angular/core";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { BooFilterAdminComponent } from "../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../components/table/boo-table-admin/boo-sort-admin.component";
import { BooActionAdminComponent } from "../../../components/table/boo-table-admin/boo-action-admin.component";
import { RoleService } from "../../../services/admin/role.service";
import { LocalLoadingService } from "../../../services/common/local-loading.service";
import { ToastService } from "../../../services/common/toast.service";
import { SharedModule } from "../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../shared/types/common";
import { FilterConfig } from "../../../shared/types/filter";
import { SortOption } from "../../../shared/types/sort";
import { Role } from "../../../shared/types/role";
import { ColorUtils } from "../../../shared/utils/color.utils";

@Component({
    selector: 'superadmin-role-list',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        BooIconComponent,
        BooInputComponent,
        BooFilterAdminComponent,
        BooSortAdminComponent,
        BooActionAdminComponent
    ],
    templateUrl: './list.component.html'
})
export class SuperadminRoleListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Role> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 20,
        search: '',
        sort: 'createdAt:desc',
        filter: {
            start: '',
            end: '',
            isActive: null as boolean | null,
            isSystemRole: null as boolean | null,
        }
    };

    sort_options: SortOption[] = [
        { label: 'Recent', value: '-createdAt' },
        { label: 'Oldest', value: '+createdAt' },
        { label: 'Name (A-Z)', value: '+name' },
        { label: 'Name (Z-A)', value: '-name' },
    ];

    filter_configs: FilterConfig[] = [
        {
            key: 'isActive',
            label: 'Status',
            type: 'boolean',
            value: null,
            trueLabel: 'Active',
            falseLabel: 'Inactive'
        },
        {
            key: 'isSystemRole',
            label: 'Type',
            type: 'boolean',
            value: null,
            trueLabel: 'System Role',
            falseLabel: 'Custom Role'
        }
    ];

    readonly tableActions: ActionItem[] = [
        { label: 'View', onClick: (item: any) => this.onView(item) }
    ];

    ColorUtils = ColorUtils;

    get totalActive(): number {
        return this.tableData()?.items.filter(r => r.isActive).length ?? 0;
    }

    get totalSystem(): number {
        return this.tableData()?.items.filter(r => r.isSystemRole).length ?? 0;
    }
    // #endregion

    // #region Init
    constructor(
        private roleSrv: RoleService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService
    ) { }

    ngOnInit() {
        this.loadRoles();
    }
    // #endregion

    // #region Methods
    loadRoles() {
        this.roleSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: this.params.filter
        }).subscribe(res => {
            if (res.success) this.tableData.set(res.data);
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadRoles();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadRoles();
    }

    onFilterApply(event: any) {
        this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter, ...event } };
        this.loadRoles();
    }

    onPageClick(page: number) {
        this.params.pageNumber = page;
        this.loadRoles();
    }

    min(a: number, b: number) { return Math.min(a, b); }

    getPages(current: number, total: number): number[] {
        const delta = 2;
        const pages: number[] = [];
        for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) pages.push(i);
        return pages;
    }

    onView(role: Role) {
        this.toastSrv.info(`Role: ${role.name} (${role.code})`);
    }
    // #endregion
}
