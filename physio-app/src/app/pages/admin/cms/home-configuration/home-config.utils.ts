import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BooInlineErrorState } from '@physioboo/ui';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { PagedRequest, PagedResponse, PaginationData } from '../../../../shared/types/common';
import { PHYSIO_ICON_NAMES } from '../../../../shared/icons/icon-names';

export type LoadState = 'loading' | 'ready' | 'forbidden' | 'failed';
export type RowBusy = 'toggle' | 'delete';

/** Home page lists are short; one page this size holds the whole list so it can be reordered. */
export const COLLECTION_PAGE_SIZE = 100;

/** Server limits (FluentValidation rules on the home settings and home content commands). */
export const LIMITS = {
    hospitalName: 200,
    tagLine: 500,
    welcomeMessage: 1000,
    contactPhone: 20,
    contactEmail: 100,
    address: 500,
    bannerTitle: 150,
    bannerSubtitle: 300,
    buttonText: 60,
    url: 1000,
    featureTitle: 100,
    featureDescription: 500,
    patientName: 150,
    comment: 2000,
} as const;

export const FEATURE_ICON_NAMES: string[] = [...PHYSIO_ICON_NAMES].sort();

export const RATING_OPTIONS = [5, 4, 3, 2, 1].map(value => ({ value, label: `${value} ${value === 1 ? 'star' : 'stars'}` }));

/** Whole number, 1 or more: the order every home list is sorted by. */
export const POSITION_PATTERN = /^[1-9]\d*$/;

interface Row {
    id: string;
    active: boolean;
}

export interface CollectionConfig<T extends Row, TBody> {
    search: (request: PagedRequest<{ active: boolean | null }>) => Observable<PagedResponse<PaginationData<T>>>;
    update: (id: string, body: TBody) => Observable<unknown>;
    remove: (id: string) => Observable<unknown>;
    sort: string;
    /** PATCH body that flips `active`. */
    toggleBody: (item: T, active: boolean) => TBody;
    /** PATCH body that moves an item; omit when the list has no manual order. */
    orderBody?: (item: T, order: number) => TBody;
    orderOf?: (item: T) => number;
}

/**
 * One home page list (banners, features or testimonials): loading, visibility, order and delete.
 * Each change is saved on its own request; on failure the global HTTP error toast explains why and the list is put
 * back as the server has it.
 */
export class HomeCollection<T extends Row, TBody> {
    items: T[] = [];
    total = 0;
    state: LoadState = 'loading';
    /** A list is on screen and a later refresh of it failed. */
    refreshState: BooInlineErrorState = 'default';
    refreshFailed = false;
    busy = new Map<string, RowBusy>();
    reordering = false;
    /** The list has loaded at least once. */
    hasData = false;

    private readonly load$ = new Subject<void>();

    constructor(private readonly config: CollectionConfig<T, TBody>, destroyRef: DestroyRef) {
        // switchMap drops a response the user has already refreshed past.
        this.load$
            .pipe(
                switchMap(() => this.config.search({
                    pageNumber: 1,
                    pageSize: COLLECTION_PAGE_SIZE,
                    search: '',
                    sort: this.config.sort,
                    filter: { active: null },
                }).pipe(
                    map(res => ({ res, err: null as HttpErrorResponse | null })),
                    catchError((err: HttpErrorResponse) => of({ res: null, err })),
                )),
                takeUntilDestroyed(destroyRef),
            )
            .subscribe(({ res, err }) => {
                if (err || !res?.success || !res.data) {
                    const kind: LoadState = err?.status === 403 ? 'forbidden' : 'failed';
                    if (this.hasData && kind === 'failed') {
                        this.refreshFailed = true;
                        this.refreshState = this.refreshState === 'retrying' ? 'failed' : 'default';
                        this.state = 'ready';
                    } else {
                        this.state = kind;
                    }
                    return;
                }
                this.items = res.data.items ?? [];
                this.total = res.data.totalCount ?? this.items.length;
                this.state = 'ready';
                this.hasData = true;
                this.refreshFailed = false;
                this.refreshState = 'default';
            });
    }

