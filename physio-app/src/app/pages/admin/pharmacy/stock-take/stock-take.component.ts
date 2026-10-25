import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { catchError, finalize, Observable, of, Subject, switchMap, takeUntil } from "rxjs";
import { DepartmentService } from "../../../../services/admin/department.service";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup, PaginationData } from "../../../../shared/types/common";
import { StockTake, StockTakeFilter, StockTakeKpis } from "../../../../shared/types/stock-take.types";
import { StockTakeAccess, StockTakeActionKey } from "./stock-take-actions";
import { StockTakeAssignDialogComponent } from "./stock-take-assign-dialog.component";
import { StockTakeDetailDrawerComponent } from "./stock-take-detail-drawer.component";
import { StockTakeDifferenceDialogComponent } from "./stock-take-difference-dialog.component";
import { StockTakeDrawerComponent } from "./stock-take-drawer.component";
import { StockTakeFilterBarComponent } from "./stock-take-filter-bar.component";
import { StockTakeKpiStripComponent } from "./stock-take-kpi-strip.component";
import { NoteDialogMode, StockTakeNoteDialogComponent } from "./stock-take-note-dialog.component";
import { StockTakeTableCardComponent } from "./stock-take-table-card.component";

type LoadState = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 10;

@Component({
    selector: 'admin-stock-take',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        StockTakeKpiStripComponent,
        StockTakeFilterBarComponent,
        StockTakeTableCardComponent,
        StockTakeDetailDrawerComponent,
        StockTakeDrawerComponent,
        StockTakeAssignDialogComponent,
        StockTakeNoteDialogComponent,
        StockTakeDifferenceDialogComponent,
    ],
    template: `
    <main class="flex flex-1 min-h-0 flex-col gap-5 pb-5">
      <header class="flex shrink-0 flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div class="min-w-0">
          <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Stock take</h1>
          <p class="text-sm text-secondary mt-1 mb-0 max-w-2xl">
            Count the medicine batches of a warehouse against system quantities. Submit the finished count for approval; approving it adjusts stock.
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button boo-button variant="secondary" (click)="refresh()" [loading]="listState() === 'loading'">
            <physio-icon name="refresh" [size]="16"></physio-icon>Refresh
          </button>
          <button *ngIf="access.export" boo-button variant="secondary" (click)="onExport()" [loading]="exporting()" [disabled]="exporting()">
            <physio-icon name="file-spreadsheet" [size]="16"></physio-icon>Export
          </button>
          <button *ngIf="access.create" boo-button variant="primary" (click)="openCreateDrawer()">
            <physio-icon name="plus" [size]="16"></physio-icon>New stock take
          </button>
        </div>
      </header>

      <stock-take-kpi-strip class="shrink-0" [kpis]="kpis()" [error]="kpiState() === 'error'" [retrying]="kpiRetrying()" (retry)="loadKpis(true)"></stock-take-kpi-strip>

      <stock-take-filter-bar
        class="shrink-0"
        [search]="search"
        [filter]="filter"
        [warehouses]="warehouses()"
        [departments]="departments()"
        (searchChange)="onSearchChange($event)"
        (filterChange)="onFilterChange($event)"
        (reset)="onReset()"
      ></stock-take-filter-bar>

      <section class="flex flex-1 min-h-[22rem] flex-col" aria-label="Stock take sessions" [attr.aria-busy]="listState() === 'loading'">
        <boo-error-state
          *ngIf="listState() === 'error'"
          appearance="panel"
          title="We couldn't load the stock takes"
          description="Check your connection and try again. Your filters are kept."
          (retry)="loadList()"
        ></boo-error-state>

        <ng-container *ngIf="listState() !== 'error'">
          <boo-empty-state
            *ngIf="listState() === 'ready' && !data()?.items?.length"
            appearance="panel"
            icon="clipboard-list"
            [title]="hasFilters ? 'No stock takes match your filters' : 'No stock takes yet'"
            [description]="hasFilters ? 'Try different filters, or clear them.' : 'Create a stock take to start counting a warehouse.'"
          >
            <button *ngIf="hasFilters" boo-button variant="secondary" (click)="onReset()">Reset filters</button>
            <button *ngIf="!hasFilters && access.create" boo-button variant="primary" (click)="openCreateDrawer()">New stock take</button>
          </boo-empty-state>

          <stock-take-table-card
            class="flex-1 min-h-0"
            *ngIf="listState() === 'loading' || data()?.items?.length"
            [data]="data()"
            [loading]="listState() === 'loading'"
            [busy]="acting()"
            [access]="access"
            (pageChange)="onPageChange($event)"
            (open)="openDetails($event)"
            (action)="onAction($event)"
          ></stock-take-table-card>
        </ng-container>
      </section>
    </main>

    <stock-take-detail-drawer [isOpen]="detailOpen()" [stockTake]="selected()" [access]="access" [busy]="acting()" (close)="detailOpen.set(false)" (action)="onAction($event)"></stock-take-detail-drawer>

    <stock-take-drawer [isOpen]="drawerOpen()" [stockTake]="selected()" [warehouses]="warehouses()" [departments]="departments()" (close)="drawerOpen.set(false)" (saveSuccess)="onDrawerSaved()"></stock-take-drawer>

    <stock-take-assign-dialog [isOpen]="assignOpen()" [code]="selected()?.code ?? ''" [busy]="acting()" (close)="assignOpen.set(false)" (confirm)="onAssignConfirm($event.assignedTo)"></stock-take-assign-dialog>

    <stock-take-note-dialog [isOpen]="noteOpen()" [mode]="noteMode()" [busy]="acting()" (close)="noteOpen.set(false)" (confirm)="onNoteConfirm($event)"></stock-take-note-dialog>

    <stock-take-difference-dialog [isOpen]="differenceOpen()" [stockTake]="selected()" (close)="differenceOpen.set(false)"></stock-take-difference-dialog>
  `,
})
export class AdminStockTakeComponent implements OnInit, OnDestroy {
    private readonly srv = inject(StockTakeService);
    private readonly departmentSrv = inject(DepartmentService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);
    private readonly dialogSrv = inject(DialogService);
    private readonly router = inject(Router);

