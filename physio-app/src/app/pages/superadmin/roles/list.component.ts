import { Component, OnInit, computed, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { UserPermissionRoleDrawerComponent } from "../../../components/layout/admin/system/user-permission/role-drawer.component";
import { BooActionAdminComponent } from "../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooFilterAdminComponent } from "../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../components/table/boo-table-admin/boo-sort-admin.component";
import { PermissionService } from "../../../services/admin/permission.service";
import { RoleService } from "../../../services/admin/role.service";
import { DialogService } from "../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../services/common/local-loading.service";
import { ToastService } from "../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../shared/constants/error.constant";
import { SharedModule } from "../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../shared/types/common";
import { FilterConfig } from "../../../shared/types/filter.types";
import { Permission } from "../../../shared/types/permission.types";
import { Role } from "../../../shared/types/role.types";
import { SortOption } from "../../../shared/types/sort";
import { ColorUtils } from "../../../shared/utils/color.utils";
import { IconUtils } from "../../../shared/utils/icon.utils";

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
        BooActionAdminComponent,
        UserPermissionRoleDrawerComponent
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
        { label: 'Edit', onClick: (item: any) => this.openEditRole(item) },
        { label: 'Delete', isDanger: true, onClick: (item: any) => this.deleteRole(item) }
    ];

    ColorUtils = ColorUtils;
    IconUtils = IconUtils;

    get totalActive(): number {
        return this.tableData()?.items.filter(r => r.isActive).length ?? 0;
    }

    get totalSystem(): number {
        return this.tableData()?.items.filter(r => r.isSystemRole).length ?? 0;
    }

    // Drawer state
    permissionsData = signal<PaginationData<Permission> | null>(null);
    isRoleDrawerOpen = signal(false);
    selectedRoleId = signal<string | null>(null);
    selectedRole = signal<Role | null>(null);
    rolePermissionsDraft = signal<Set<string>>(new Set());
    roleForm: FormGroup;

    permissionCategories = computed(() => {
        const set = new Set<string>();
        for (const p of this.permissionsData()?.items ?? []) set.add(p.category);
        return Array.from(set).sort();
    });
    // #endregion

    // #region Init
    constructor(
        private fb: FormBuilder,
        private roleSrv: RoleService,
        private permSrv: PermissionService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.roleForm = this.fb.group({
            name: ['', [Validators.required]],
            code: ['', [Validators.required]],
            description: [''],
            color: [ColorUtils.roleColors[1].value],
            icon: [IconUtils.roleIcons[0]],
            isSystemRole: [false],
        });
    }

    ngOnInit() {
        this.loadRoles();
        this.loadPermissions();
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

    loadPermissions() {
        this.permSrv.search({
            pageNumber: 1,
            pageSize: 200,
            search: '',
            sort: '+category',
            filter: { start: '', end: '', category: null, isActive: null }
        }).subscribe(res => {
            if (res.success) this.permissionsData.set(res.data);
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

    permsByCategory(category: string): Permission[] {
        return (this.permissionsData()?.items ?? []).filter(p => p.category === category);
    }

    isPermSelected(permId: string): boolean {
        return this.rolePermissionsDraft().has(permId);
    }

    togglePermission(permId: string): void {
        const next = new Set(this.rolePermissionsDraft());
        if (next.has(permId)) next.delete(permId);
        else next.add(permId);
        this.rolePermissionsDraft.set(next);
    }

    toggleCategoryAll(event: { category: string; on: boolean }): void {
        const next = new Set(this.rolePermissionsDraft());
        for (const p of this.permissionsData()?.items ?? []) {
            if (p.category !== event.category) continue;
            if (event.on) next.add(p.id);
            else next.delete(p.id);
        }
        this.rolePermissionsDraft.set(next);
    }

    categoryAllSelected(category: string): boolean {
        const items = (this.permissionsData()?.items ?? []).filter(p => p.category === category);
        if (!items.length) return false;
        const draft = this.rolePermissionsDraft();
        return items.every(p => draft.has(p.id));
    }

    selectRoleColor(color: string): void { this.roleForm.patchValue({ color }); }
    selectRoleIcon(icon: string): void { this.roleForm.patchValue({ icon }); }

    openNewRole(): void {
        this.selectedRoleId.set(null);
        this.selectedRole.set(null);
        this.rolePermissionsDraft.set(new Set());
        this.roleForm.reset({
            name: '', code: '', description: '',
            color: ColorUtils.roleColors[1].value,
            icon: IconUtils.roleIcons[0],
            isSystemRole: false
        });
        this.isRoleDrawerOpen.set(true);
    }

    async openEditRole(role: Role): Promise<void> {
        this.selectedRoleId.set(role.id);
        this.selectedRole.set(role);
        this.roleForm.reset({
            name: role.name,
            code: role.code,
            description: role.description ?? '',
            color: role.color ?? ColorUtils.roleColors[1].value,
            icon: role.icon ?? IconUtils.roleIcons[0],
            isSystemRole: role.isSystemRole,
        });
        try {
            const res = await firstValueFrom(this.roleSrv.getPermissions(role.id));
            this.rolePermissionsDraft.set(new Set(res?.data ?? []));
        } catch {
            this.rolePermissionsDraft.set(new Set());
        }
        this.isRoleDrawerOpen.set(true);
    }

    closeRoleDrawer(): void {
        this.isRoleDrawerOpen.set(false);
        this.selectedRoleId.set(null);
        this.selectedRole.set(null);
    }

    async saveRole(): Promise<void> {
        if (this.roleForm.invalid) {
            this.roleForm.markAllAsTouched();
            this.toastSrv.error('Please complete required fields');
            return;
        }
        const v = this.roleForm.getRawValue();
        try {
            let roleId = this.selectedRoleId();
            if (roleId) {
                await firstValueFrom(this.roleSrv.update(roleId, v));
            } else {
                roleId = this.genId();
                await firstValueFrom(this.roleSrv.create({ id: roleId, ...v }));
            }

            const currentIds = await this.fetchRolePermissionIds(roleId);
            const draft = this.rolePermissionsDraft();
            const toAdd = [...draft].filter(id => !currentIds.has(id));
            const toRemove = [...currentIds].filter(id => !draft.has(id));
            await Promise.all([
                ...toAdd.map(permissionId => firstValueFrom(this.roleSrv.assignPermission({ roleId: roleId!, permissionId }))),
                ...toRemove.map(permissionId => firstValueFrom(this.roleSrv.removePermission({ roleId: roleId!, permissionId }))),
            ]);

            this.toastSrv.success(this.selectedRoleId() ? 'Role updated' : 'Role created');
            this.closeRoleDrawer();
            this.loadRoles();
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }

    private async fetchRolePermissionIds(roleId: string): Promise<Set<string>> {
        if (!this.selectedRoleId()) return new Set();
        try {
            const res = await firstValueFrom(this.roleSrv.getPermissions(roleId));
            return new Set(res?.data ?? []);
        } catch {
            return new Set();
        }
    }

    deleteRole(role: Role): void {
        if (role.isSystemRole) {
            this.toastSrv.error('System roles cannot be deleted');
            return;
        }
        this.dialogSrv.confirmDelete(() => {
            this.roleSrv.delete(role.id).subscribe({
                next: () => {
                    this.toastSrv.success('Role deleted');
                    if (this.selectedRoleId() === role.id) this.closeRoleDrawer();
                    this.loadRoles();
                },
                error: () => this.toastSrv.error('Failed to delete role')
            });
        });
    }

    private genId(): string {
        return typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    // #endregion
}
