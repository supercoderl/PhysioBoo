import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { finalize } from "rxjs";
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { MenuRowEvent, SuperadminMenuTreeComponent } from "../../../components/layout/superadmin/access/menu-tree.component";
import { SuperadminMenuDrawerComponent } from "../../../components/layout/superadmin/access/menu-drawer.component";
import { SuperadminPageHeaderComponent } from "../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { SuperadminTab, SuperadminTabsComponent } from "../../../components/layout/superadmin/shared/superadmin-tabs.component";
import { ErrorStateComponent } from "../../../components/ui/error-state.component";
import { MenuService } from "../../../services/admin/menu.service";
import { PermissionService } from "../../../services/admin/permission.service";
import { DialogService } from "../../../services/common/dialog.service";
import { ToastService } from "../../../services/common/toast.service";
import { SharedModule } from "../../../shared/shared-imports";
import { MenuItem } from "../../../shared/types/menu.types";
import { Permission } from "../../../shared/types/permission.types";
import { MenuArea, menuAreaOf } from "../../../shared/utils/menu.utils";

/**
 * Platform menu editor. Super Admin rows build this console's sidebar; Admin rows build every tenant's sidebar.
 * A row's area is decided by its root's route prefix (`/superadmin…`).
 */
@Component({
    selector: 'superadmin-menu-management',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        SuperadminPageHeaderComponent,
        SuperadminTabsComponent,
        SuperadminMenuTreeComponent,
        SuperadminMenuDrawerComponent,
        ErrorStateComponent
    ],
    host: { class: 'block h-full min-h-0' },
    template: `
        <div class="h-full flex flex-col gap-5">
            <superadmin-page-header
                title="Menu management"
                description="Build the sidebars. Changes appear for users after their next menu refresh."
            >
                <boo-button-admin
                    [icon]="{ name: 'plus', size: 14 }"
                    textColor="white"
                    (click)="openCreate(null)"
                >
                    New section
                </boo-button-admin>
            </superadmin-page-header>

            <div class="flex-1 min-h-0 flex flex-col">
                <superadmin-tabs
                    label="Menu areas"
                    [tabs]="tabs()"
                    [active]="area()"
                    (activeChange)="onAreaChange($event)"
                />

                <div [id]="'panel-' + area()" role="tabpanel" [attr.aria-labelledby]="'tab-' + area()" class="flex-1 min-h-[320px] pt-4 flex flex-col gap-4">
                    <div
                        *ngIf="area() === 'admin'"
                        role="note"
                        class="flex items-start gap-3 rounded-2 border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
                    >
                        <physio-icon name="triangle-alert" [class]="'shrink-0 mt-0.5'" />
                        <p class="m-0">Admin menu changes affect <strong>every tenant's</strong> sidebar.</p>
                    </div>

                    <div *ngIf="loadFailed()" class="bg-surface rounded-2 border border-borderGray/60" role="alert">
                        <boo-error-state
                            icon="info"
                            title="Couldn't load the menu"
                            description="Check your connection and try again."
                            (retry)="load()"
                        />
                    </div>

                    <div *ngIf="!loadFailed()" class="flex-1 min-h-0" custom-scrollbar>
                        <superadmin-menu-tree
                            [sections]="sections()"
                            [loading]="loading()"
                            (addSection)="openCreate(null)"
                            (addChild)="openCreate($event)"
                            (edit)="openEdit($event)"
                            (remove)="onDelete($event)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <superadmin-menu-drawer
            [isOpen]="isDrawerOpen()"
            [item]="editingItem()"
            [parentId]="drawerParentId()"
            [sections]="sections()"
            [area]="area()"
            [permissions]="permissions()"
            [permissionsFailed]="permissionsFailed()"
            (close)="closeDrawer()"
            (saved)="onSaved()"
        />
    `
})
export class SuperadminMenuManagementComponent implements OnInit {
    // #region Inject Services
    private readonly menuSrv = inject(MenuService);
    private readonly permissionSrv = inject(PermissionService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    // #endregion

    // #region Inputs, Outputs, Properties
    area = signal<MenuArea>('superadmin');
    allRoots = signal<MenuItem[]>([]);
    loading = signal(false);
    loadFailed = signal(false);

    permissions = signal<Permission[]>([]);
    permissionsFailed = signal(false);

    isDrawerOpen = signal(false);
    editingItem = signal<MenuItem | null>(null);
    drawerParentId = signal<string | null>(null);

    sections = computed(() => this.allRoots()
        .filter(root => menuAreaOf(root) === this.area())
        .sort((a, b) => a.order - b.order)
        .map(root => ({ ...root, children: [...(root.children ?? [])].sort((a, b) => a.order - b.order) })));

    tabs = computed<SuperadminTab[]>(() => (['superadmin', 'admin'] as MenuArea[]).map(area => ({
        id: area,
        label: area === 'superadmin' ? 'Super Admin menu' : 'Admin menu',
        count: this.countRows(area)
    })));
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.load();
        this.loadPermissions();
    }
    // #endregion

    // #region Methods
    load(): void {
        this.loading.set(true);
        this.loadFailed.set(false);
        this.menuSrv.search().pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (res.success) this.allRoots.set(res.data?.items ?? []);
                else this.loadFailed.set(true);
            },
            error: () => this.loadFailed.set(true)
        });
    }

    private loadPermissions(): void {
        this.permissionSrv.search({
            pageNumber: 1,
            pageSize: 500,
            search: '',
            sort: '+category',
            filter: { start: '', end: '', category: null, isActive: null }
        }).subscribe({
            next: res => {
                if (res.success) this.permissions.set(res.data?.items ?? []);
                else this.permissionsFailed.set(true);
            },
            error: () => this.permissionsFailed.set(true)
        });
    }

    private countRows(area: MenuArea): number {
        return this.allRoots()
            .filter(root => menuAreaOf(root) === area)
            .reduce((sum, root) => sum + 1 + (root.children?.length ?? 0), 0);
    }

    onAreaChange(id: string): void {
        this.area.set(id as MenuArea);
    }

    /** `section` = the section a new page goes into; `null` creates a new top-level section. */
    openCreate(section: MenuItem | null): void {
        this.editingItem.set(null);
        this.drawerParentId.set(section?.id ?? null);
        this.isDrawerOpen.set(true);
    }

    openEdit(event: MenuRowEvent): void {
        this.editingItem.set(event.item);
        this.drawerParentId.set(event.parent?.id ?? null);
        this.isDrawerOpen.set(true);
    }

    closeDrawer(): void {
        this.isDrawerOpen.set(false);
        this.editingItem.set(null);
        this.drawerParentId.set(null);
    }

    onSaved(): void {
        this.closeDrawer();
        this.load();
        this.refreshSidebar();
    }

    onDelete(event: MenuRowEvent): void {
        const { item } = event;
        const childCount = item.children?.length ?? 0;
        const name = childCount
            ? `"${item.label}" and its ${childCount} page${childCount === 1 ? '' : 's'}`
            : `"${item.label}"`;

        this.dialogSrv.confirmDelete(() => {
            this.menuSrv.delete(item.id).subscribe({
                next: () => {
                    this.toastSrv.success(`Deleted ${item.label}`);
                    this.load();
                    this.refreshSidebar();
                },
                error: () => this.toastSrv.error('Failed to delete the menu item')
            });
        }, name);
    }

    /** Re-reads the caller's own menu so this console's sidebar reflects the change without a re-login. */
    private refreshSidebar(): void {
        this.menuSrv.getMine().subscribe(res => {
            if (res.success) this.menuSrv.publish(res.data);
        });
    }
    // #endregion
}
