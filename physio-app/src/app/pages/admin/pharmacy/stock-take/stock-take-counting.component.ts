import { Component, computed, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInputComponent, BooPaginationComponent } from '@physioboo/ui';
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from "rxjs";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { formatStockTakeValue, StockTake, StockTakeCategoryNode, StockTakeItem, StockTakeSummary, stockTakeStatusLabel } from "../../../../shared/types/stock-take.types";
import { StockTakeCategoryTreeComponent } from "./stock-take-category-tree.component";
import { StockTakeCountingHeaderComponent } from "./stock-take-counting-header.component";
import { buildRow, CountEdit, CountFilter, CountingStats, CountRow, isUuid, parseCount, sameAsStored } from "./stock-take-counting.model";
import { StockTakeCountingTableComponent } from "./stock-take-counting-table.component";
import { HasUnsavedChanges } from "./stock-take-counting.guard";

type PageState = 'loading' | 'ready' | 'error' | 'missing';

const PAGE_SIZE = 25;
const LIST_ROUTE = '/admin/pharmacy/stock-take';

@Component({
    selector: 'admin-stock-take-counting',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInputComponent,
        BooPaginationComponent,
        StockTakeCountingHeaderComponent,
        StockTakeCategoryTreeComponent,
        StockTakeCountingTableComponent,
    ],
    template: `
    <main class="flex flex-1 flex-col gap-4 pb-5 lg:min-h-0">
      <!-- Loading -->
      <div *ngIf="state() === 'loading'" role="status" aria-label="Loading stock take" class="space-y-4 animate-pulse">
        <div class="h-40 rounded-2 bg-gray-200/70"></div>
        <div class="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
          <div class="h-64 rounded-2 bg-gray-200/70"></div>
          <div class="h-96 rounded-2 bg-gray-200/70"></div>
        </div>
      </div>

      <!-- Error / not found -->
      <ng-container *ngIf="state() === 'error' || state() === 'missing'">
        <boo-error-state *ngIf="state() === 'error'" appearance="panel" title="We couldn't load this stock take"
          [description]="errorMessage()" (retry)="load()"></boo-error-state>
        <boo-empty-state *ngIf="state() === 'missing'" appearance="panel" icon="clipboard-list" title="Stock take not found"
          description="The link may be wrong, or the session may have been deleted."></boo-empty-state>
        <div class="flex justify-center">
          <button boo-button variant="secondary" (click)="back()"><physio-icon name="arrow-left" [size]="16"></physio-icon>Back to stock takes</button>
        </div>
      </ng-container>

      <ng-container *ngIf="state() === 'ready' && stockTake() as st">
        <div class="shrink-0">
          <stock-take-counting-header
            [stockTake]="st"
            [stats]="stats()"
            [valueDifference]="summary()?.valueDifference ?? null"
            [dirtyCount]="dirtyCount()"
            [saving]="saving()"
            [submitting]="submitting()"
            [editable]="editable()"
            [submitBlocker]="submitBlocker()"
            (back)="back()"
            (save)="save()"
            (submit)="submit()"
          ></stock-take-counting-header>
        </div>

        <div class="shrink-0 space-y-2 empty:hidden" aria-live="polite">
          <p *ngIf="st.status === 'Rejected' && st.rejectionReason" class="m-0 px-4 py-3 rounded-2 bg-rose-50 border border-rose-100 text-sm text-rose-700">
            <span class="font-semibold">Rejected:</span> {{ st.rejectionReason }}
          </p>
          <p *ngIf="readOnlyNotice()" class="m-0 px-4 py-3 rounded-2 bg-gray-100 border border-borderGray/60 text-sm text-secondary flex items-start gap-2">
            <physio-icon name="lock" [size]="16" class="mt-0.5 flex-none"></physio-icon><span>{{ readOnlyNotice() }}</span>
          </p>
          <p *ngIf="saveFailed()" role="alert" class="m-0 px-4 py-3 rounded-2 bg-rose-50 border border-rose-100 text-sm text-rose-700">
            Your changes were not saved. They are still here — check the connection and choose Save counts again.
          </p>
        </div>

        <boo-empty-state *ngIf="!items().length" appearance="panel" icon="package-search" title="No items in this session"
          [description]="st.status === 'Draft' ? 'Items are listed once counting starts.' : 'No active medicine batches were recorded when counting started.'"></boo-empty-state>

        <div *ngIf="items().length" class="grid grid-cols-1 gap-4 lg:min-h-[32rem] lg:flex-1 lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <stock-take-category-tree [categories]="categories()" [activeId]="categoryId()" [total]="stats().total" [countedTotal]="stats().counted"
            (select)="onSelectCategory($event?.id ?? null)"></stock-take-category-tree>

          <section aria-label="Items to count" class="flex min-h-0 min-w-0 flex-col bg-surface border border-borderGray/60 rounded-2">
            <div class="shrink-0 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <boo-input label="Search medicine, code, batch or barcode" [maxlength]="100" [ngModel]="query()" (ngModelChange)="onQuery($event)">
                <physio-icon endfix name="search" [size]="16" class="text-gray-500"></physio-icon>
              </boo-input>
              <boo-input *ngIf="editable()" label="Scan a barcode, then press Enter" [maxlength]="64" [ngModel]="barcode()" (ngModelChange)="barcode.set($event)"
                (keydown.enter)="onScan()">
                <physio-icon endfix name="scan-barcode" [size]="16" class="text-gray-500"></physio-icon>
              </boo-input>
            </div>

            <div class="shrink-0 px-4 pb-3 flex items-center justify-between gap-3 flex-wrap">
              <div role="group" aria-label="Show items" class="inline-flex rounded-1.5 border border-borderGray overflow-hidden">
                <button *ngFor="let option of filterOptions" type="button" (click)="onFilter(option.value)" [attr.aria-pressed]="filter() === option.value"
                  class="px-3 h-9 text-sm font-medium border-r border-borderGray last:border-r-0 transition-colors"
                  [ngClass]="filter() === option.value ? 'bg-primarySoft text-primaryDeep' : 'bg-surface text-regular hover:bg-gray-50'">
                  {{ option.label }} <span class="tabular-nums text-secondary">{{ filterCounts()[option.value] | number }}</span>
                </button>
              </div>
              <p class="m-0 text-xs text-secondary" role="status">{{ scanMessage() }}</p>
            </div>

            <boo-empty-state *ngIf="!pageRows().length" icon="search" title="No items match" description="Change the search, category or filter to see more items."></boo-empty-state>

            <stock-take-counting-table *ngIf="pageRows().length" class="min-h-0 flex-1" [rows]="pageRows()" [editable]="editable()"
              (qtyChange)="onQty($event.id, $event.text)" (reasonChange)="onReason($event.id, $event.reason)" (notesChange)="onNotes($event.id, $event.notes)"></stock-take-counting-table>

            <div *ngIf="filteredRows().length" class="shrink-0 px-4 py-3 border-t border-borderGray/60 flex items-center justify-between gap-3 flex-wrap">
              <p class="m-0 text-xs text-secondary tabular-nums">Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ filteredRows().length | number }}</p>
              <boo-pagination *ngIf="totalPages() > 1" appearance="labelled" [page]="page()" [totalPages]="totalPages()" (pageChange)="page.set($event)"></boo-pagination>
            </div>
          </section>
        </div>
      </ng-container>
    </main>
  `,
})
export class AdminStockTakeCountingComponent implements OnInit, OnDestroy, HasUnsavedChanges {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly srv = inject(StockTakeService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);
    private readonly dialogSrv = inject(DialogService);

