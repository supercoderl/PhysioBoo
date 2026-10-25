import { DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, map, Observable, of, Subject, switchMap } from "rxjs";
import { PagedResponse } from "../../../../shared/types/common";

export type ReportSectionState = 'idle' | 'loading' | 'ready' | 'error' | 'forbidden';

/** Turns a backend envelope into its data, failing the stream when the API reports `success: false`. */
export function unwrap<T>() {
    return map((res: PagedResponse<T>) => {
        if (!res.success) throw new Error('Request was not successful');
        return res.data;
    });
}

/**
 * One independently loading block of the report. A new `load` cancels the previous request (switchMap), so a slow
 * response for an old filter can never overwrite a newer one. `loadedKey` records which filter the data belongs to.
 */
export class ReportSection<T> {
    readonly state = signal<ReportSectionState>('idle');
    readonly data = signal<T | null>(null);
    readonly retrying = signal(false);
    loadedKey: string | null = null;
    /** The key of the latest load, whether or not it has finished yet. */
    requestedKey: string | null = null;

    private readonly trigger$ = new Subject<{ key: string; retry: boolean }>();

    constructor(private readonly fetch: () => Observable<T>, destroyRef: DestroyRef) {
        this.trigger$.pipe(
            switchMap(({ key, retry }) =>
                this.fetch().pipe(
                    map(data => ({ ok: true as const, key, data })),
                    catchError(err => of({ ok: false as const, forbidden: err?.status === 403 })),
                    finalize(() => this.retrying.set(false)),
                )),
            takeUntilDestroyed(destroyRef),
        ).subscribe(result => {
            if (result.ok) {
                this.data.set(result.data);
                this.loadedKey = result.key;
                this.state.set('ready');
            } else {
                this.state.set(result.forbidden ? 'forbidden' : 'error');
            }
        });
    }

    /** Starts loading for `key` (the serialised filter). Previous data is dropped so it is never shown under a new filter. */
    load(key: string): void {
        this.data.set(null);
        this.loadedKey = null;
        this.requestedKey = key;
        this.state.set('loading');
        this.trigger$.next({ key, retry: false });
    }

    /** Loads only if this block has not already been requested for `key` (lazy tabs). */
    ensure(key: string): void {
        if (this.requestedKey !== key) this.load(key);
    }

    /** Re-runs the failed request in place: the error block stays and shows its "retrying" state. */
    retry(key: string): void {
        this.retrying.set(true);
        this.trigger$.next({ key, retry: true });
    }
}
