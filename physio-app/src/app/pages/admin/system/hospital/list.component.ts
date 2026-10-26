import { AfterViewInit, Component, ElementRef, signal, ViewChild } from "@angular/core";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { AdminHospitalDrawerComponent } from "../../../../components/layout/admin/system/hospital/hospital-drawer.component";
import { AdminHospitalTableCardComponent } from "../../../../components/layout/admin/system/hospital/hospital-table-card.component";
import { AuthService } from "../../../../services/auth/auth.service";
import { HospitalService } from "../../../../services/admin/hospital.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { TablePageSizeService } from "../../../../services/common/table-page-size.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { SortOption } from "../../../../shared/types/sort";
import { Hospital } from "../../../../shared/types/support.types";

/** Branches of the signed-in tenant. See docs/hospital-branch-redesign.md. */
@Component({
    selector: 'admin-hospital-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        AdminHospitalTableCardComponent,
        AdminHospitalDrawerComponent
    ],
    host: { class: 'block h-full min-h-0' },
    template: `
        <admin-content-header>
            <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
                <div class="flex-1">
                    <h4 class="text-[22px] text-primary font-semibold mb-0">Hospital</h4>
                    <p class="text-sm text-secondary m-0">Branches of your hospital group</p>
                </div>
                <div class="text-right flex">
                    <button-icon *ngIf="canCreate" buttonClass="!bg-primary ms-2 text-white" (onClick)="onOpenDrawer(null)">
                        New branch
                    </button-icon>
                </div>
            </div>

            <div class="flex-1 min-h-0" #tableHost>
                <admin-hospital-table-card
                    [data]="tableData()"
                    [filter]="params"
                    [sortOptions]="sortOptions"
                    [currentSort]="params.sort"
                    [canDelete]="canDelete"
                    (pageChange)="onPageChanged($event)"
                    (searchChange)="onSearch($event)"
                    (reloadClick)="loadHospitals()"
                    (sortApply)="onSortChange($event)"
                    (editClick)="onOpenDrawer($event)"
                    (deleteClick)="onDelete($event)"
                />
            </div>

            <admin-hospital-drawer
                [isOpen]="isDrawerOpen"
                [currentId]="selectedId"
                (close)="onCloseDrawer()"
                (saveSuccess)="onSaveSuccess()"
                (delete)="onDelete($event)"
            />
        </admin-content-header>
    `
})
export class AdminHospitalListComponent implements AfterViewInit {
    @ViewChild('tableHost', { static: false }) tableHost?: ElementRef<HTMLElement>;

    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Hospital> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: '-createdAt'
    };
    isDrawerOpen = false;
    selectedId: string | null = null;
    readonly canCreate: boolean;
    readonly canDelete: boolean;

    /** The API sorts by name, code and creation date only. */
    readonly sortOptions: SortOption[] = [
        { label: 'Recent', value: '-createdAt' },
        { label: 'Oldest', value: '+createdAt' },
        { label: 'Name (A-Z)', value: '+name' },
        { label: 'Name (Z-A)', value: '-name' },
        { label: 'Code (A-Z)', value: '+code' },
        { label: 'Code (Z-A)', value: '-code' },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private hospitalSrv: HospitalService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        private pageSizeSrv: TablePageSizeService,
        private authSrv: AuthService
    ) {
        this.canCreate = this.authSrv.hasPermission(Permissions.Admin.HospitalCreate);
        this.canDelete = this.authSrv.hasPermission(Permissions.Admin.HospitalDelete);
    }

    ngAfterViewInit(): void {
        this.pageSizeSrv
            .watch({
                hostElement: this.tableHost,
                rowHeight: 56,
                toolbarHeight: 48,
                headerHeight: 48,
                footerHeight: 44,
                extraOffset: 16,
                min: 5,
                max: 50
            })
            .subscribe(size => {
                const isFirst = !this.tableData();
                if (!isFirst && size === this.params.pageSize) return;
                this.params.pageSize = size;
                this.params.pageNumber = 1;
                this.loadHospitals();
            });
    }
    // #endregion

    // #region Methods
    loadHospitals(): void {
        this.hospitalSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: { start: '', end: '', hospitalGroupId: null, type: null, isActive: null, hasEmergencyServices: null }
        }).subscribe(res => {
            if (res.success) this.tableData.set(res.data);
        });
    }

    onPageChanged(page: number): void {
        this.params.pageNumber = page;
        this.loadHospitals();
    }

    onSearch(value: string): void {
        this.params = { ...this.params, pageNumber: 1, search: value };
        this.loadHospitals();
    }

    onSortChange(sort: SortOption): void {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadHospitals();
    }

    onOpenDrawer(id: string | null): void {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer(): void {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    /** A new branch sorts by code or date on the server, so reload instead of guessing where the row belongs. */
    onSaveSuccess(): void {
        this.onCloseDrawer();
        this.loadHospitals();
    }

    onDelete(id: string | null): void {
        if (!id) return;

        this.dialogSrv.confirmDelete(() => {
            const data = this.tableData();
            const wasLastOnPage = !!data && data.items.length === 1 && data.pageNumber > 1;

            this.hospitalSrv.delete(id).subscribe({
                next: () => {
                    this.toastSrv.success('Branch deleted');
                    if (wasLastOnPage) this.params.pageNumber -= 1;
                    if (this.isDrawerOpen) this.onCloseDrawer();
                    this.loadHospitals();
                },
                error: () => this.toastSrv.error('The branch could not be deleted. It may still have departments or rooms.')
            });
        }, 'this branch');
    }
    // #endregion
}