    @ViewChild(StockTakeCountingTableComponent) private table?: StockTakeCountingTableComponent;

    readonly canSave = this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeUpdate);
    readonly filterOptions: { label: string; value: CountFilter }[] = [
        { label: 'All', value: 'all' },
        { label: 'To count', value: 'todo' },
        { label: 'Differences', value: 'differences' },
    ];

    state = signal<PageState>('loading');
    errorMessage = signal('Check your connection and try again.');
    stockTake = signal<StockTake | null>(null);
    items = signal<StockTakeItem[]>([]);
    categories = signal<StockTakeCategoryNode[]>([]);
    summary = signal<StockTakeSummary | null>(null);

    /** Unsaved input by item id; an entry exists only while it differs from the stored item. */
    edits = signal<ReadonlyMap<string, CountEdit>>(new Map());
    categoryId = signal<string | null>(null);
    query = signal('');
    barcode = signal('');
    filter = signal<CountFilter>('all');
    page = signal(1);
    scanMessage = signal('');

    saving = signal(false);
    saveFailed = signal(false);
    submitting = signal(false);

    private editSeq = 0;
    private readonly today = new Date().toLocaleDateString('en-CA');
    private readonly destroy$ = new Subject<void>();

    // #region Derived state
    editable = computed(() => this.stockTake()?.status === 'Counting' && this.canSave);

    private readonly itemsById = computed(() => new Map(this.items().map(i => [i.id, i])));
    private readonly rows = computed(() => this.items().map(i => buildRow(i, this.edits().get(i.id), this.today)));

    stats = computed<CountingStats>(() => {
        const rows = this.rows();
        const counted = rows.filter(r => r.counted).length;
        return {
            total: rows.length,
            counted,
            remaining: rows.length - counted,
            over: rows.filter(r => (r.difference ?? 0) > 0).length,
            short: rows.filter(r => (r.difference ?? 0) < 0).length,
        };
    });

    dirtyCount = computed(() => this.edits().size);

    private readonly scopedRows = computed(() => {
        const catId = this.categoryId();
        const q = this.query().trim().toLowerCase();
        return this.rows().filter(r =>
            (!catId || r.item.categoryId === catId)
            && (!q || [r.item.itemName, r.item.itemCode, r.item.batchNo, r.item.barcode].some(v => v?.toLowerCase().includes(q))));
    });

    filterCounts = computed<Record<CountFilter, number>>(() => {
        const rows = this.scopedRows();
        return {
            all: rows.length,
            todo: rows.filter(r => !r.counted).length,
            differences: rows.filter(r => !!r.difference).length,
        };
    });

    filteredRows = computed<CountRow[]>(() => {
        const rows = this.scopedRows();
        switch (this.filter()) {
            case 'todo': return rows.filter(r => !r.counted);
            case 'differences': return rows.filter(r => !!r.difference);
            default: return rows;
        }
    });

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRows().length / PAGE_SIZE)));
    pageRows = computed(() => {
        const start = (Math.min(this.page(), this.totalPages()) - 1) * PAGE_SIZE;
        return this.filteredRows().slice(start, start + PAGE_SIZE);
    });
    rangeStart = computed(() => (this.filteredRows().length ? (Math.min(this.page(), this.totalPages()) - 1) * PAGE_SIZE + 1 : 0));
    rangeEnd = computed(() => Math.min(this.rangeStart() + PAGE_SIZE - 1, this.filteredRows().length));

    /** Submitting needs every item counted and saved, as the API refuses to complete a session with uncounted items. */
    submitBlocker = computed(() => {
        if (this.dirtyCount()) return 'Save your changes before submitting.';
        const remaining = this.items().filter(i => !i.isCounted).length;
        return remaining ? `${remaining} ${remaining === 1 ? 'item is' : 'items are'} not counted yet.` : '';
    });

    readOnlyNotice = computed(() => {
        const st = this.stockTake();
        if (!st) return '';
        if (st.status !== 'Counting') {
            return st.status === 'Draft'
                ? 'This session has not started. Start counting from the stock take list to enter counts.'
                : `This session is ${stockTakeStatusLabel(st.status).toLowerCase()}, so its counts are read-only.`;
        }
        return this.canSave ? '' : 'You can view these counts but not change them; saving needs the stock take update permission.';
    });
    // #endregion

    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // #region Loading
    load(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!isUuid(id)) {
            this.state.set('missing');
            return;
        }

        this.state.set('loading');
        this.edits.set(new Map());
        this.saveFailed.set(false);

        forkJoin({
            stockTake: this.srv.getById(id),
            items: this.srv.getItems(id),
            categories: this.srv.getCategories(id).pipe(catchError(() => of(null))),
            summary: this.srv.getSummary(id).pipe(catchError(() => of(null))),
        }).subscribe({
            next: ({ stockTake, items, categories, summary }) => {
                if (!stockTake.success || !items.success) {
                    this.errorMessage.set('Check your connection and try again.');
                    this.state.set('error');
                    return;
                }
                if (!stockTake.data) {
                    this.state.set('missing');
                    return;
                }
                this.stockTake.set(stockTake.data);
                this.items.set(items.data);
                this.categories.set(categories?.success ? categories.data : []);
                this.summary.set(summary?.success ? summary.data : null);
                this.categoryId.set(null);
                this.query.set('');
                this.filter.set('all');
                this.page.set(1);
                this.state.set('ready');
            },
            error: err => {
                this.errorMessage.set(err?.status === 403 ? 'You do not have access to this stock take.' : 'Check your connection and try again.');
                this.state.set('error');
            },
        });
    }

    /** Re-reads what a save can change: the session itself, category progress and the saved totals. */
    private refreshAfterSave(id: string): void {
        this.srv.getById(id).pipe(catchError(() => of(null))).subscribe(res => { if (res?.success && res.data) this.stockTake.set(res.data); });
        this.srv.getCategories(id).pipe(catchError(() => of(null))).subscribe(res => { if (res?.success) this.categories.set(res.data); });
        this.srv.getSummary(id).pipe(catchError(() => of(null))).subscribe(res => { if (res?.success) this.summary.set(res.data); });
    }
    // #endregion

    // #region Filtering
    onSelectCategory(id: string | null): void {
        this.categoryId.set(id);
        this.page.set(1);
    }

    onQuery(value: string | null): void {
        this.query.set(value ?? '');
        this.page.set(1);
    }

    onFilter(value: CountFilter): void {
        this.filter.set(value);
        this.page.set(1);
    }

    /** Jumps to the scanned batch; when several batches share a barcode they are all listed instead. */
    onScan(): void {
        const code = this.barcode().trim();
        if (!code) return;
        this.barcode.set('');

        const matches = this.items().filter(i => i.barcode === code);
        if (!matches.length) {
            this.scanMessage.set(`No batch with barcode ${code} in this session.`);
            return;
        }

        this.categoryId.set(null);
        this.filter.set('all');
        if (matches.length === 1) {
            this.query.set('');
            const index = this.filteredRows().findIndex(r => r.item.id === matches[0].id);
            this.page.set(Math.floor(index / PAGE_SIZE) + 1);
            this.scanMessage.set(`Found ${matches[0].itemName}.`);
        } else {
            this.query.set(code);
            this.page.set(1);
            this.scanMessage.set(`${matches.length} batches share barcode ${code}.`);
        }
        const first = this.filteredRows()[0]?.item.id;
        const target = matches.length === 1 ? matches[0].id : first;
        if (target) setTimeout(() => this.table?.focusQty(target));
    }
    // #endregion

    // #region Editing
    onQty(id: string, text: string | null): void {
        this.edit(id, e => ({ ...e, qty: text ?? '' }));
    }

    onReason(id: string, reason: string | null): void {
        this.edit(id, e => ({ ...e, reason }));
    }

    onNotes(id: string, notes: string | null): void {
        this.edit(id, e => ({ ...e, notes: notes ?? '' }));
    }

    private edit(id: string, change: (edit: CountEdit) => CountEdit): void {
        const item = this.itemsById().get(id);
        if (!item || !this.editable()) return;

        const current = this.edits().get(id) ?? { qty: item.actualQty === null ? '' : String(item.actualQty), reason: item.reason, notes: item.notes ?? '', rev: 0 };
        const next = { ...change(current), rev: ++this.editSeq };

        // A reason only explains a difference.
        const qty = parseCount(next.qty).qty;
        if (qty !== null && qty === item.systemQty) next.reason = null;

        const edits = new Map(this.edits());
        if (sameAsStored(item, next)) edits.delete(id);
        else edits.set(id, next);
        this.edits.set(edits);
        this.saveFailed.set(false);
    }
    // #endregion

    // #region Save and submit
    save(): void {
        const st = this.stockTake();
        if (!st || !this.editable() || this.saving() || !this.dirtyCount()) return;

        const dirty = this.rows().filter(r => r.dirty);
        const invalid = dirty.filter(r => r.error);
        if (invalid.length) {
            this.toastSrv.error(`Fix ${invalid.length} ${invalid.length === 1 ? 'count' : 'counts'} before saving. Nothing was saved.`, 'Counts need attention');
            this.revealRow(invalid[0].item.id);
            return;
        }

        const snapshot = new Map(this.edits());
        const payload = dirty.map(r => ({
            itemId: r.item.id,
            actualQty: r.qty as number,
            reason: r.difference ? r.reason : null,
            notes: r.notes.trim() || null,
        }));

        this.saving.set(true);
        this.saveFailed.set(false);
        this.srv.updateItems(st.id, payload).pipe(finalize(() => this.saving.set(false))).subscribe({
            next: res => {
                if (!res.success) {
                    this.saveFailed.set(true);
                    return;
                }
                this.items.set(res.data);

                // Keep input typed while the request was running; drop what the server now holds.
                const byId = new Map(res.data.map(i => [i.id, i]));
                const left = new Map(this.edits());
                for (const [id, edit] of this.edits()) {
                    const saved = byId.get(id);
                    if (!saved || (snapshot.get(id)?.rev === edit.rev) || sameAsStored(saved, edit)) left.delete(id);
                }
                this.edits.set(left);

                this.toastSrv.success(`${payload.length} ${payload.length === 1 ? 'count' : 'counts'} saved`);
                this.refreshAfterSave(st.id);
            },
            error: () => this.saveFailed.set(true),
        });
    }

    submit(): void {
        const st = this.stockTake();
        if (!st || !this.editable() || this.submitBlocker() || this.saving() || this.submitting()) return;

        this.submitting.set(true);
        this.srv.getSummary(st.id).pipe(finalize(() => this.submitting.set(false))).subscribe(res => {
            if (!res.success) return;
            const s = res.data;
            if (s.remainingItems > 0) {
                this.toastSrv.error(`${s.remainingItems} of ${s.totalItems} items are not counted yet.`, 'Counting incomplete');
                this.summary.set(s);
                return;
            }
            this.dialogSrv.confirm(
                `Submit ${st.code} for approval? ${s.totalItems} items are counted: ${s.positiveDifferenceCount} over and ${s.negativeDifferenceCount} short of the system quantity, `
                + `a variance of ${formatStockTakeValue(s.valueDifference)} at cost. Counts cannot be changed after submitting.`,
                () => this.complete(st),
                'Submit for approval',
                'info',
                'Submit',
            );
        });
    }

    private complete(st: StockTake): void {
        if (this.submitting()) return;
        this.submitting.set(true);
        this.srv.complete(st.id).pipe(finalize(() => this.submitting.set(false))).subscribe(() => {
            this.toastSrv.success(`${st.code} submitted for approval`);
            this.router.navigate([LIST_ROUTE]);
        });
    }
    // #endregion

    // #region Navigation and unsaved changes
    back(): void {
        this.router.navigate([LIST_ROUTE]);
    }

    hasUnsavedChanges(): boolean {
        return this.dirtyCount() > 0;
    }

    confirmLeave(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.dialogSrv.confirm(
                `${this.dirtyCount()} unsaved ${this.dirtyCount() === 1 ? 'change' : 'changes'} will be lost if you leave this page.`,
                () => resolve(true),
                'Unsaved counts',
                'warning',
                'Leave without saving',
                'Keep counting',
                () => resolve(false),
            );
        });
    }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.hasUnsavedChanges()) event.preventDefault();
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            this.save();
        }
    }

    /** Shows the page that holds a row and puts the cursor in its count field. */
    private revealRow(id: string): void {
        this.categoryId.set(null);
        this.query.set('');
        this.filter.set('all');
        const index = this.filteredRows().findIndex(r => r.item.id === id);
        if (index >= 0) this.page.set(Math.floor(index / PAGE_SIZE) + 1);
        setTimeout(() => this.table?.focusQty(id));
    }
    // #endregion
}
