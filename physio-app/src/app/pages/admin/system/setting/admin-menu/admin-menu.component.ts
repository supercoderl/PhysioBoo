import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { BooSearchFieldComponent } from '@physioboo/ui';
import { finalize } from "rxjs";
import { CategoryFilterChip, CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { SuperadminMenuDrawerComponent } from "../../../../../components/layout/superadmin/access/menu-drawer.component";
import { MenuRowEvent, SuperadminMenuTreeComponent } from "../../../../../components/layout/superadmin/access/menu-tree.component";
import { MenuService } from "../../../../../services/admin/menu.service";
import { PermissionService } from "../../../../../services/admin/permission.service";
import { AuthService } from "../../../../../services/auth/auth.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MenuItem } from "../../../../../shared/types/menu.types";
import { Permission } from "../../../../../shared/types/permission.types";
import { menuAreaOf, menuPermissionOf } from "../../../../../shared/utils/menu.utils";

/**
 * Settings > Admin Menu: the sections and pages of the admin sidebar (/api/admin-menus), two levels deep, each with
 * an icon, route, display order, required permission and active flag. The rows are shared by every tenant; Super
 * Admin rows (routes under /superadmin) are managed in the Super Admin console and are not listed here.
 * The tree and drawer are the Super Admin menu editor's, opened on the admin area.
 */
@Component({
    selector: 'setting-admin-menu',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        SuperadminMenuTreeComponent,
        SuperadminMenuDrawerComponent,
        BooSearchFieldComponent
    ],
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' },
    template: `
        <common-category-page
            heading="Admin Menu"
            description="Sections and pages of the admin sidebar"
            plural="menu items"
            createLabel="New section"
            [countLabel]="countLabel()"
            [canCreate]="canCreate"
            [chips]="chips()"
            [loading]="loading()"
            [loadFailed]="loadFailed()"
            [hasData]="loaded()"
            (create)="openCreate(null)"
            (removeChip)="onSearchClear()"
            (clearFilters)="onSearchClear()"
            (retry)="load()"
        >
            <div class="flex flex-1 min-h-0 min-w-0 flex-col gap-3">
                <div class="shrink-0 flex flex-wrap items-center justify-between gap-3">
                    <boo-search-field
                        class="w-full sm:w-72"
                        size="small"
                        label="Search menu items"
                        placeholder="Search by label or route"
                        [ngModel]="search()"
                        (ngModelChange)="search.set($event)"
                        (clear)="onSearchClear()"
                    />
                    <p class="m-0 flex items-center gap-2 text-xs text-amber-800" role="note">
                        <physio-icon name="triangle-alert" [size]="14" class="shrink-0" aria-hidden="true" />
                        Changes apply to every clinic’s admin sidebar.
                    </p>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto boo-scrollbar" aria-label="Menu structure">
                    <div *ngIf="search() && !loading() && !visibleSections().length; else tree" class="bg-surface rounded-2 border border-borderGray/60 py-12 text-center text-sm text-secondary" role="status">
                        No menu items match “{{ search() }}”.
                    </div>
                    <ng-template #tree>
                        <superadmin-menu-tree
                            [sections]="visibleSections()"
                            [loading]="loading() && !loaded()"
                            [canCreate]="canCreate"
                            [canUpdate]="canUpdate"
                            [canDelete]="canDelete"
                            [expandAll]="!!search()"
                            (addSection)="openCreate(null)"
                            (addChild)="openCreate($event)"
                            (edit)="openEdit($event)"
                            (remove)="onDelete($event)"
                        />
                    </ng-template>
                </div>
            </div>
        </common-category-page>

        <superadmin-menu-drawer
            [isOpen]="isDrawerOpen()"
            [item]="editingItem()"
            [parentId]="drawerParentId()"
            [sections]="sections()"
            [area]="'admin'"
            [permissions]="permissions()"
            [permissionsFailed]="permissionsFailed()"
            (close)="closeDrawer()"
            (saved)="onSaved()"
        />
    `
})
export class SettingAdminMenuComponent implements OnInit {
    // #region Inject Services
    private readonly menuSrv = inject(MenuService);
    private readonly permissionSrv = inject(PermissionService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly canCreate = this.authSrv.hasPermission(Permissions.Admin.AdminMenuCreate);
    readonly canUpdate = this.authSrv.hasPermission(Permissions.Admin.AdminMenuUpdate);
    readonly canDelete = this.authSrv.hasPermission(Permissions.Admin.AdminMenuDelete);

    readonly roots = signal<MenuItem[]>([]);
    readonly loading = signal(true);
    readonly loaded = signal(false);
    readonly loadFailed = signal(false);
    readonly search = signal('');

    readonly permissions = signal<Permission[]>([]);
    readonly permissionsFailed = signal(false);

    readonly isDrawerOpen = signal(false);
    readonly editingItem = signal<MenuItem | null>(null);
    readonly drawerParentId = signal<string | null>(null);

    /** Admin-area sections in display order, each with its pages in order. */
    readonly sections = computed(() => this.roots()
        .filter(root => menuAreaOf(root) === 'admin')
        .sort((a, b) => a.order - b.order)
        .map(root => ({ ...root, children: [...(root.children ?? [])].sort((a, b) => a.order - b.order) })));

    /** A section stays when it or one of its pages matches; a matching section keeps all its pages. */
    readonly visibleSections = computed(() => {
        const term = this.search().trim().toLowerCase();
        if (!term) return this.sections();
        const matches = (m: MenuItem) => [m.label, m.route, menuPermissionOf(m)].some(v => (v ?? '').toLowerCase().includes(term));
        return this.sections().reduce<MenuItem[]>((acc, section) => {
            if (matches(section)) acc.push(section);
            else {
                const children = (section.children ?? []).filter(matches);
                if (children.length) acc.push({ ...section, children });
            }
            return acc;
        }, []);
    });

    readonly countLabel = computed(() => {
        if (!this.loaded()) return '';
        const sections = this.sections();
        const pages = sections.reduce((sum, s) => sum + (s.children?.length ?? 0), 0);
        return `${sections.length} section${sections.length === 1 ? '' : 's'}, ${pages} page${pages === 1 ? '' : 's'}`;
    });

    readonly chips = computed<CategoryFilterChip[]>(() => this.search().trim()
        ? [{ key: 'search', label: `“${this.search().trim()}”` }]
        : []);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.load();
        if (this.canCreate || this.canUpdate) this.loadPermissions();
    }
    // #endregion

