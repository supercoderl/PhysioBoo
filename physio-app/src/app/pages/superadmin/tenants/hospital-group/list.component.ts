import { Component, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { CommonCategoryHospitalGroupDrawerComponent } from "../../../../components/layout/admin/system/common-category/hospital-group/hospital-group-drawer.component";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { SuperadminTenantTableCardComponent } from "../../../../components/layout/superadmin/tenants/tenant-table-card.component";
import { BooErrorStateComponent } from '@physioboo/ui';
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { HospitalGroupService } from "../../../../services/admin/hospital-group.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { FilterConfig } from "../../../../shared/types/filter.types";
import { TenantStats } from "../../../../shared/types/platform.types";
import { SortOption } from "../../../../shared/types/sort";
import { HospitalGroup } from "../../../../shared/types/support.types";

@Component({
    selector: 'superadmin-tenant-list',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        SuperadminPageHeaderComponent,
        SuperadminTenantTableCardComponent,
        StatCardComponent,
        BooErrorStateComponent,
        CommonCategoryHospitalGroupDrawerComponent
    ],
    host: { class: 'block h-full min-h-0' },
    template: `
        <div class="h-full flex flex-col gap-5">
            <superadmin-page-header
                title="Hospital groups"
                description="Every tenant on the platform."
            >
                <boo-button-admin
                    [icon]="{ name: 'plus', size: 14 }"
                    textColor="white"
                    (click)="openDrawer(null)"
                >
                    New hospital group
                </boo-button-admin>
            </superadmin-page-header>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ng-container *ngIf="stats() || statsFailed(); else statsPending">
                    <boo-stat-card label="Total tenants" [value]="stats()?.total ?? '—'" icon="ambulance" tone="primary" />
                    <boo-stat-card label="Active" [value]="stats()?.active ?? '—'" icon="circle-check" tone="success" />
                    <boo-stat-card label="Inactive" [value]="stats()?.inactive ?? '—'" icon="shield-check" tone="neutral" />
                </ng-container>
                <ng-template #statsPending>
                    <div
                        *ngFor="let _ of [1, 2, 3]"
                        class="h-[70px] rounded-2 border border-borderGray/60 bg-surface animate-pulse motion-reduce:animate-none"
                        aria-hidden="true"
                    ></div>
                </ng-template>
            </div>

            <div *ngIf="loadFailed(); else tableCard" class="bg-surface rounded-2 border border-borderGray/60" role="alert">
                <boo-error-state
                    icon="info"
                    title="Couldn't load hospital groups"
                    description="Check your connection and try again."
                    (retry)="reload()"
                />
            </div>
            <ng-template #tableCard>
                <div class="flex-1 min-h-[320px]">
                    <superadmin-tenant-table-card
                        [data]="tableData()"
                        [filter]="{ pageNumber: params.pageNumber, pageSize: params.pageSize }"
                        [sortOptions]="sort_options"
                        [currentSort]="params.sort"
                        [filterConfigs]="filter_configs"
                        [currentFilter]="params.filter"
                        [loading]="loading()"
                        (pageChange)="onPageClick($event)"
                        (searchChange)="onSearch($event)"
                        (viewClick)="openDetail($event)"
                        (editClick)="openDrawer($event)"
                        (reloadClick)="reload()"
                        (sortApply)="onSortChange($event)"
                        (filterApply)="onFilterApply($event)"
                    />
                </div>
            </ng-template>
        </div>

        <common-category-hospital-group-drawer
            [isOpen]="isDrawerOpen()"
            [currentId]="selectedId()"
            (close)="closeDrawer()"
            (saveSuccess)="onSaved()"
        />
    `
})
export class SuperadminTenantListComponent implements OnInit {
    // #region Inject Services
    private readonly hospitalGroupSrv = inject(HospitalGroupService);
    private readonly router = inject(Router);
    // #endregion

    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<HospitalGroup> | null>(null);
    loading = signal(false);
    loadFailed = signal(false);
    stats = signal<TenantStats | null>(null);
    statsFailed = signal(false);
    isDrawerOpen = signal(false);
    selectedId = signal<string | null>(null);

    params = {
        pageNumber: 1,
        pageSize: 20,
        search: '',
        sort: '-createdAt',
        filter: {
            isActive: null as boolean | null
        }
    };

    readonly sort_options: SortOption[] = [
        { label: 'Recent', value: '-createdAt' },
        { label: 'Oldest', value: '+createdAt' },
        { label: 'Name (A-Z)', value: '+name' },
        { label: 'Name (Z-A)', value: '-name' },
        { label: 'Code (A-Z)', value: '+code' },
        { label: 'Code (Z-A)', value: '-code' },
    ];

    readonly filter_configs: FilterConfig[] = [
        {
            key: 'isActive',
            label: 'Status',
            type: 'boolean',
            value: null,
            trueLabel: 'Active',
            falseLabel: 'Inactive'
        }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.reload();
    }
    // #endregion

    // #region Methods
    reload() {
        this.loadTenants();
        this.loadStats();
    }

    loadTenants() {
        this.loading.set(true);
        this.loadFailed.set(false);
        this.hospitalGroupSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: { start: '', end: '', isActive: this.params.filter.isActive }
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (res.success) this.tableData.set(res.data);
                else this.loadFailed.set(true);
            },
            error: () => this.loadFailed.set(true)
        });
    }

    loadStats() {
        this.hospitalGroupSrv.getStats().subscribe({
            next: stats => {
                this.statsFailed.set(false);
                this.stats.set(stats);
            },
            error: () => this.statsFailed.set(true)
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadTenants();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadTenants();
    }

    onFilterApply(event: { key: string; value: any }) {
        this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter, [event.key]: event.value } };
        this.loadTenants();
    }

    onPageClick(page: number) {
        this.params.pageNumber = page;
        this.loadTenants();
    }

    openDetail(id: string) {
        this.router.navigate(['/superadmin/tenants/hospital-group', id]);
    }

    openDrawer(id: string | null) {
        this.selectedId.set(id);
        this.isDrawerOpen.set(true);
    }

    closeDrawer() {
        this.isDrawerOpen.set(false);
        this.selectedId.set(null);
    }

    onSaved() {
        this.closeDrawer();
        this.reload();
    }
    // #endregion
}
