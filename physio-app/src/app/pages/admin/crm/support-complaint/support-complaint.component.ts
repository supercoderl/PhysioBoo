import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { CrmComplaintDrawerComponent } from "../../../../components/layout/admin/crm/complaint/complaint-drawer.component";
import { CrmComplaintKpiStripComponent } from "../../../../components/layout/admin/crm/complaint/complaint-kpi-strip.component";
import { CrmComplaintTableCardComponent } from "../../../../components/layout/admin/crm/complaint/complaint-table-card.component";
import { ComplaintService } from "../../../../services/admin/complaint.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { Complaint, ComplaintStats } from "../../../../shared/types/complaint.types";

@Component({
    selector: 'admin-support-complaint',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        CrmComplaintKpiStripComponent,
        CrmComplaintTableCardComponent,
        CrmComplaintDrawerComponent,
    ],
    template: `
        <admin-content-header>
            <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
                <div class="flex-1">
                    <h4 class="text-[22px] text-primary font-semibold mb-0">Support & Complaints</h4>
                </div>
                <div class="text-right flex">
                    <button-icon buttonClass="!bg-primary ms-2 text-white" (onClick)="onOpenDrawer(null)">
                        Log Complaint
                    </button-icon>
                </div>
            </div>

            <div class="mb-4">
                <crm-complaint-kpi-strip [stats]="stats()" />
            </div>

            <div class="mt-2">
                <crm-complaint-table-card
                    [data]="tableData()"
                    (pageChange)="onPageChanged($event)"
                    (editClick)="onOpenDrawer($event)"
                    (deleteClick)="onDelete($event)"
                    [filter]="params"
                />
            </div>

            <crm-complaint-drawer
                [isOpen]="isDrawerOpen"
                [currentId]="selectedId"
                (close)="onCloseDrawer()"
                (saveSuccess)="onSaveSuccess($event)"
                (delete)="onDelete($event)"
            />
        </admin-content-header>
    `
})
export class AdminSupportComplaintComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Complaint> | null>(null);
    stats = signal<ComplaintStats | null>(null);
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
            category: null as number | null,
        }
    };
    isDrawerOpen = false;
    selectedId: string | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private complaintSrv: ComplaintService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
    ) { }

    ngOnInit(): void {
        this.loadComplaints();
        this.loadStats();
    }
    // #endregion

    // #region Methods
    loadComplaints() {
        this.complaintSrv.search({
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
        this.complaintSrv.stats().subscribe(res => {
            if (res.success) this.stats.set(res.data);
        });
    }

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadComplaints();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: Complaint) {
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
                this.complaintSrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadComplaints();
                        this.loadStats();
                        this.toastSrv.success('Complaint deleted.');
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
            this.toastSrv.success('Complaint deleted.');

            this.complaintSrv.delete(id)
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
        this.loadComplaints();
    }
    // #endregion
}
