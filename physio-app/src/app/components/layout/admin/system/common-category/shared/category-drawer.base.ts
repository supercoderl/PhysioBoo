import { DestroyRef, Directive, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { Observable, Subscription, finalize } from "rxjs";
import { DialogService } from "../../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { PagedResponse } from "../../../../../../shared/types/common";

/** The part of each catalog service the drawer uses. */
export interface CategoryDrawerService<T> {
    search_by_id(id: string): Observable<PagedResponse<T | null>>;
    /** 201 with `{ success, data: id }`. */
    create(payload: any): Observable<PagedResponse<string>>;
    /** 204 with no body. */
    update(id: string, payload: any): Observable<unknown>;
}

/**
 * Create/edit logic shared by the Common Category drawers: loads the record when opened for an id, resets to
 * defaults for a new one, saves through create/update once (no double submit), and reports the outcome.
 * HTTP failures are toasted by the interceptor; the form keeps what was entered.
 */
@Directive()
export abstract class CategoryDrawerBase<T> implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    /** Pages pass the user's delete permission; the master-data host doesn't, and keeps its Delete button. */
    @Input() canDelete = true;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<void>();
    @Output() delete = new EventEmitter<string>();

    abstract readonly form: FormGroup;
    /** Singular noun for toasts, e.g. 'supplier'. */
    protected abstract readonly noun: string;
    protected abstract readonly service: CategoryDrawerService<T>;

    loading = false;
    loadFailed = false;
    saving = false;

    protected readonly toastSrv = inject(ToastService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private detailSub?: Subscription;
    // #endregion

    // #region Hooks for each drawer
    /** Form values for a new record. */
    protected abstract defaults(): Record<string, any>;

    /** Form values for an existing record. */
    protected abstract toFormValue(item: T): Record<string, any>;

    /** Request body from the raw form value; coerce numbers and trim text here. */
    protected toPayload(raw: Record<string, any>): Record<string, any> {
        return raw;
    }
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['isOpen'] && !changes['currentId']) return;
        if (!this.isOpen) {
            this.detailSub?.unsubscribe();
            return;
        }

        if (this.currentId) {
            this.loadDetail();
        } else {
            this.detailSub?.unsubscribe();
            this.loading = false;
            this.loadFailed = false;
            this.form.enable();
            this.form.reset(this.defaults());
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.isOpen) this.requestClose();
    }
    // #endregion

    // #region Methods
    get isEdit(): boolean {
        return !!this.currentId;
    }

    loadDetail(): void {
        const id = this.currentId;
        if (!id) return;

        this.detailSub?.unsubscribe();
        this.loading = true;
        this.loadFailed = false;
        this.form.reset(this.defaults());
        this.form.disable();

        this.detailSub = this.service.search_by_id(id)
            .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res.success || !res.data) {
                        this.loadFailed = true;
                        return;
                    }
                    this.form.enable();
                    this.form.reset({ ...this.defaults(), ...this.toFormValue(res.data) });
                },
                error: () => this.loadFailed = true
            });
    }

    save(): void {
        if (this.saving || this.loading || this.loadFailed) return;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastSrv.error('Check the highlighted fields and try again.', 'Not saved');
            return;
        }

        const payload = this.toPayload(this.form.getRawValue());
        const id = this.currentId;
        const request$: Observable<unknown> = id ? this.service.update(id, payload) : this.service.create(payload);

        this.saving = true;
        request$
            .pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    // Update answers 204 with no body; only an explicit `success: false` is a failure.
                    if ((res as PagedResponse<unknown> | null)?.success === false) {
                        this.toastSrv.error(`The ${this.noun} was not saved. Please try again.`);
                        return;
                    }
                    this.toastSrv.success(`${this.capitalize(this.noun)} ${id ? 'updated' : 'created'}.`);
                    this.form.markAsPristine();
                    this.saveSuccess.emit();
                },
                error: () => undefined
            });
    }

    /** Header close, Cancel and Escape: confirm before dropping unsaved changes. */
    requestClose(): void {
        if (this.saving) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    discard(): void {
        if (this.saving) return;
        this.detailSub?.unsubscribe();
        this.form.markAsPristine();
        this.close.emit();
    }

    onDelete(): void {
        if (this.currentId && this.canDelete && !this.saving) this.delete.emit(this.currentId);
    }

    /** Text fields: trimmed, empty becomes null. */
    protected text(value: unknown): string | null {
        const s = typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value);
        return s ? s : null;
    }

    /** Number inputs hand back strings; empty becomes `fallback` (null for optional numbers). */
    protected num(value: unknown, fallback: number | null = 0): number | null {
        if (value === null || value === undefined || value === '') return fallback;
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    private capitalize(value: string): string {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
    // #endregion
}
