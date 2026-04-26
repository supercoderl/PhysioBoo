import { Component, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { SettingAdminMenuDrawerComponent } from "../../../../../components/layout/admin/setting/admin-menu/admin-menu-drawer.component";
import { SettingAdminMenuTreeCardComponent } from "../../../../../components/layout/admin/setting/admin-menu/admin-menu-tree-card.component";
import { MenuService } from "../../../../../services/admin/menu.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MenuItem } from "../../../../../shared/types/menu";

@Component({
    selector: 'setting-admin-menu',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        BooButtonAdminComponent,
        BooInputComponent,
        BooIconComponent,
        SettingAdminMenuTreeCardComponent,
        SettingAdminMenuDrawerComponent
    ],
    templateUrl: './admin-menu.component.html'
})
export class SettingAdminMenuComponent {
    // #region Inputs, Outputs, Properties
    menus = signal<MenuItem[]>([]);
    filteredMenus = signal<MenuItem[]>([]);
    isDrawerOpen = false;
    selectedItem: MenuItem | null = null;
    pendingParentId: string | null = null;
    searchTerm = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private menuSrv: MenuService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService
    ) { }

    ngOnInit(): void {
        this.loadMenus();
    }
    // #endregion

    // #region Methods
    loadMenus() {
        this.menuSrv.search().subscribe(_res => {
            if (_res.success) {
                this.menus.set(_res.data?.items ?? []);
                this.applySearch();
            }
        });
    }

    applySearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredMenus.set(this.menus());
            return;
        }
        this.filteredMenus.set(this.filterTree(this.menus(), term));
    }

    private filterTree(items: MenuItem[], term: string): MenuItem[] {
        return items.reduce<MenuItem[]>((acc, item) => {
            const matchesSelf = item.label.toLowerCase().includes(term) || item.route?.toLowerCase().includes(term);
            const filteredChildren = this.filterTree(item.children ?? [], term);
            if (matchesSelf || filteredChildren.length > 0) {
                acc.push({ ...item, children: filteredChildren });
            }
            return acc;
        }, []);
    }

    onSearch(val: string) {
        this.searchTerm = val;
        this.applySearch();
    }

    onOpenDrawer(item: MenuItem | null, parentId: string | null = null) {
        this.selectedItem = item;
        this.pendingParentId = parentId;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedItem = null;
        this.pendingParentId = null;
    }

    onSaveSuccess(result: MenuItem) {
        this.onCloseDrawer();
        this.loadMenus();
        this.toastSrv.success('Menu item saved successfully.');
    }

    onDelete(id: string) {
        this.dialogSrv.confirmDelete(() => {
            this.menuSrv.delete(id)
                .pipe(
                    catchError(_ => {
                        this.toastSrv.error('System error occurred.');
                        return of(null);
                    })
                )
                .subscribe(_ => {
                    if (_ !== null) {
                        this.toastSrv.success('Item deleted. Please perform a hard refresh (Ctrl + F5) to update the menu.');
                        this.isDrawerOpen && this.onCloseDrawer();
                        this.loadMenus();
                    }
                });
        });
    }

    get flatMenus(): MenuItem[] {
        return this.flattenTree(this.menus());
    }

    private flattenTree(items: MenuItem[]): MenuItem[] {
        return items.reduce<MenuItem[]>((acc, item) => {
            acc.push(item);
            if (item.children?.length) acc.push(...this.flattenTree(item.children));
            return acc;
        }, []);
    }
    // #endregion
}
