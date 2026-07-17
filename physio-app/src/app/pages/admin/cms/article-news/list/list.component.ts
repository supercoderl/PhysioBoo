import { Component, OnInit, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { CmsArticleNewsDrawerComponent } from "../../../../../components/layout/admin/cms/article-news/article-news-drawer.component";
import { CmsArticleNewsTableCardComponent } from "../../../../../components/layout/admin/cms/article-news/article-news-table-card.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { BooDateAdminComponent } from "../../../../../components/table/boo-table-admin/boo-date-admin.component";
import { BooFilterAdminComponent } from "../../../../../components/table/boo-table-admin/boo-filter-admin.component";
import { BooSortAdminComponent } from "../../../../../components/table/boo-table-admin/boo-sort-admin.component";
import { ArticleService } from "../../../../../services/admin/article.service";
import { DateService } from "../../../../../services/common/date.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Article } from "../../../../../shared/types/article.types";
import { PaginationData } from "../../../../../shared/types/common";
import { DateRange } from "../../../../../shared/types/date.types";
import { FilterConfig } from "../../../../../shared/types/filter.types";
import { SortOption } from "../../../../../shared/types/sort";

@Component({
    selector: 'cms-article-news-list',
    standalone: true,
    imports: [
        SharedModule,
        CmsArticleNewsTableCardComponent,
        AdminContentHeaderComponent,
        BooSelectComponent,
        ButtonIconComponent,
        BooInputComponent,
        BooIconComponent,
        BooDateAdminComponent,
        BooButtonAdminComponent,
        BooFilterAdminComponent,
        BooSortAdminComponent,
        CmsArticleNewsDrawerComponent
    ],
    templateUrl: `./list.component.html`
})

export class CmsArticleNewsListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    tableData = signal<PaginationData<Article> | null>(null);
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
        { label: 'Title (A-Z)', value: '+title' },
        { label: 'Title (Z-A)', value: '-title' },
        { label: 'Publish Date (Newest)', value: '-publishDate' },
        { label: 'Publish Date (Oldest)', value: '+publishDate' },
    ];

    filter_configs: FilterConfig[] = [];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private articleSrv: ArticleService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private dateSrv: DateService
    ) { }

    ngOnInit(): void {
        this.loadArticles();
    }
    // #endregion

    // #region Methods
    loadArticles() {
        this.articleSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search,
            sort: this.params.sort,
            filter: {
                ...this.params.filter,
                start: this.dateSrv.format(this.params.filter.start, "YYYY-MM-DD"),
                end: this.dateSrv.format(this.params.filter.end, "YYYY-MM-DD")
            } as any
        })
            .subscribe(_res => {
                if (_res.success) {
                    this.tableData.set(_res.data);
                }
            });
    }

    onPageChanged(newPage: number) {
        this.params.pageNumber = newPage;
        this.loadArticles();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess(result: Article) {
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
                this.articleSrv.delete(id).subscribe({
                    next: () => {
                        this.params.pageNumber = currentData.pageNumber - 1;
                        this.loadArticles();
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
            this.articleSrv.delete(id)
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
        }, 'this article')
    }

    onSearch(val: string) {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.loadArticles();
    }

    onSortChange(sort: SortOption) {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.loadArticles();
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
        this.loadArticles();
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
        this.loadArticles();
    }
    // #endregion
}
