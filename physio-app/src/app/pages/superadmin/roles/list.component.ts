import { Component, OnInit, computed, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { UserPermissionRoleDrawerComponent } from "../../../components/layout/admin/system/user-permission/role-drawer.component";
import { SuperadminPageHeaderComponent } from "../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { EmptyStateComponent } from "../../../components/ui/empty-state.component";
import { StatCardComponent } from "../../../components/ui/stat-card.component";
import { StatusBadgeComponent } from "../../../components/ui/status-badge.component";
import { BooActionAdminComponent } from "../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooFilterAdminComponent } from "../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../components/table/boo-table-admin/boo-sort-admin.component";
import { PermissionService } from "../../../services/admin/permission.service";
import { RoleService } from "../../../services/admin/role.service";
import { DialogService } from "../../../services/common/dialog.service";
import { ToastService } from "../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../shared/constants/error.constant";
import { SharedModule } from "../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../shared/types/common";
import { FilterConfig } from "../../../shared/types/filter.types";
import { Permission } from "../../../shared/types/permission.types";
import { RoleStats } from "../../../shared/types/platform.types";
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
        BooInputComponent,
        BooFilterAdminComponent,
        BooSortAdminComponent,
        BooActionAdminComponent,
        SuperadminPageHeaderComponent,
        StatCardComponent,
        StatusBadgeComponent,
        EmptyStateComponent,
        UserPermissionRoleDrawerComponent
    ],
    templateUrl: './list.component.html',
    host: { class: 'block h-full min-h-0' }
})
export class SuperadminRoleListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    /** The roles API ignores search, sort and the system-role filter, and the role set is small, so the page filters locally. */
    private readonly pageSize = 20;
    private readonly allRoles = signal<Role[]>([]);
    loading = signal(true);
    loaded = signal(false);
    statsFailed = signal(false);
    query = signal({
        search: '',
        sort: '-createdAt',
        pageNumber: 1,
        filter: { isActive: null as boolean | null, isSystemRole: null as boolean | null }
    });

    private readonly filteredRoles = computed(() => {
        const { search, sort, filter } = this.query();
        const term = search.trim().toLowerCase();
        const dir = sort.startsWith('-') ? -1 : 1;
        const field = sort.slice(1);
        return this.allRoles()
            .filter(r => filter.isActive === null || r.isActive === filter.isActive)
            .filter(r => filter.isSystemRole === null || r.isSystemRole === filter.isSystemRole)
            .filter(r => !term || [r.name, r.code, r.description].some(v => v?.toLowerCase().includes(term)))
            .sort((a, b) => dir * (field === 'name'
                ? a.name.localeCompare(b.name)
                : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    });

    tableData = computed<PaginationData<Role> | null>(() => {
        if (!this.loaded()) return null;
        const all = this.filteredRoles();
        const totalPages = Math.max(1, Math.ceil(all.length / this.pageSize));
        const pageNumber = Math.min(this.query().pageNumber, totalPages);
        return {
            items: all.slice((pageNumber - 1) * this.pageSize, pageNumber * this.pageSize),
            pageNumber,
            pageSize: this.pageSize,
            totalCount: all.length,
            totalPages,
            hasPrevious: pageNumber > 1,
            hasNext: pageNumber < totalPages
        };
    });

    stats = computed<RoleStats | null>(() => {
        if (!this.loaded()) return null;
        const roles = this.allRoles();
        return {
            total: roles.length,
            active: roles.filter(r => r.isActive).length,
            system: roles.filter(r => r.isSystemRole).length
        };
    });

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
        private toastSrv: ToastService
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
    reload() {
        this.loadRoles();
    }

    loadRoles() {
        this.loading.set(true);
        this.roleSrv.search({
            pageNumber: 1,
            pageSize: 200,
            search: '',
            sort: '-createdAt',
            filter: { start: '', end: '', isActive: null, isSystemRole: null }
        }).pipe(finalize(() => this.loading.set(false))).subscribe({
            next: res => {
                if (!res.success) return this.statsFailed.set(true);
                this.statsFailed.set(false);
                this.allRoles.set(res.data.items);
                this.loaded.set(true);
            },
            error: () => this.statsFailed.set(true)
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
        this.query.update(q => ({ ...q, pageNumber: 1, search: val }));
    }

    onSortChange(sort: SortOption) {
        this.query.update(q => ({ ...q, pageNumber: 1, sort: sort.value }));
    }

    /** Replaces (not merges) the filter, so "Reset All" clears the previous values. */
    onFilterApply(event: { isActive?: boolean; isSystemRole?: boolean }) {
        this.query.update(q => ({
            ...q,
            pageNumber: 1,
            filter: { isActive: event.isActive ?? null, isSystemRole: event.isSystemRole ?? null }
        }));
    }

    onPageClick(page: number) {
        this.query.update(q => ({ ...q, pageNumber: page }));
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
            this.reload();
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
                    this.reload();
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
