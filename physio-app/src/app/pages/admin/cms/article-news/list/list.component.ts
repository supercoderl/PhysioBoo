import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooFilterChip,
    BooFilterChipsComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooPaginationComponent,
    BooSearchFieldComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { ArticleService } from '../../../../../services/admin/article.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { Permissions } from '../../../../../shared/constants/permission.constant';
import { ArticleCategory, ArticleStatus } from '../../../../../shared/enums/article';
import { Article } from '../../../../../shared/types/article.types';
import { PaginationData } from '../../../../../shared/types/common';
import { CmsArticleDetailDrawerComponent } from '../article-detail-drawer.component';
import { CmsArticleEditDrawerComponent } from '../article-edit-drawer.component';
import {
    ArticleTransition,
    CATEGORY_LABEL,
    CATEGORY_OPTIONS,
    categoryOf,
    parseIsoDate,
    publicUrlOf,
    statusOf,
    tagsOf,
    transitionsOf,
    withStatus,
} from '../article.utils';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'category' | 'range';
}

interface StatusTab {
    value: ArticleStatus | null;
    label: string;
}

const PAGE_SIZE = 20;

/**
 * Article & news workspace (POST /api/articles/search). The server searches title, excerpt and tags, filters by one
 * category, one status and the days articles were created on (both ends needed), and sorts by title, author, publish
 * date or creation date. Status moves go through the regular update endpoint with the article's other fields unchanged.
 */