    get activeCount(): number {
        return this.items.filter(i => i.active).length;
    }

    /** More items exist than one page holds, so manual ordering is off. */
    get truncated(): boolean {
        return this.total > this.items.length;
    }

    get canReorder(): boolean {
        return !!this.config.orderBody && !this.truncated && this.items.length > 1;
    }

    /** The order a newly added item gets so it lands at the end. */
    get nextOrder(): number {
        const orderOf = this.config.orderOf;
        if (!orderOf || !this.items.length) return 1;
        return Math.max(...this.items.map(orderOf)) + 1;
    }

    load(): void {
        if (this.refreshFailed) this.refreshState = 'retrying';
        else if (!this.hasData) this.state = 'loading';
        this.load$.next();
    }

    isBusy(item: T): boolean {
        return this.reordering || this.busy.has(item.id);
    }

    toggle(item: T, done: (active: boolean) => void): void {
        if (this.isBusy(item)) return;
        const active = !item.active;
        this.setBusy(item.id, 'toggle');
        this.config.update(item.id, this.config.toggleBody(item, active))
            .pipe(finalize(() => this.setBusy(item.id, null)))
            .subscribe({
                next: () => {
                    this.items = this.items.map(i => i.id === item.id ? { ...i, active } : i);
                    done(active);
                },
                // The global HTTP error toast reports the failure; the row keeps its state.
                error: () => undefined,
            });
    }

    /**
     * Moves an item one place up or down, then renumbers the list 1…n so duplicate or gapped orders settle.
     * Only items whose number changes are saved. Returns false when the move isn't possible.
     */
    move(item: T, delta: -1 | 1, done: () => void): boolean {
        const orderBody = this.config.orderBody;
        const orderOf = this.config.orderOf;
        if (!orderBody || !orderOf || !this.canReorder || this.reordering || this.busy.size) return false;
        const from = this.items.findIndex(i => i.id === item.id);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= this.items.length) return false;

        const next = [...this.items];
        [next[from], next[to]] = [next[to], next[from]];
        const changes = next
            .map((x, i) => ({ x, order: i + 1 }))
            .filter(c => orderOf(c.x) !== c.order);
        if (!changes.length) return false;

        const before = this.items;
        // Show the new order straight away; the requests follow.
        this.items = next.map((x, i) => this.withOrder(x, i + 1));
        this.reordering = true;
        forkJoin(changes.map(c => this.config.update(c.x.id, orderBody(c.x, c.order))))
            .pipe(finalize(() => this.reordering = false))
            .subscribe({
                next: () => done(),
                error: () => {
                    // Some writes may have landed; read the order back rather than guess.
                    this.items = before;
                    this.load();
                },
            });
        return true;
    }

    remove(item: T, done: () => void): void {
        if (this.isBusy(item)) return;
        this.setBusy(item.id, 'delete');
        this.config.remove(item.id)
            .pipe(finalize(() => this.setBusy(item.id, null)))
            .subscribe({
                next: () => {
                    this.items = this.items.filter(i => i.id !== item.id);
                    this.total = Math.max(0, this.total - 1);
                    done();
                },
                error: () => undefined,
            });
    }

    private withOrder(item: T, order: number): T {
        return 'order' in item ? { ...item, order } : item;
    }

    private setBusy(id: string, value: RowBusy | null): void {
        const next = new Map(this.busy);
        if (value === null) next.delete(id);
        else next.set(id, value);
        this.busy = next;
    }
}

/** "3 of 4 active", or a plain count when nothing is hidden. */
export function activeSummary(active: number, total: number, noun: string, plural: string): string {
    if (!total) return `No ${plural}`;
    if (active === total) return `${total} ${total === 1 ? noun : plural}, all active`;
    return `${active} of ${total} active`;
}
