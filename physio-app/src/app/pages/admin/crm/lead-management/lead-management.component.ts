import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { CrmLeadDrawerComponent } from "../../../../components/layout/admin/crm/lead/lead-drawer.component";
import { CrmLeadKpiStripComponent } from "../../../../components/layout/admin/crm/lead/lead-kpi-strip.component";
import { CrmLeadTableCardComponent } from "../../../../components/layout/admin/crm/lead/lead-table-card.component";
import { LeadService } from "../../../../services/admin/lead.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { Lead, LeadStats } from "../../../../shared/types/lead.types";

@Component({
    selector: 'admin-lead-management',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        CrmLeadKpiStripComponent,
        CrmLeadTableCardComponent,
        CrmLeadDrawerComponent,
    ],
    template: `
        <admin-content-header>
            <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
                <div class="flex-1">
                    <h4 class="text-[22px] text-primary font-semibold mb-0">Lead Management</h4>
                </div>
                <div class="text-right flex">
                    <button-icon buttonClass="!bg-primary ms-2 text-white" (onClick)="onOpenDrawer(null)">
                        New Lead
                    </button-icon>
                </div>
            </div>

            <div class="mb-4">
                <crm-lead-kpi-strip [stats]="stats()" />
            </div>

            <div class="mt-2">
                <crm-lead-table-card
                    [data]="tableData()"
                    (pageChange)="onPageChanged($event)"
                    (editClick)="onOpenDrawer($event)"
                    (deleteClick)="onDelete($event)"
                    [filter]="params"
                />
            </div>

            <crm-lead-drawer
                [isOpen]="isDrawerOpen"
                [currentId]="selectedId"
                (close)="onCloseDrawer()"
                (saveSuccess)="onSaveSuccess($event)"
                (delete)="onDelete($event)"
            />
        </admin-content-header>
    `
})
export class AdminLeadManagementComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Lead> | null>(null);
    stats = signal<LeadStats | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: '-createdAt',
        filter: {
            start: null as string | null,
            end: null as string | null,
            status: null as number | null,
            priority: null as number | null,
        }
    };
    isDrawerOpen = false;
    selectedId: string | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private leadSrv: LeadService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
    ) { }

    ngOnInit(): void {
        this.loadLeads();
        this.loadStats();
    }
    // #endregion

    // #region Methods
    loadLeads() {
        this.leadSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: this.params.filter
        }).subscribe(res => {
            if (res.success) this.tableData.set(res.data);
        });
    }

    loadStats() {
        this.leadSrv.stats().subscribe(res => {
            if (res.success) this.stats.set(res.data);
        });
    }

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadLeads();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: Lead) {
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
                this.leadSrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadLeads();
                        this.loadStats();
                        this.toastSrv.success('Deleted 1 lead.');
                    },
                    error: () => this.toastSrv.error('System error occurred.')
                });
                if (this.isDrawerOpen) this.onCloseDrawer();
                return;
            }

            const backupItems = [...currentData.items];
            const backupCount = currentData.totalCount;

            this.tableData.update(data => data
                ? { ...data, items: data.items.filter(i => i.id !== id), totalCount: data.totalCount - 1 }
                : null
            );
            this.toastSrv.success('Deleted 1 lead.');

            this.leadSrv.delete(id)
                .pipe(catchError(() => {
                    this.toastSrv.error('System error occurred. Rolling back...');
                    this.tableData.update(data => data
                        ? { ...data, items: backupItems, totalCount: backupCount }
                        : null
                    );
                    return of(null);
                }))
                .subscribe(() => {
                    if (this.isDrawerOpen) this.onCloseDrawer();
                    this.loadStats();
                });
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadLeads();
    }
    // #endregion
}
