import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { CrmCampaignDrawerComponent } from "../../../../components/layout/admin/crm/marketing-campaign/campaign-drawer.component";
import { CrmCampaignKpiStripComponent } from "../../../../components/layout/admin/crm/marketing-campaign/campaign-kpi-strip.component";
import { CrmCampaignTableCardComponent } from "../../../../components/layout/admin/crm/marketing-campaign/campaign-table-card.component";
import { CampaignService } from "../../../../services/admin/campaign.service";
import { DateService } from "../../../../services/common/date.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Campaign, CampaignStats } from "../../../../shared/types/campaign.types";
import { PaginationData } from "../../../../shared/types/common";

@Component({
    selector: 'crm-marketing-campaign-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        CrmCampaignKpiStripComponent,
        CrmCampaignTableCardComponent,
        CrmCampaignDrawerComponent,
    ],
    template: `
        <admin-content-header>
            <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
                <div class="flex-1">
                    <h4 class="text-[22px] text-primary font-semibold mb-0">Marketing Campaigns</h4>
                </div>
                <div class="text-right flex">
                    <button-icon buttonClass="!bg-primary ms-2 text-white" (onClick)="onOpenDrawer(null)">
                        New Campaign
                    </button-icon>
                </div>
            </div>

            <div class="mb-4">
                <crm-campaign-kpi-strip [stats]="stats()" />
            </div>

            <div class="mt-2">
                <crm-campaign-table-card
                    [data]="tableData()"
                    (pageChange)="onPageChanged($event)"
                    (editClick)="onOpenDrawer($event)"
                    (deleteClick)="onDelete($event)"
                    [filter]="params"
                />
            </div>

            <crm-campaign-drawer
                [isOpen]="isDrawerOpen"
                [currentId]="selectedId"
                (close)="onCloseDrawer()"
                (saveSuccess)="onSaveSuccess($event)"
                (delete)="onDelete($event)"
            />
        </admin-content-header>
    `
})
export class CrmMarketingCampaignListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Campaign> | null>(null);
    stats = signal<CampaignStats | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: '-createdDate',
        filter: {
            start: null as Date | null,
            end: null as Date | null,
            type: null as number | null,
            status: null as number | null,
        }
    };
    isDrawerOpen = false;
    selectedId: string | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private campaignSrv: CampaignService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService,
    ) { }

    ngOnInit(): void {
        this.loadCampaigns();
        this.loadStats();
    }
    // #endregion

    // #region Methods
    loadCampaigns() {
        this.campaignSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: {
                ...this.params.filter,
                start: this.dateSrv.format(this.params.filter.start, "YYYY-MM-DD"),
                end: this.dateSrv.format(this.params.filter.end, "YYYY-MM-DD")
            }
        }).subscribe(_res => {
            if (_res.success) this.tableData.set(_res.data);
        });
    }

    loadStats() {
        this.campaignSrv.stats().subscribe(_res => {
            if (_res.success) this.stats.set(_res.data);
        });
    }

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadCampaigns();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: Campaign) {
        this.onCloseDrawer();
        this.tableData.update((currentData) => {
            if (!currentData) {
                return { items: [result], totalCount: 1, pageNumber: 1, pageSize: this.params.pageSize, totalPages: 1, hasNext: false, hasPrevious: false };
            }
            const existingIndex = currentData.items.findIndex(x => x.id === result.id);
            if (existingIndex > -1) {
                const updatedItems = [...currentData.items];
                updatedItems[existingIndex] = result;
                return { ...currentData, items: updatedItems };
            }
            return {
                ...currentData,
                totalCount: currentData.totalCount + 1,
                items: [result, ...currentData.items],
                totalPages: Math.ceil((currentData.totalCount + 1) / currentData.pageSize)
            };
        });
        this.loadStats();
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
                this.campaignSrv.delete(id).subscribe({
                    next: () => { this.params.pageNumber = currentData.pageNumber - 1; this.loadCampaigns(); this.loadStats(); },
                    error: () => this.toastSrv.error("System error occurred.")
                });
                this.isDrawerOpen && this.onCloseDrawer();
                return;
            }

            const backupItems = [...currentData.items];
            const backupCount = currentData.totalCount;

            this.tableData.update(data => data ? { ...data, items: data.items.filter(i => i.id !== id), totalCount: data.totalCount - 1 } : null);
            this.toastSrv.success("Deleted 1 item.");

            this.campaignSrv.delete(id)
                .pipe(catchError(_ => {
                    this.toastSrv.error("System error occurred. Rolling back data...");
                    this.tableData.update(data => data ? { ...data, items: backupItems, totalCount: backupCount } : null);
                    return of(null);
                }))
                .subscribe({ next: _ => { this.isDrawerOpen && this.onCloseDrawer(); this.loadStats(); } });
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadCampaigns();
    }
    // #endregion
}
