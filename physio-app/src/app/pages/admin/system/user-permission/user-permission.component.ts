import { Component, OnInit, computed, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { UserPermissionPermissionDrawerComponent } from "../../../../components/layout/admin/system/user-permission/permission-drawer.component";
import { UserPermissionRoleDrawerComponent } from "../../../../components/layout/admin/system/user-permission/role-drawer.component";
import { UserPermissionUserDrawerComponent } from "../../../../components/layout/admin/system/user-permission/user-drawer.component";
import { PermissionService } from "../../../../services/admin/permission.service";
import { RoleService } from "../../../../services/admin/role.service";
import { UserService } from "../../../../services/admin/user.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { PagedRequest, PaginationData } from "../../../../shared/types/common";
import { User } from "../../../../shared/types/core.types";
import { UserFilter } from "../../../../shared/types/filter.types";
import { Permission } from "../../../../shared/types/permission.types";
import { Role } from "../../../../shared/types/role.types";
import { ColorUtils } from "../../../../shared/utils/color.utils";
import { IconUtils } from "../../../../shared/utils/icon.utils";
import { AdminUserPermissionPermissionTabComponent } from "./user-permission-permission-tab.component";
import { AdminUserPermissionRoleTabComponent } from "./user-permission-role-tab.component";
import { AdminUserPermissionUserTabComponent } from "./user-permission-user-tab.component";

type TabKey = 'users' | 'roles' | 'permissions';

interface TabDef {
    key: TabKey;
    label: string;
    icon: string;
    hint: string;
}

@Component({
    selector: 'admin-user-permission',
    standalone: true,
    imports: [
    SharedModule,
    AdminContentHeaderComponent,
    AdminUserPermissionUserTabComponent,
    AdminUserPermissionRoleTabComponent,
    AdminUserPermissionPermissionTabComponent,
    UserPermissionUserDrawerComponent,
    UserPermissionRoleDrawerComponent,
    UserPermissionPermissionDrawerComponent,
    BooIconComponent
],
    templateUrl: './user-permission.component.html',
    host: { class: 'block h-full min-h-0' }
})
export class AdminUserPermissionComponent implements OnInit {
    // #region Tab & shared state
    readonly tabs: TabDef[] = [
        { key: 'users', label: 'Users', icon: 'users', hint: 'Accounts that can sign in' },
        { key: 'roles', label: 'Roles', icon: 'shield', hint: 'Bundles of permissions' },
        { key: 'permissions', label: 'Permissions', icon: 'key', hint: 'Atomic access rights' },
    ];
    activeTab = signal<TabKey>('users');

    statUsers = computed(() => this.usersData()?.totalCount ?? 0);
    statRoles = computed(() => this.rolesData()?.totalCount ?? 0);
    statPermissions = computed(() => this.permissionsData()?.totalCount ?? 0);

    ColorUtils = ColorUtils;
    IconUtils = IconUtils;
    // #endregion

    // #region Users tab
    usersData = signal<PaginationData<User> | null>(null);
    userParams = signal<PagedRequest<UserFilter>>({
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: '-createdAt',
        filter: {
            isActive: null,
        }
    });

    isUserDrawerOpen = signal(false);
    userForm: FormGroup;
    userRolesDraft = signal<Set<string>>(new Set());
    selectedUserId = signal<string | null>(null);
    selectedUser = signal<User | null>(null);
    // #endregion

    // #region Roles tab
    rolesData = signal<PaginationData<Role> | null>(null);
    roleParams = {
        pageNumber: 1,
        pageSize: 50,
        search: '',
        sort: '+name',
        filter: { start: '', end: '', isActive: null as boolean | null, isSystemRole: null as boolean | null }
    };

    isRoleDrawerOpen = signal(false);
    selectedRoleId = signal<string | null>(null);
    selectedRole = signal<Role | null>(null);
    roleForm: FormGroup;
    rolePermissionsDraft = signal<Set<string>>(new Set());
    // #endregion

    // #region Permissions tab
    permissionsData = signal<PaginationData<Permission> | null>(null);
    permParams = {
        pageNumber: 1,
        pageSize: 200,
        search: '',
        sort: '+category',
        filter: { start: '', end: '', category: null as string | null, isActive: null as boolean | null }
    };

    isPermDrawerOpen = signal(false);
    selectedPermissionId = signal<string | null>(null);
    permForm: FormGroup;

    /** Grouped by category, derived from current permission list. */
    permissionGroups = computed(() => {
        const items = this.permissionsData()?.items ?? [];
        const q = this.permParams.search.toLowerCase().trim();
        const filtered = q
            ? items.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.description ?? '').toLowerCase().includes(q))
            : items;
        const map = new Map<string, Permission[]>();
        for (const p of filtered) {
            const cat = p.category || 'Uncategorized';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(p);
        }
        return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
    });

    permissionCategories = computed(() => {
        const set = new Set<string>();
        for (const p of this.permissionsData()?.items ?? []) set.add(p.category);
        return Array.from(set).sort();
    });

    permsByCategory(category: string): Permission[] {
        return (this.permissionsData()?.items ?? []).filter(p => p.category === category);
    }
    // #endregion

    constructor(
        private fb: FormBuilder,
        private userSrv: UserService,
        private roleSrv: RoleService,
        private permSrv: PermissionService,
        private toastSrv: ToastService,
        private dialogSrv: DialogService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            password: [''],
        });

        this.roleForm = this.fb.group({
            name: ['', [Validators.required]],
            code: ['', [Validators.required]],
            description: [''],
            color: [ColorUtils.roleColors[1].value],
            icon: [IconUtils.roleIcons[0]],
            isSystemRole: [false],
        });

        this.permForm = this.fb.group({
            name: ['', [Validators.required]],
            code: ['', [Validators.required]],
            category: ['', [Validators.required]],
            description: [''],
            isActive: [true],
        });
    }

    ngOnInit(): void {
        this.loadAll();
    }

    private loadAll(): void {
        this.loadUsers();
        this.loadRoles();
        this.loadPermissions();
    }

    // #region Tab navigation
    setTab(key: TabKey): void {
        this.activeTab.set(key);
    }
    // #endregion

    // ────────────────────────────────────────────────────────────
    // Users
    // ────────────────────────────────────────────────────────────
    loadUsers(): void {
        const p = this.userParams();
        this.userSrv.search({
            pageNumber: p.pageNumber,
            pageSize: p.pageSize,
            search: p.search,
            sort: p.sort,
            filter: { ...(p.filter ?? { isActive: null }) },
        }).subscribe(res => {
            if (res.success) this.usersData.set(res.data);
        });
    }
    openNewUser(): void {
        this.selectedUserId.set(null);
        this.selectedUser.set(null);
        this.userRolesDraft.set(new Set());
        this.userForm.reset({ email: '', phone: '', password: '' });
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.isUserDrawerOpen.set(true);
    }

    openEditUser(user: User): void {
        this.selectedUserId.set(user.id);
        this.selectedUser.set(user);
        const roleIds = new Set((user.roles ?? []).map(r => r.id));
        this.userRolesDraft.set(roleIds);
        this.userForm.reset({ email: user.email, phone: user.phone ?? '', password: '' });
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.isUserDrawerOpen.set(true);
    }

    toggleUserRole(roleId: string): void {
        const next = new Set(this.userRolesDraft());
        if (next.has(roleId)) next.delete(roleId);
        else next.add(roleId);
        this.userRolesDraft.set(next);
    }

    isUserRoleSelected(roleId: string): boolean {
        return this.userRolesDraft().has(roleId);
    }

    async saveUser(): Promise<void> {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            this.toastSrv.error('Please complete required fields');
            return;
        }
        const v = this.userForm.getRawValue();
        try {
            let userId: string;
            if (this.selectedUserId()) {
                userId = this.selectedUserId()!;
                await firstValueFrom(this.userSrv.update(userId, { email: v.email, phone: v.phone }));
            } else {
                const res = await firstValueFrom(this.userSrv.register({
                    email: v.email, phone: v.phone, password: v.password
                }));
                if (!res.success || !res.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                userId = res.data;
            }

            // Sync roles — diff between draft and current
            const currentRoleIds = new Set((this.selectedUser()?.roles ?? []).map(r => r.id));
            const draft = this.userRolesDraft();
            const toAdd = [...draft].filter(id => !currentRoleIds.has(id));
            const toRemove = [...currentRoleIds].filter(id => !draft.has(id));
            await Promise.all([
                ...toAdd.map(roleId => firstValueFrom(this.userSrv.assignRole({ userId, roleId }))),
                ...toRemove.map(roleId => firstValueFrom(this.userSrv.removeRole({ userId, roleId }))),
            ]);

            this.toastSrv.success(this.selectedUserId() ? 'User updated' : 'User created');
            this.loadUsers();
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }

    deleteUser(user: User): void {
        this.dialogSrv.confirmDelete(() => {
            this.userSrv.delete(user.id).subscribe({
                next: () => { this.toastSrv.success('User deleted'); this.loadUsers(); },
                error: () => this.toastSrv.error('Failed to delete user'),
            });
        });
    }

    userInitial(user: User): string {
        const e = user.email || '';
        return (e[0] || '?').toUpperCase();
    }

    closeUserDrawer(): void {
        this.isUserDrawerOpen.set(false);
        this.selectedUserId.set(null);
        this.selectedUser.set(null);
    }

    // ────────────────────────────────────────────────────────────
    // Roles
    // ────────────────────────────────────────────────────────────
    loadRoles(): void {
        this.roleSrv.search({
            pageNumber: this.roleParams.pageNumber,
            pageSize: this.roleParams.pageSize,
            search: this.roleParams.search,
            sort: this.roleParams.sort,
            filter: { ...this.roleParams.filter },
        }).subscribe(res => {
            if (res.success) this.rolesData.set(res.data);
        });
    }

    onRoleSearch(value: string): void {
        this.roleParams = { ...this.roleParams, search: value, pageNumber: 1 };
        this.loadRoles();
    }

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
        // Load currently-assigned permissions for the matrix.
        try {
            const res = await firstValueFrom(this.roleSrv.getPermissions(role.id));
            const ids = new Set<string>(res?.data ?? []);
            this.rolePermissionsDraft.set(ids);
        } catch {
            this.rolePermissionsDraft.set(new Set());
        }
        this.isRoleDrawerOpen.set(true);
    }

    togglePermission(permId: string): void {
        const next = new Set(this.rolePermissionsDraft());
        if (next.has(permId)) next.delete(permId);
        else next.add(permId);
        this.rolePermissionsDraft.set(next);
    }

    isPermSelected(permId: string): boolean {
        return this.rolePermissionsDraft().has(permId);
    }

    toggleCategoryAll(category: string, on: boolean): void {
        const next = new Set(this.rolePermissionsDraft());
        for (const p of this.permissionsData()?.items ?? []) {
            if (p.category !== category) continue;
            if (on) next.add(p.id);
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

    closeRoleDrawer(): void {
        this.isRoleDrawerOpen.set(false);
        this.selectedRoleId.set(null);
        this.selectedRole.set(null);
    }

    deleteRole(role: Role): void {
        if (role.isSystemRole) {
            this.toastSrv.error('System roles cannot be deleted');
            return;
        }
        this.dialogSrv.confirmDelete(() => {
            this.roleSrv.delete(role.id).subscribe({
                next: () => { this.toastSrv.success('Role deleted'); this.loadRoles(); },
                error: () => this.toastSrv.error('Failed to delete role'),
            });
        });
    }

    selectRoleIcon(icon: string): void { this.roleForm.patchValue({ icon }); }
    selectRoleColor(color: string): void { this.roleForm.patchValue({ color }); }

    // ────────────────────────────────────────────────────────────
    // Permissions
    // ────────────────────────────────────────────────────────────
    loadPermissions(): void {
        this.permSrv.search({
            pageNumber: this.permParams.pageNumber,
            pageSize: this.permParams.pageSize,
            search: this.permParams.search,
            sort: this.permParams.sort,
            filter: { ...this.permParams.filter },
        }).subscribe(res => {
            if (res.success) this.permissionsData.set(res.data);
        });
    }

    onPermSearch(value: string): void {
        this.permParams.search = value;
        // Re-derive groups via signal recomputation
        this.permissionsData.set(this.permissionsData());
    }

    openNewPermission(): void {
        this.selectedPermissionId.set(null);
        this.permForm.reset({ name: '', code: '', category: '', description: '', isActive: true });
        this.isPermDrawerOpen.set(true);
    }

    openEditPermission(p: Permission): void {
        this.selectedPermissionId.set(p.id);
        this.permForm.reset({
            name: p.name,
            code: p.code,
            category: p.category,
            description: p.description ?? '',
            isActive: p.isActive,
        });
        this.isPermDrawerOpen.set(true);
    }

    async savePermission(): Promise<void> {
        if (this.permForm.invalid) {
            this.permForm.markAllAsTouched();
            this.toastSrv.error('Please complete required fields');
            return;
        }
        const v = this.permForm.getRawValue();
        try {
            if (this.selectedPermissionId()) {
                await firstValueFrom(this.permSrv.update(this.selectedPermissionId()!, v));
            } else {
                await firstValueFrom(this.permSrv.create({ id: this.genId(), ...v }));
            }
            this.toastSrv.success(this.selectedPermissionId() ? 'Permission updated' : 'Permission created');
            this.closePermDrawer();
            this.loadPermissions();
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }

    closePermDrawer(): void {
        this.isPermDrawerOpen.set(false);
        this.selectedPermissionId.set(null);
    }

    deletePermission(p: Permission): void {
        this.dialogSrv.confirmDelete(() => {
            this.permSrv.delete(p.id).subscribe({
                next: () => { this.toastSrv.success('Permission deleted'); this.loadPermissions(); },
                error: () => this.toastSrv.error('Failed to delete permission'),
            });
        });
    }

    // ────────────────────────────────────────────────────────────
    // Utils
    // ────────────────────────────────────────────────────────────
    private genId(): string {
        return typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
}
