import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { CrmPatientDrawerComponent } from "../../../../components/layout/admin/crm/patient/patient-drawer.component";
import { CrmPatientTableCardComponent } from "../../../../components/layout/admin/crm/patient/patient-table-card.component";
import { PatientService } from "../../../../services/admin/patient.service";
import { DateService } from "../../../../services/common/date.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { DateRange } from "../../../../shared/types/date.types";
import { FilterConfig } from "../../../../shared/types/filter.types";
import { Patient } from "../../../../shared/types/patient.types";
import { SortOption } from "../../../../shared/types/sort";

@Component({
    selector: 'crm-patient-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        CrmPatientTableCardComponent,
        CrmPatientDrawerComponent,
    ],
    template: `
        <admin-content-header>
            <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
                <div class="flex-1">
                    <h4 class="text-[22px] text-primary font-semibold mb-0">Patients</h4>
                </div>
                <div class="text-right flex">
                    <button-icon buttonClass="!bg-primary ms-2 text-white" (onClick)="onOpenDrawer(null)">
                        New Patient
                    </button-icon>
                </div>
            </div>

            <div class="mt-2">
                <crm-patient-table-card
                    [data]="tableData()"
                    (pageChange)="onPageChanged($event)"
                    (editClick)="onOpenDrawer($event)"
                    (deleteClick)="onDelete($event)"
                    [filter]="params"
                />
            </div>

            <crm-patient-drawer
                [isOpen]="isDrawerOpen"
                [currentId]="selectedId"
                (close)="onCloseDrawer()"
                (saveSuccess)="onSaveSuccess($event)"
                (delete)="onDelete($event)"
            />
        </admin-content-header>
    `
})
export class CrmPatientListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Patient> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 5,
        search: '',
        sort: '-registrationDate',
        filter: {
            start: null as Date | null,
            end: null as Date | null,
            patientType: null as number | null,
            riskLevel: null as number | null,
            isVip: null as boolean | null,
            isChronicPatient: null as boolean | null,
        }
    };
    isDrawerOpen = false;
    selectedId: string | null = null;

    sort_options: SortOption[] = [
        { label: 'Recent', value: '-registrationDate' },
        { label: 'Oldest', value: '+registrationDate' },
        { label: 'Patient # (A-Z)', value: '+patientNumber' },
        { label: 'Patient # (Z-A)', value: '-patientNumber' },
        { label: 'Most Visits', value: '-totalVisits' },
    ];

    filter_configs: FilterConfig[] = [
        {
            key: 'isVip',
            label: 'VIP',
            type: 'boolean',
            value: null,
            trueLabel: 'VIP Only',
            falseLabel: 'Non-VIP'
        },
        {
            key: 'isChronicPatient',
            label: 'Chronic',
            type: 'boolean',
            value: null,
            trueLabel: 'Chronic Only',
            falseLabel: 'Non-Chronic'
        },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private patientSrv: PatientService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService
    ) { }

    ngOnInit(): void {
        this.loadPatients();
    }
    // #endregion

    // #region Methods
    loadPatients() {
        this.patientSrv.search({
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

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadPatients();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: Patient) {
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
                this.patientSrv.delete(id).subscribe({
                    next: () => { this.params.pageNumber = currentData.pageNumber - 1; this.loadPatients(); },
                    error: () => this.toastSrv.error("System error occurred.")
                });
                this.isDrawerOpen && this.onCloseDrawer();
                return;
            }

            const backupItems = [...currentData.items];
            const backupCount = currentData.totalCount;

            this.tableData.update(data => data ? { ...data, items: data.items.filter(i => i.id !== id), totalCount: data.totalCount - 1 } : null);
            this.toastSrv.success("Deleted 1 item.");

            this.patientSrv.delete(id)
                .pipe(catchError(_ => {
                    this.toastSrv.error("System error occurred. Rolling back data...");
                    this.tableData.update(data => data ? { ...data, items: backupItems, totalCount: backupCount } : null);
                    return of(null);
                }))
                .subscribe({ next: _ => this.isDrawerOpen && this.onCloseDrawer() });
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadPatients();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadPatients();
    }

    onFilterApply(event: any) {
        this.params = { ...this.params, pageNumber: 1, filter: { start: this.params.filter.start, end: this.params.filter.end, ...event } };
        this.loadPatients();
    }

    onDateChange(range: DateRange) {
        this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter, start: range.start, end: range.end } };
        this.loadPatients();
    }
    // #endregion
}
