import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { CommonCategoryMedicineCategoryDrawerComponent } from "../../../../../components/layout/admin/system/common-category/medicine-category/medicine-category-drawer.component";
import { CommonCategoryMedicineCategoryTableCardComponent } from "../../../../../components/layout/admin/system/common-category/medicine-category/medicine-category-table-card.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { BooDateAdminComponent } from "../../../../../components/table/boo-table-admin/boo-date-admin.component";
import { BooFilterAdminComponent } from "../../../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../../../components/table/boo-table-admin/boo-sort-admin.component";
import { MedicineCategoryService } from "../../../../../services/admin/medicine-category.service";
import { DateService } from "../../../../../services/common/date.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MedicineCategory } from "../../../../../shared/types/clinical";
import { PaginationData } from "../../../../../shared/types/common";
import { DateRange } from "../../../../../shared/types/date";
import { FilterConfig } from "../../../../../shared/types/filter";
import { SortOption } from "../../../../../shared/types/sort";

@Component({
    selector: 'common-category-medicine-category-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        BooButtonAdminComponent,
        BooIconComponent,
        ButtonIconComponent,
        BooInputComponent,
        CommonCategoryMedicineCategoryTableCardComponent,
        CommonCategoryMedicineCategoryDrawerComponent,
        BooSortAdminComponent,
        BooFilterAdminComponent,
        BooDateAdminComponent,
        BooSelectComponent
    ],
    templateUrl: `./list.component.html`
})

export class CommonCategoryMedicineCategoryListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<MedicineCategory> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 5,
        search: '',
        sort: 'createdAt:desc',
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

    filter_configs: FilterConfig[] = [
        {
            key: 'isSurgical',
            label: 'Classification',
            type: 'boolean',
            value: null,
            trueLabel: 'Surgical',
            falseLabel: 'Diagnostic'
        },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private medicineCategorySrv: MedicineCategoryService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService
    ) { }

    ngOnInit(): void {
        this.loadMedicineCategories();
    }
    // #endregion

    // #region Methods
    loadMedicineCategories() {
        this.medicineCategorySrv.search({
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
        this.loadMedicineCategories();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: MedicineCategory) {
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
                this.medicineCategorySrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadMedicineCategories();
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
            this.medicineCategorySrv.delete(id)
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
        })
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadMedicineCategories();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadMedicineCategories();
    }

    onFilterApply(event: any) {
        console.log(event);
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: {
                start: this.params.filter.start,
                end: this.params.filter.end,
                ...event
            }
        }
        this.loadMedicineCategories();
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
        this.loadMedicineCategories();
    }
    // #endregion
}