    readonly access: StockTakeAccess = {
        create: this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeCreate),
        update: this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeUpdate),
        delete: this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeDelete),
        approve: this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeApprove),
        reject: this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeReject),
        export: this.authSrv.hasPermission(Permissions.Pharmacy.StockTakeExport),
        openCounting: this.authSrv.hasPermission(Permissions.Pharmacy.MedicineInventoryCreate),
    };

    data = signal<PaginationData<StockTake> | null>(null);
    listState = signal<LoadState>('loading');
    kpis = signal<StockTakeKpis | null>(null);
    kpiState = signal<LoadState>('loading');
    kpiRetrying = signal(false);
    warehouses = signal<Lookup[]>([]);
    departments = signal<Lookup[]>([]);

    search = '';
    filter: StockTakeFilter = {};
    pageNumber = 1;

    selected = signal<StockTake | null>(null);
    detailOpen = signal(false);
    drawerOpen = signal(false);
    assignOpen = signal(false);
    noteOpen = signal(false);
    noteMode = signal<NoteDialogMode>('approve');
    differenceOpen = signal(false);
    /** A lifecycle call is in flight; every action is ignored until it ends. */
    acting = signal(false);
    exporting = signal(false);

    private readonly load$ = new Subject<void>();
    private readonly destroy$ = new Subject<void>();

    get hasFilters(): boolean {
        const f = this.filter;
        return !!this.search.trim() || !!(f.warehouseId || f.departmentId || f.status || f.dateFrom || f.dateTo);
    }

    ngOnInit(): void {
        // switchMap drops the response of a request that a newer search, filter or page change has superseded.
        this.load$.pipe(
            switchMap(() => {
                this.listState.set('loading');
                return this.srv.search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.search.trim(), filter: this.filter })
                    .pipe(catchError(() => of(null)));
            }),
            takeUntil(this.destroy$),
        ).subscribe(res => {
            if (!res?.success) {
                this.listState.set('error');
                return;
            }
            this.data.set(res.data);
            this.listState.set('ready');
        });

        this.loadKpis();
        this.loadList();
        this.srv.getWarehouses().pipe(catchError(() => of(null))).subscribe(res => { if (res?.success) this.warehouses.set(res.data); });
        this.departmentSrv.search({ pageNumber: 1, pageSize: 100 }).pipe(catchError(() => of(null))).subscribe(res => {
            if (res?.success) this.departments.set(res.data.items.map(d => ({ id: d.id, name: d.name })));
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // #region Loading
    loadList(): void {
        this.load$.next();
    }

    loadKpis(retry = false): void {
        if (retry) this.kpiRetrying.set(true);
        else this.kpiState.set('loading');

        this.srv.getKpis().subscribe({
            next: res => {
                this.kpiRetrying.set(false);
                if (res.success) {
                    this.kpis.set(res.data);
                    this.kpiState.set('ready');
                } else {
                    this.kpiState.set('error');
                }
            },
            error: () => {
                this.kpiRetrying.set(false);
                this.kpiState.set('error');
            },
        });
    }

    refresh(): void {
        this.loadList();
        this.loadKpis();
    }
    // #endregion

    // #region Filters and paging
    onSearchChange(search: string): void {
        if (search === this.search) return;
        this.search = search;
        this.pageNumber = 1;
        this.loadList();
    }

    onFilterChange(filter: StockTakeFilter): void {
        this.filter = filter;
        this.pageNumber = 1;
        this.loadList();
    }

    onReset(): void {
        this.search = '';
        this.filter = {};
        this.pageNumber = 1;
        this.loadList();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadList();
    }
    // #endregion

    // #region Actions
    openCreateDrawer(): void {
        this.selected.set(null);
        this.drawerOpen.set(true);
    }

    openDetails(item: StockTake): void {
        this.selected.set(item);
        this.detailOpen.set(true);
    }

    onDrawerSaved(): void {
        this.drawerOpen.set(false);
        this.refresh();
    }

    onAction({ key, item }: { key: StockTakeActionKey; item: StockTake }): void {
        if (this.acting()) return;
        this.detailOpen.set(false);
        this.selected.set(item);

        switch (key) {
            case 'edit':
                this.drawerOpen.set(true);
                break;
            case 'assign':
                this.assignOpen.set(true);
                break;
            case 'differences':
                this.differenceOpen.set(true);
                break;
            case 'count':
            case 'items':
                this.openCounting(item);
                break;
            case 'start':
                this.confirmStart(item);
                break;
            case 'complete':
                this.confirmComplete(item);
                break;
            case 'approve':
            case 'reject':
            case 'cancel':
                this.noteMode.set(key);
                this.noteOpen.set(true);
                break;
            case 'delete':
                this.dialogSrv.confirmDelete(() => this.perform(this.srv.delete(item.id), () => this.toastSrv.success(`${item.code} deleted`)), item.code);
                break;
        }
    }

    private openCounting(item: StockTake): void {
        this.router.navigate(['/admin/pharmacy/stock-take', item.id, 'count']);
    }

    private confirmStart(item: StockTake): void {
        this.dialogSrv.confirm(
            `Starting ${item.code} records the current system quantity of every active batch in ${item.warehouseName || 'the warehouse'} as the baseline to count against.`,
            () => this.perform(this.srv.start(item.id), () => {
                this.toastSrv.success(`${item.code} started`);
                if (this.access.openCounting) this.openCounting(item);
            }),
            'Start counting',
            'info',
            'Start counting',
        );
    }

    private confirmComplete(item: StockTake): void {
        this.acting.set(true);
        this.srv.getSummary(item.id).pipe(finalize(() => this.acting.set(false))).subscribe(res => {
            if (!res.success) return;
            const { remainingItems, totalItems } = res.data;
            if (remainingItems > 0) {
                this.toastSrv.error(`${remainingItems} of ${totalItems} items are not counted yet. Every item must be counted before ${item.code} can be submitted.`, 'Counting incomplete');
                return;
            }
            this.dialogSrv.confirm(
                `All ${totalItems} items of ${item.code} are counted. Submit it for approval? Counts can no longer be changed once submitted.`,
                () => this.perform(this.srv.complete(item.id), () => this.toastSrv.success(`${item.code} submitted for approval`)),
                'Submit for approval',
                'info',
                'Submit',
            );
        });
    }

    onAssignConfirm(assignedTo: string): void {
        const item = this.selected();
        if (!item) return;
        this.perform(this.srv.assignCounter(item.id, { assignedTo }), () => {
            this.toastSrv.success(`Counter assigned to ${item.code}`);
            this.assignOpen.set(false);
        });
    }

    onNoteConfirm(note: string): void {
        const item = this.selected();
        const mode = this.noteMode();
        if (!item) return;

        const request$ = mode === 'approve' ? this.srv.approve(item.id, note)
            : mode === 'reject' ? this.srv.reject(item.id, note)
                : this.srv.cancel(item.id, note);
        const messages: Record<NoteDialogMode, string> = {
            approve: `${item.code} approved — stock adjusted`,
            reject: `${item.code} rejected`,
            cancel: `${item.code} cancelled`,
        };

        this.perform(request$, () => {
            this.toastSrv.success(messages[mode]);
            this.noteOpen.set(false);
        });
    }

    onExport(): void {
        if (this.exporting()) return;
        this.exporting.set(true);
        this.srv.exportExcel(this.filter, this.search.trim()).pipe(finalize(() => this.exporting.set(false))).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stock-takes-${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            this.toastSrv.success('Stock takes exported');
        });
    }

    /** Runs one lifecycle call at a time, then reloads the list and overview. A failure keeps dialogs open for a retry. */
    private perform(request$: Observable<unknown>, onSuccess: () => void): void {
        if (this.acting()) return;
        this.acting.set(true);
        request$.pipe(finalize(() => this.acting.set(false))).subscribe(() => {
            onSuccess();
            this.refresh();
        });
    }
    // #endregion
}