@Component({
    selector: 'cms-article-news-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        DecimalPipe,
        FormsModule,
        BooButtonComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooFilterChipsComponent,
        BooDatepickerComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        CmsArticleDetailDrawerComponent,
        CmsArticleEditDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class CmsArticleNewsListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly articleSrv = inject(ArticleService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly ArticleStatus = ArticleStatus;
    readonly statusTabs: StatusTab[] = [
        { value: null, label: 'All articles' },
        { value: ArticleStatus.Published, label: 'Published' },
        { value: ArticleStatus.Draft, label: 'Drafts' },
        { value: ArticleStatus.Archived, label: 'Archived' },
    ];
    readonly categoryOptions = CATEGORY_OPTIONS;
    readonly sortOptions = [
        { value: '-createdAt', label: 'Newest first' },
        { value: '+createdAt', label: 'Oldest first' },
        { value: '-publishDate', label: 'Recently published' },
        { value: '+title', label: 'Title (A–Z)' },
        { value: '-title', label: 'Title (Z–A)' },
        { value: '+author', label: 'Author (A–Z)' },
    ];
    readonly skeletonRows = Array.from({ length: 6 });
    readonly status = statusOf;
    readonly category = categoryOf;
    readonly tags = tagsOf;
    readonly publicUrl = publicUrlOf;

    query = '';
    statusFilter: ArticleStatus | null = null;
    categoryFilter: ArticleCategory | null = null;
    from: string | null = null;
    to: string | null = null;
    sort = '-createdAt';
    page = 1;

    data: PaginationData<Article> | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Articles with a request in flight, and the status being applied ('delete' for a delete). */
    busy = new Map<string, ArticleStatus | 'delete'>();
    /** Covers whose image failed to load, so the row falls back to its placeholder. */
    brokenCovers = new Set<string>();

    selected: Article | null = null;
    editorOpen = false;
    editing: Article | null = null;
    /** Reopen the preview after editing when the edit started there. */
    private returnToDetail = false;

    canCreate = false;
    canUpdate = false;
    canDelete = false;

    private readonly load$ = new Subject<void>();
    private readonly query$ = new Subject<string>();
    /** The search term last sent to the server. */
    private lastSearched = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next search.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    const range = this.rangeApplied;
                    return this.articleSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: {
                            start: range ? this.from! : '',
                            end: range ? this.to! : '',
                            category: this.categoryFilter,
                            status: this.statusFilter,
                            // Staff see drafts and archived articles too when no status is picked.
                            includeUnpublished: true,
                        },
                    }).pipe(
                        map(res => ({ res, err: null as HttpErrorResponse | null })),
                        catchError((err: HttpErrorResponse) => of({ res: null, err })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ res, err }) => {
                if (err || !res?.success || !res.data) {
                    this.failLoad(err?.status === 403 ? 'forbidden' : 'failed');
                    return;
                }
                this.data = { ...res.data, items: res.data.items ?? [] };
                this.loadError = null;
                this.refreshErrorState = 'default';
                // Keep an open preview in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(a => a.id === open.id) ?? open;
            });

        this.query$
            .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Read the field now rather than the emitted value, in case filters were cleared meanwhile.
                const term = this.searchTerm;
                this.searchPending = false;
                if (term === this.lastSearched) return;
                this.lastSearched = term;
                this.page = 1;
                this.load();
            });

        this.load();
    }
    // #endregion

    // #region Getters
    get items(): Article[] {
        return this.data?.items ?? [];
    }

    get totalPages(): number {
        return Math.max(1, this.data?.totalPages ?? Math.ceil((this.data?.totalCount ?? 0) / PAGE_SIZE));
    }

    get firstShown(): number {
        return this.items.length ? (this.page - 1) * PAGE_SIZE + 1 : 0;
    }

    get lastShown(): number {
        return (this.page - 1) * PAGE_SIZE + this.items.length;
    }

    get searchTerm(): string {
        return this.query.trim();
    }

    get rangeInvalid(): boolean {
        return !!this.from && !!this.to && this.from > this.to;
    }

    /** The server filters by creation date only when both ends are given. */
    get rangeIncomplete(): boolean {
        return !!this.from !== !!this.to;
    }

    get rangeApplied(): boolean {
        return !!this.from && !!this.to && !this.rangeInvalid;
    }

    /** Filters other than the status tab. */
    get hasFilters(): boolean {
        return this.chips.length > 0;
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `“${this.searchTerm}”` });
        if (this.categoryFilter !== null) chips.push({ kind: 'category', label: CATEGORY_LABEL[this.categoryFilter] ?? 'Category' });
        if (this.rangeApplied) chips.push({ kind: 'range', label: `Created ${this.shortDate(this.from!)} – ${this.shortDate(this.to!)}` });
        return chips;
    }

    get activeTab(): StatusTab {
        return this.statusTabs.find(t => t.value === this.statusFilter) ?? this.statusTabs[0];
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label.toLowerCase() ?? '';
    }

    get countNoun(): string {
        const n = this.data?.totalCount ?? 0;
        const noun = n === 1 ? 'article' : 'articles';
        switch (this.statusFilter) {
            case ArticleStatus.Published: return `published ${noun}`;
            case ArticleStatus.Draft: return n === 1 ? 'draft' : 'drafts';
            case ArticleStatus.Archived: return `archived ${noun}`;
            default: return noun;
        }
    }

    get busySelected(): boolean {
        return !!this.selected && this.busy.has(this.selected.id);
    }

    get pendingSelectedStatus(): ArticleStatus | null {
        const v = this.selected ? this.busy.get(this.selected.id) : undefined;
        return typeof v === 'number' ? v : null;
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    onQueryChange(): void {
        this.searchPending = this.searchTerm !== this.lastSearched;
        this.query$.next(this.query);
    }

    clearSearch(): void {
        this.query = '';
        this.onQueryChange();
    }

    selectStatus(value: ArticleStatus | null): void {
        if (value === this.statusFilter) return;
        this.statusFilter = value;
        this.page = 1;
        this.load();
    }

    /** Arrow keys, Home and End move between status tabs. */
    onTabKey(event: KeyboardEvent, index: number): void {
        const last = this.statusTabs.length - 1;
        const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
            : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : event.key === 'Home' ? 0
            : event.key === 'End' ? last
            : null;
        if (next === null) return;
        event.preventDefault();
        this.selectStatus(this.statusTabs[next].value);
        this.host.querySelector<HTMLElement>(`#article-tab-${next}`)?.focus();
    }

    onFilterChange(): void {
        // A half-picked or reversed range waits for the other date rather than reloading twice.
        if (this.rangeInvalid || this.rangeIncomplete) return;
        this.page = 1;
        this.load();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    removeChip(chip: FilterChip): void {
        if (chip.kind === 'search') {
            this.clearSearch();
            return;
        }
        if (chip.kind === 'category') this.categoryFilter = null;
        else {
            this.from = null;
            this.to = null;
        }
        this.onFilterChange();
    }

    clearFilters(): void {
        this.query = '';
        this.categoryFilter = null;
        this.from = null;
        this.to = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.load();
    }

    showAll(): void {
        this.statusFilter = null;
        this.clearFilters();
    }

    openDetail(a: Article): void {
        this.editorOpen = false;
        this.editing = null;
        this.selected = a;
    }

    openCreate(): void {
        if (!this.canCreate) return;
        this.returnToDetail = false;
        this.selected = null;
        this.editing = null;
        this.editorOpen = true;
    }

    openEdit(a: Article, fromDetail = false): void {
        if (!this.canUpdate || this.busy.has(a.id)) return;
        this.returnToDetail = fromDetail;
        this.selected = null;
        this.editing = a;
        this.editorOpen = true;
    }

    closeEditor(): void {
        const a = this.editing;
        this.editorOpen = false;
        this.editing = null;
        if (a && this.returnToDetail) this.selected = this.items.find(i => i.id === a.id) ?? a;
        this.returnToDetail = false;
    }

    onSaved({ article, created }: { article: Article; created: boolean }): void {
        const verb = created
            ? (article.status === ArticleStatus.Published ? 'Article published' : 'Article saved')
            : 'Article updated';
        this.toastSrv.success(article.title, verb);
        this.editorOpen = false;
        this.editing = null;
        this.returnToDetail = false;
        this.brokenCovers.delete(article.id);
        // Show the saved article so it can be checked, and published when it is a draft.
        this.selected = article;
        this.load();
    }

    /** The usual next step offered on the row: publish a draft. Other moves live in the preview. */
    rowMove(a: Article): ArticleTransition | null {
        return a.status === ArticleStatus.Draft ? transitionsOf(a)[0] ?? null : null;
    }

    /** Applies a status move, asking first when it changes what the public blog shows. */
    move(a: Article, t: ArticleTransition): void {
        if (!this.canUpdate || this.busy.has(a.id)) return;
        if (!t.confirm) {
            this.applyMove(a, t);
            return;
        }
        if (t.to === ArticleStatus.Published) {
            this.dialogSrv.confirm(
                `Publish “${a.title}”? It will appear on the public blog${a.publishDate ? '' : ', dated today'}.`,
                () => this.applyMove(a, t),
                'Publish article',
                'info',
                'Publish',
                'Not yet',
            );
            return;
        }
        const archive = t.to === ArticleStatus.Archived;
        this.dialogSrv.confirm(
            archive
                ? `Archive “${a.title}”? It will be taken off the public blog. You can restore it from the Archived tab.`
                : `Unpublish “${a.title}”? It will be taken off the public blog and kept as a draft.`,
            () => this.applyMove(a, t),
            archive ? 'Archive article' : 'Unpublish article',
            'warning',
            archive ? 'Archive' : 'Unpublish',
            'Keep published',
        );
    }

    confirmDelete(a: Article): void {
        if (!this.canDelete || this.busy.has(a.id)) return;
        const live = a.status === ArticleStatus.Published ? ' It will also disappear from the public blog.' : '';
        this.dialogSrv.confirm(
            `Delete “${a.title}”? This can't be undone.${live} To keep it on record, archive it instead.`,
            () => this.delete(a),
            'Delete article',
            'danger',
            'Delete article',
            'Keep article',
        );
    }

    onCoverError(a: Article): void {
        const next = new Set(this.brokenCovers);
        next.add(a.id);
        this.brokenCovers = next;
    }

    /** The date most worth showing for the row's status. */
    dateLine(a: Article): { label: string; date: string } | null {
        if (a.status === ArticleStatus.Published && a.publishDate) return { label: 'Published', date: a.publishDate };
        if (a.updatedAt) return { label: 'Edited', date: a.updatedAt };
        return a.createdAt ? { label: 'Created', date: a.createdAt } : null;
    }

    trackById(_: number, a: Article): string {
        return a.id;
    }

    tabIndex(tab: StatusTab): number {
        return this.statusTabs.indexOf(tab);
    }
    // #endregion

    // #region Helpers
    private applyMove(a: Article, t: ArticleTransition): void {
        this.setBusy(a.id, t.to);
        // The update replaces every field, so start from the stored article rather than a possibly stale row.
        this.articleSrv.search_by_id(a.id)
            .pipe(
                map(res => res?.success && res.data ? res.data : a),
                switchMap(fresh => this.articleSrv.update(a.id, withStatus(fresh, t.to))),
                switchMap(() => this.articleSrv.search_by_id(a.id)),
                finalize(() => this.setBusy(a.id, null)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    const saved = res?.success && res.data ? res.data : { ...a, status: t.to };
                    this.toastSrv.success(saved.title, t.done);
                    if (this.selected?.id === a.id) this.selected = saved;
                    this.load();
                },
                // The global HTTP error toast reports the failure; the article keeps its status.
                error: () => undefined,
            });
    }

    private delete(a: Article): void {
        this.setBusy(a.id, 'delete');
        this.articleSrv.delete(a.id)
            .pipe(finalize(() => this.setBusy(a.id, null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(a.title, 'Article deleted');
                    if (this.selected?.id === a.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.load();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    private setBusy(id: string, value: ArticleStatus | 'delete' | null): void {
        const next = new Map(this.busy);
        if (value === null) next.delete(id);
        else next.set(id, value);
        this.busy = next;
    }

    private shortDate(iso: string): string {
        const d = parseIsoDate(iso);
        return d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : iso;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the article API enforces.
        this.canCreate = can(Permissions.Cms.ArticleCreate);
        this.canUpdate = can(Permissions.Cms.ArticleUpdate);
        this.canDelete = can(Permissions.Cms.ArticleDelete);
    }
    // #endregion
}
