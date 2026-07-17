import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { UserPermissionUserDrawerComponent } from "../../../components/layout/admin/system/user-permission/user-drawer.component";
import { SuperadminUserTableCardComponent } from "../../../components/layout/superadmin/users/user-table-card.component";
import { BooActionAdminComponent } from "../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooDateAdminComponent } from "../../../components/table/boo-table-admin/boo-date-admin.component";
import { BooFilterAdminComponent } from "../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../components/table/boo-table-admin/boo-sort-admin.component";
import { RoleService } from "../../../services/admin/role.service";
import { UserService } from "../../../services/admin/user.service";
import { DateService } from "../../../services/common/date.service";
import { DialogService } from "../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../services/common/local-loading.service";
import { ToastService } from "../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../shared/constants/error.constant";
import { SharedModule } from "../../../shared/shared-imports";
import { PaginationData } from "../../../shared/types/common";
import { User } from "../../../shared/types/core.types";
import { DateRange } from "../../../shared/types/date.types";
import { FilterConfig } from "../../../shared/types/filter.types";
import { Role } from "../../../shared/types/role.types";
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
        BooActionAdminComponent,
        SuperadminUserTableCardComponent,
        UserPermissionUserDrawerComponent
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

    get totalActive(): number {
        return this.tableData()?.items.filter(u => u.isActive).length ?? 0;
    }

    get totalVerified(): number {
        return this.tableData()?.items.filter(u => u.isVerified).length ?? 0;
    }

    rolesData = signal<PaginationData<Role> | null>(null);
    isDrawerOpen = signal(false);
    selectedUserId = signal<string | null>(null);
    selectedUser = signal<User | null>(null);
    userRolesDraft = signal<Set<string>>(new Set());
    userForm: FormGroup;
    // #endregion

    // #region Init
    constructor(
        private fb: FormBuilder,
        private userSrv: UserService,
        private roleSrv: RoleService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService
    ) {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
        });
    }

    ngOnInit() {
        this.loadUsers();
        this.loadRoles();
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
                ...this.params.filter
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

    onFilterApply(event: { key: string; value: any }) {
        this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter, [event.key]: event.value } };
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

    loadRoles() {
        this.roleSrv.search({
            pageNumber: 1,
            pageSize: 100,
            search: '',
            sort: '+name',
            filter: {
                isActive: null, 
                isSystemRole: null,
                start: "",
                end: ""
            }
        }).subscribe(res => {
            if (res.success) this.rolesData.set(res.data);
        });
    }

    onEditUser(id: string) {
        const user = this.tableData()?.items.find(u => u.id === id);
        if (!user) return;

        this.selectedUserId.set(user.id);
        this.selectedUser.set(user);
        this.userRolesDraft.set(new Set((user.roles ?? []).map(r => r.id)));
        this.userForm.reset({ email: user.email, phone: user.phone ?? '' });
        this.isDrawerOpen.set(true);
    }

    closeDrawer() {
        this.isDrawerOpen.set(false);
        this.selectedUserId.set(null);
        this.selectedUser.set(null);
    }

    toggleUserRole(roleId: string) {
        const next = new Set(this.userRolesDraft());
        if (next.has(roleId)) next.delete(roleId);
        else next.add(roleId);
        this.userRolesDraft.set(next);
    }

    isUserRoleSelected(roleId: string): boolean {
        return this.userRolesDraft().has(roleId);
    }

    async saveUser() {
        const userId = this.selectedUserId();
        if (!userId || this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            this.toastSrv.error('Please complete required fields');
            return;
        }

        const v = this.userForm.getRawValue();
        try {
            await firstValueFrom(this.userSrv.update(userId, { email: v.email, phone: v.phone }));

            const currentRoleIds = new Set((this.selectedUser()?.roles ?? []).map(r => r.id));
            const draft = this.userRolesDraft();
            const toAdd = [...draft].filter(id => !currentRoleIds.has(id));
            const toRemove = [...currentRoleIds].filter(id => !draft.has(id));
            await Promise.all([
                ...toAdd.map(roleId => firstValueFrom(this.userSrv.assignRole({ userId, roleId }))),
                ...toRemove.map(roleId => firstValueFrom(this.userSrv.removeRole({ userId, roleId }))),
            ]);

            this.toastSrv.success('User updated');
            this.loadUsers();
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }

    onDeleteUser(id: string) {
        this.dialogSrv.confirmDelete(() => {
            this.userSrv.delete(id).subscribe({
                next: () => {
                    this.toastSrv.success('User deleted');
                    if (this.selectedUserId() === id) this.closeDrawer();
                    this.loadUsers();
                },
                error: () => this.toastSrv.error('Failed to delete user')
            });
        });
    }
    // #endregion
}
