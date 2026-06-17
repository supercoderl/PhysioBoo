import { Component, ElementRef, OnInit, signal, ViewChild } from "@angular/core";
import { catchError, forkJoin, of } from "rxjs";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { SettingSequenceTrackerDrawerComponent } from "../../../../../components/layout/admin/setting/sequence-tracker/sequence-tracker-drawer.component";
import { SettingSequenceTrackerTableCardComponent } from "../../../../../components/layout/admin/setting/sequence-tracker/sequence-tracker-table-card.component";
import { SequenceTrackerService } from "../../../../../services/admin/sequence-tracker.service";
import { DateService } from "../../../../../services/common/date.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { TablePageSizeService } from "../../../../../services/common/table-page-size.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PaginationData } from "../../../../../shared/types/common";
import { DateRange } from "../../../../../shared/types/date";
import { FilterConfig } from "../../../../../shared/types/filter";
import { SortOption } from "../../../../../shared/types/sort";
import { SequenceTracker } from "../../../../../shared/types/system";
import { BulkAction, SavedView, TableComment } from "../../../../../shared/types/table";

@Component({
    selector: 'setting-sequence-tracker-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        SettingSequenceTrackerTableCardComponent,
        SettingSequenceTrackerDrawerComponent
    ],
    templateUrl: `./list.component.html`,
    host: { class: 'block h-full min-h-0' }
})

export class SettingSequenceTrackerListComponent implements OnInit {
    @ViewChild('tableHost', { static: false }) tableHost?: ElementRef<HTMLElement>;

    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<SequenceTracker> | null>(null);
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
        private sequenceTrackerSrv: SequenceTrackerService,
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
                this.loadSequenceTrackers();
            });
    }
    // #endregion

    // #region Methods
    loadSequenceTrackers() {
        this.sequenceTrackerSrv.search({
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
        this.loadSequenceTrackers();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: SequenceTracker) {
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
                this.sequenceTrackerSrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadSequenceTrackers();
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
            this.sequenceTrackerSrv.delete(id)
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
        this.loadSequenceTrackers();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadSequenceTrackers();
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
        this.loadSequenceTrackers();
    }

    onSingleFilterChange(event: { key: string; value: any }) {
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: { ...this.params.filter, [event.key]: event.value }
        };
        this.loadSequenceTrackers();
    }

    onViewSelect(v: SavedView) {
        this.currentViewId = v.id;
        switch (v.id) {
            case 'all':
                this.params = {
                    ...this.params, pageNumber: 1, filter: {
                        start: null,
                        end: null
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
        this.loadSequenceTrackers();
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
                end: null
            }
        };
        this.currentGroupBy = null;
        this.currentViewId = 'all';
        this.loadSequenceTrackers();
    }

    onBulkAction(event: { action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }) {
        const { action, ids } = event;
        if (!ids.length) return;

        if (action.key === 'delete') {
            const calls = ids.map(id => this.sequenceTrackerSrv.delete(String(id)).pipe(
                catchError(_ => of(null))
            ));
            forkJoin(calls).subscribe(results => {
                const failed = results.filter(r => r === null).length;
                if (failed === 0) {
                    this.toastSrv.success(`Deleted ${ids.length} item(s).`);
                } else {
                    this.toastSrv.error(`${failed} of ${ids.length} item(s) failed to delete.`);
                }
                this.loadSequenceTrackers();
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
        this.loadSequenceTrackers();
    }
    // #endregion
}