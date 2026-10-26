import { Component, ElementRef, OnInit, signal, ViewChild } from "@angular/core";
import { catchError, forkJoin, of } from "rxjs";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { CommonCategoryDepartmentDrawerComponent } from "../../../../../components/layout/admin/system/common-category/department/department-drawer.component";
import { CommonCategoryDepartmentTableCardComponent } from "../../../../../components/layout/admin/system/common-category/department/department-table-card.component";
import { DepartmentService } from "../../../../../services/admin/department.service";
import { DateService } from "../../../../../services/common/date.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { TablePageSizeService } from "../../../../../services/common/table-page-size.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PaginationData } from "../../../../../shared/types/common";
import { DateRange } from "../../../../../shared/types/date.types";
import { FilterConfig } from "../../../../../shared/types/filter.types";
import { Department } from "../../../../../shared/types/operation.types";
import { SortOption } from "../../../../../shared/types/sort";
import { BulkAction } from "../../../../../shared/types/table.types";

@Component({
    selector: 'common-category-department-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        CommonCategoryDepartmentTableCardComponent,
        CommonCategoryDepartmentDrawerComponent,
    ],
    templateUrl: `./list.component.html`,
    host: { class: 'block h-full min-h-0' }
})

export class CommonCategoryDepartmentListComponent implements OnInit {
    @ViewChild('tableHost', { static: false }) tableHost?: ElementRef<HTMLElement>;

    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Department> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 5,
        search: '',
        sort: '-createdAt',
        filter: {
            start: null as Date | null,
            end: null as Date | null
        }
    };
    isDrawerOpen: boolean = false;
    selectedId: string | null = null;

    sort_options: SortOption[] = [
        { label: 'Recent', value: '-createdAt' },
        { label: 'Oldest', value: '+createdAt' },
        { label: 'Name (A-Z)', value: '+name' },
        { label: 'Name (Z-A)', value: '-name' },
        { label: 'Code (A-Z)', value: '+code' },
        { label: 'Code (Z-A)', value: '-code' },
    ];

    filter_configs: FilterConfig[] = [];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private departmentSrv: DepartmentService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService,
        private pageSizeSrv: TablePageSizeService
    ) { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.pageSizeSrv
            .watch({
                hostElement: this.tableHost,
                rowHeight: 48,
                toolbarHeight: 48,
                headerHeight: 48,
                footerHeight: 44,
                extraOffset: 16,
                min: 10,
                max: 50
            })
            .subscribe(size => {
                const isFirst = !this.tableData();
                const changed = size !== this.params.pageSize;
                if (!isFirst && !changed) return;
                this.params.pageSize = size;
                this.params.pageNumber = 1;
                this.loadDepartments();
            });
    }
    // #endregion

    // #region Methods
    loadDepartments() {
        this.departmentSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: {
                ...this.params.filter,
                start: this.dateSrv.format(this.params.filter.start, "YYYY-MM-DD"),
                end: this.dateSrv.format(this.params.filter.end, "YYYY-MM-DD")
            }
        })
            .subscribe(_res => {
                if (_res.success) {
                    this.tableData.set(_res.data);
                }
            });
    }

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadDepartments();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    /** A new row sorts by name, code or date on the server, so reload instead of guessing where it belongs. */
    onSaveSuccess() {
        this.onCloseDrawer();
        this.loadDepartments();
    }

    onDelete(id: string | null) {
        if (!id) return;

        this.dialogSrv.confirmDelete(() => {
            const data = this.tableData();
            const wasLastOnPage = !!data && data.items.length === 1 && data.pageNumber > 1;

            this.departmentSrv.delete(id).subscribe({
                next: () => {
                    this.toastSrv.success("Deleted 1 item.");
                    if (wasLastOnPage) this.params.pageNumber -= 1;
                    if (this.isDrawerOpen) this.onCloseDrawer();
                    this.loadDepartments();
                },
                error: () => this.toastSrv.error("The item could not be deleted. It may still be in use.")
            });
        });
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadDepartments();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadDepartments();
    }

    onFilterApply(event: any) {
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: {
                start: this.params.filter.start,
                end: this.params.filter.end,
                ...event
            }
        }
        this.loadDepartments();
    }

    onSingleFilterChange(event: { key: string; value: any }) {
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: { ...this.params.filter, [event.key]: event.value }
        };
        this.loadDepartments();
    }


    onBulkAction(event: { action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }) {
        const { action, ids } = event;
        if (!ids.length) return;

        if (action.key === 'delete') {
            const calls = ids.map(id => this.departmentSrv.delete(String(id)).pipe(
                catchError(_ => of(null))
            ));
            forkJoin(calls).subscribe(results => {
                const failed = results.filter(r => r === null).length;
                if (failed === 0) {
                    this.toastSrv.success(`Deleted ${ids.length} item(s).`);
                } else {
                    this.toastSrv.error(`${failed} of ${ids.length} item(s) failed to delete.`);
                }
                this.loadDepartments();
            });
            return;
        }

    }

    onDateChange(range: DateRange) {
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: {
                ...this.params.filter,
                start: range.start,
                end: range.end
            }
        };
        this.loadDepartments();
    }
    // #endregion
}