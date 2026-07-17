import { Component, ElementRef, OnInit, signal, ViewChild } from "@angular/core";
import { catchError, forkJoin, of } from "rxjs";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { CommonCategoryAppointmentTypeDrawerComponent } from "../../../../../components/layout/admin/system/common-category/appointment-type/appointment-type-drawer.component";
import { CommonCategoryAppointmentTypeTableCardComponent } from "../../../../../components/layout/admin/system/common-category/appointment-type/appointment-type-table-card.component";
import { AppointmentTypeService } from "../../../../../services/admin/appointment-type.service";
import { DateService } from "../../../../../services/common/date.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { TablePageSizeService } from "../../../../../services/common/table-page-size.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PaginationData } from "../../../../../shared/types/common";
import { DateRange } from "../../../../../shared/types/date.types";
import { FilterConfig } from "../../../../../shared/types/filter.types";
import { AppointmentType } from "../../../../../shared/types/operation.types";
import { SortOption } from "../../../../../shared/types/sort";
import { BulkAction, SavedView, TableComment } from "../../../../../shared/types/table.types";

@Component({
    selector: 'common-category-appointment-type-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        CommonCategoryAppointmentTypeTableCardComponent,
        CommonCategoryAppointmentTypeDrawerComponent
    ],
    templateUrl: `./list.component.html`,
    host: { class: 'block h-full min-h-0' }
})

export class CommonCategoryAppointmentTypeListComponent implements OnInit {
    @ViewChild('tableHost', { static: false }) tableHost?: ElementRef<HTMLElement>;

    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<AppointmentType> | null>(null);
    params = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        sort: 'createdAt:desc',
        filter: {
            start: null as Date | null,
            end: null as Date | null,
            isEmergency: null as boolean | null,
            requiresPreparation: null as boolean | null,
            isFollowUp: null as boolean | null,
            isActive: null as boolean | null
        }
    };
    isDrawerOpen: boolean = false;
    selectedId: string | null = null;

    savedViews: SavedView[] = [
        { id: 'all', name: 'All Types', isDefault: true, icon: 'rows-4' },
    ];
    currentViewId: string | null = 'all';
    currentGroupBy: string | null = null;
    comments: TableComment[] = [];
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
        private appointmentTypeSrv: AppointmentTypeService,
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
                this.loadAppointmentTypes();
            });
    }
    // #endregion

    // #region Methods
    loadAppointmentTypes() {
        this.appointmentTypeSrv.search({
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
        this.loadAppointmentTypes();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: AppointmentType) {
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
                this.appointmentTypeSrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadAppointmentTypes();
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
            this.appointmentTypeSrv.delete(id)
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
        this.loadAppointmentTypes();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadAppointmentTypes();
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
        this.loadAppointmentTypes();
    }

    onSingleFilterChange(event: { key: string; value: any }) {
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: { ...this.params.filter, [event.key]: event.value }
        };
        this.loadAppointmentTypes();
    }

    onViewSelect(v: SavedView) {
        this.currentViewId = v.id;
        switch (v.id) {
            case 'all':
                this.params = {
                    ...this.params, pageNumber: 1, filter: {
                        start: null,
                        end: null,
                        isEmergency: null,
                        requiresPreparation: null,
                        isFollowUp: null,
                        isActive: null
                    }, sort: '-createdAt'
                };
                break;
            case 'surgical':
                this.params = { ...this.params, pageNumber: 1, filter: { ...this.params.filter } };
                break;
            case 'recent':
                this.params = { ...this.params, pageNumber: 1, sort: '-createdAt' };
                break;
        }
        this.loadAppointmentTypes();
    }

    onViewSaveAsNew() {
        const name = prompt('Name for this view?');
        if (!name) return;
        const newView: SavedView = { id: `view_${Date.now()}`, name, icon: 'bookmark' };
        this.savedViews = [...this.savedViews, newView];
        this.currentViewId = newView.id;
    }

    onViewDelete(v: SavedView) {
        this.savedViews = this.savedViews.filter(x => x.id !== v.id);
        if (this.currentViewId === v.id) this.currentViewId = 'all';
    }

    onGroupApply(key: string | null) {
        this.currentGroupBy = key;
    }

    onCommentAdd(text: string) {
        this.comments = [
            ...this.comments,
            {
                id: `c_${Date.now()}`,
                author: 'You',
                text,
                createdAt: new Date().toLocaleString()
            }
        ];
    }

    onCommentDelete(c: TableComment) {
        this.comments = this.comments.filter(x => x.id !== c.id);
    }

    onResetView() {
        this.params = {
            pageNumber: 1,
            pageSize: this.params.pageSize,
            search: '',
            sort: '-createdAt',
            filter: {
                start: null,
                end: null,
                isEmergency: null,
                requiresPreparation: null,
                isFollowUp: null,
                isActive: null
            }
        };
        this.currentGroupBy = null;
        this.currentViewId = 'all';
        this.loadAppointmentTypes();
    }

    onBulkAction(event: { action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }) {
        const { action, ids } = event;
        if (!ids.length) return;

        if (action.key === 'delete') {
            const calls = ids.map(id => this.appointmentTypeSrv.delete(String(id)).pipe(
                catchError(_ => of(null))
            ));
            forkJoin(calls).subscribe(results => {
                const failed = results.filter(r => r === null).length;
                if (failed === 0) {
                    this.toastSrv.success(`Deleted ${ids.length} item(s).`);
                } else {
                    this.toastSrv.error(`${failed} of ${ids.length} item(s) failed to delete.`);
                }
                this.loadAppointmentTypes();
            });
            return;
        }

        if (action.key === 'export') {
            this.toastSrv.success(`Exporting ${ids.length} item(s)...`);
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
        this.loadAppointmentTypes();
    }
    // #endregion
}