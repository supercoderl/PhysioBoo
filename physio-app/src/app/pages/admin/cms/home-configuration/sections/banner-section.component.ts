import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { HomeConfigBannerDrawerComponent } from "../../../../../components/layout/admin/cms/home-configuration/banner/banner-drawer.component";
import { HomeConfigBannerTableCardComponent } from "../../../../../components/layout/admin/cms/home-configuration/banner/banner-table-card.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSortAdminComponent } from "../../../../../components/table/boo-table-admin/boo-sort-admin.component";
import { HomeBannerService } from "../../../../../services/admin/home-banner.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Banner } from "../../../../../shared/types/banner.types";
import { PaginationData } from "../../../../../shared/types/common";
import { SortOption } from "../../../../../shared/types/sort";

@Component({
    selector: 'home-config-banner-section',
    standalone: true,
    imports: [
        SharedModule,
        ButtonIconComponent,
        BooIconComponent,
        BooInputComponent,
        BooButtonAdminComponent,
        BooSortAdminComponent,
        HomeConfigBannerTableCardComponent,
        HomeConfigBannerDrawerComponent
    ],
    template: `
    <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
      <div class="table-search flex items-center">
        <boo-input label="Search..." size="small" (search)="onSearch($event)">
          <boo-icon
            [class.animate-spin]="loadingSrv.isLoading('search')"
            [name]="loadingSrv.isLoading('search') ? 'loader-circle' : 'search'"
            color="#64748B"
            endfix
          />
        </boo-input>
      </div>

      <div class="flex items-center gap-3">
        <boo-button-admin
          [icon]="{ name: 'refresh-cw', size: 14, color: '#6C7688' }"
          buttonClass="!bg-surface h-full"
          [border]="{ width: 1, color: '#e3e3e3' }"
          (click)="loadBanners()"
        >
          <span class="text-placeholder">Reload</span>
        </boo-button-admin>
        <boo-sort-admin [(value)]="params.sort" (change)="onSortChange($event)" [options]="sort_options" />
        <button-icon buttonClass="!bg-primary text-white" (onClick)="onOpenDrawer(null)">
          Add Banner
        </button-icon>
      </div>
    </div>

    <div class="flex-1 min-h-0">
      <home-config-banner-table-card
        [data]="tableData()"
        (pageChange)="onPageChanged($event)"
        (editClick)="onOpenDrawer($event)"
        (deleteClick)="onDelete($event)"
        [filter]="params"
      />
    </div>

    <home-config-banner-drawer
      [isOpen]="isDrawerOpen"
      [currentId]="selectedId"
      (close)="onCloseDrawer()"
      (saveSuccess)="onSaveSuccess($event)"
      (delete)="onDelete($event)"
    />
    `,
    host: { class: 'block h-full min-h-0' }
})
export class HomeConfigBannerSectionComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Banner> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: '+order',
        filter: {
            active: null as boolean | null
        }
    };
    isDrawerOpen = false;
    selectedId: string | null = null;

    sort_options: SortOption[] = [
        { label: 'Order (Asc)', value: '+order' },
        { label: 'Order (Desc)', value: '-order' },
        { label: 'Title (A-Z)', value: '+title' },
        { label: 'Title (Z-A)', value: '-title' }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private bannerSrv: HomeBannerService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService
    ) { }

    ngOnInit(): void {
        this.loadBanners();
    }
    // #endregion

    // #region Methods
    loadBanners() {
        this.bannerSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: this.params.filter
        }).subscribe(_res => {
            if (_res.success) {
                this.tableData.set(_res.data);
            }
        });
    }

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadBanners();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: Banner) {
        this.onCloseDrawer();
        this.tableData.update((currentData) => {
            if (!currentData) {
                return {
                    items: [result],
                    totalCount: 1,
                    pageNumber: 1,
                    pageSize: this.params.pageSize,
                    totalPages: 1,
                    hasNext: false,
                    hasPrevious: false
                }
            }

            const existingIndex = currentData.items.findIndex(x => x.id === result.id);
            if (existingIndex > -1) {
                const updatedItems = [...currentData.items];
                updatedItems[existingIndex] = result;
                return {
                    ...currentData,
                    items: updatedItems
                };
            }

            return {
                ...currentData,
                totalCount: currentData.totalCount + 1,
                items: [result, ...currentData.items],
                totalPages: Math.ceil((currentData.totalCount + 1) / currentData.pageSize)
            }
        })
    }

    onDelete(id: string | null) {
        if (!id) return;

        this.dialogSrv.confirmDelete(() => {
            const currentData = this.tableData();
            if (!currentData) return;

            const isLastItemOnPage = currentData.items.length === 1;
            const isNotFirstPage = currentData.pageNumber > 1;

            if (isLastItemOnPage && isNotFirstPage) {
                this.toastSrv.success("Deleted 1 item.");
                this.bannerSrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadBanners();
                    },
                    error: () => this.toastSrv.error("System error occurred.")
                });
                this.isDrawerOpen && this.onCloseDrawer();
                return;
            }

            const backupItems = [...currentData.items];
            const backupCount = currentData.totalCount;

            this.tableData.update(data => {
                if (!data) return null;
                return {
                    ...data,
                    items: data.items.filter(item => item.id !== id),
                    totalCount: data.totalCount - 1
                };
            });

            this.toastSrv.success("Deleted 1 item.")
            this.bannerSrv.delete(id)
                .pipe(
                    catchError(_ => {
                        this.toastSrv.error("System error occurred. Rolling back data...");
                        this.tableData.update(data => {
                            if (!data) return null;
                            return { ...data, items: backupItems, totalCount: backupCount };
                        });
                        return of(null);
                    })
                )
                .subscribe({ next: _ => this.isDrawerOpen && this.onCloseDrawer() });
        }, 'this banner')
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadBanners();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadBanners();
    }
    // #endregion
}