    // #region Methods
    load(): void {
        this.loading.set(true);
        this.loadFailed.set(false);
        this.menuSrv.search()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: res => {
                    if (!res.success) { this.loadFailed.set(true); return; }
                    this.roots.set(res.data?.items ?? []);
                    this.loaded.set(true);
                },
                // The interceptor reports the reason; the last tree stays on screen with a retry.
                error: () => this.loadFailed.set(true)
            });
    }

    /** Feeds the drawer's permission picker; without it the drawer falls back to typing the code. */
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

    onSearchClear(): void {
        this.search.set('');
    }

    /** `section` = the section a new page goes into; `null` creates a new top-level section. */
    openCreate(section: MenuItem | null): void {
        if (!this.canCreate) return;
        this.editingItem.set(null);
        this.drawerParentId.set(section?.id ?? null);
        this.isDrawerOpen.set(true);
    }

    /** The detail endpoint returns no parent id, so the parent comes from the tree; saving keeps the row where it is. */
    openEdit(event: MenuRowEvent): void {
        if (!this.canUpdate) return;
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
        if (!this.canDelete) return;
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
                error: () => undefined
            });
        }, name);
    }

    /** Re-reads the signed-in user's own menu so this sidebar shows the change without a reload. */
    private refreshSidebar(): void {
        this.menuSrv.getMine().subscribe({
            next: res => { if (res.success) this.menuSrv.publish(res.data); },
            error: () => undefined
        });
    }
    // #endregion
}
