import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { catchError, finalize, Observable, of, Subject, switchMap, takeUntil } from "rxjs";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { CashierService } from "../../../../services/admin/cashier.service";
import { InsuranceCompanyService } from "../../../../services/admin/insurance-company.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    cashierRefundablePayments,
    CashierBillStatus,
    CashierDashboardStats,
    CashierInvoice,
    CashierPaymentSplit,
    CashierTransactionEvent,
} from "../../../../shared/types/cashier.types";
import { PagedResponse, PaginationData } from "../../../../shared/types/common";
import { CashierAdjustmentDialogComponent, CashierAdjustmentKind, CashierAdjustmentSubmit, CashierCompanyOption, CashierCompaniesState } from "./cashier-adjustment-dialog.component";
import { CashierBillListComponent } from "./cashier-bill-list.component";
import { CashierBillPanelComponent, CashierBillPermissions, CashierPaymentsState } from "./cashier-bill-panel.component";
import { CashierFilterBarComponent } from "./cashier-filter-bar.component";
import { CashierPaymentDialogComponent } from "./cashier-payment-dialog.component";
import { CashierPaymentsListComponent } from "./cashier-payments-list.component";
import { CashierRefundDialogComponent, CashierRefundSubmit } from "./cashier-refund-dialog.component";
import { CashierSummaryStripComponent } from "./cashier-summary-strip.component";

type LoadState = 'loading' | 'ready' | 'error';
type QueueTab = 'bills' | 'payments';
type MutationResponse = PagedResponse<CashierInvoice | null>;

const PAGE_SIZE = 12;
/** The API has no per-bill payments endpoint, so the bill panel reads from the latest transactions. */
const HISTORY_LIMIT = 100;
const WIDE_QUERY = '(min-width: 1280px)';

@Component({
    selector: 'admin-cashier',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        DrawerComponent,
        CashierSummaryStripComponent,
        CashierFilterBarComponent,
        CashierBillListComponent,
        CashierPaymentsListComponent,
        CashierBillPanelComponent,
        CashierPaymentDialogComponent,
        CashierRefundDialogComponent,
        CashierAdjustmentDialogComponent,
    ],
    template: `
    <main class="flex flex-1 min-h-0 flex-col gap-5 pb-5">
      <header class="flex shrink-0 flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div class="min-w-0">
          <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Cashier</h1>
          <p class="text-sm text-secondary mt-1 mb-0 max-w-2xl">
            Find a bill, review its charges and take payment. Refunds, discounts, insurance and voids are available per bill.
          </p>
        </div>
        <button boo-button variant="secondary" (click)="refreshAll()" [loading]="listState() === 'loading'">
          <physio-icon name="refresh" [size]="16"></physio-icon>Refresh
        </button>
      </header>

      <cashier-summary-strip class="shrink-0" [stats]="stats()" [error]="statsState() === 'error'" [retrying]="statsRetrying()" (retry)="loadStats(true)"></cashier-summary-strip>

      <div class="grid flex-1 min-h-[30rem] grid-cols-1 grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] gap-5">
        <div class="flex min-h-0 min-w-0 flex-col gap-4">
          <cashier-filter-bar
            class="shrink-0"
            [search]="search"
            [status]="status"
            [dateFrom]="dateFrom"
            [dateTo]="dateTo"
            (searchChange)="onSearchChange($event)"
            (statusChange)="onStatusChange($event)"
            (dateFromChange)="onDateFromChange($event)"
            (dateToChange)="onDateToChange($event)"
            (reset)="onReset()"
          ></cashier-filter-bar>

          <div *ngIf="canReadPayments" role="tablist" aria-label="Queue" class="inline-flex shrink-0 self-start gap-1 bg-gray-100 rounded-2 p-1">
            <button type="button" role="tab" id="cashier-tab-bills" [attr.aria-selected]="tab() === 'bills'" (click)="tab.set('bills')"
              class="px-4 h-9 rounded-1.5 text-sm font-semibold cursor-pointer transition-colors"
              [ngClass]="tab() === 'bills' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">Bills</button>
            <button type="button" role="tab" id="cashier-tab-payments" [attr.aria-selected]="tab() === 'payments'" (click)="tab.set('payments')"
              class="px-4 h-9 rounded-1.5 text-sm font-semibold cursor-pointer transition-colors"
              [ngClass]="tab() === 'payments' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">Recent payments</button>
          </div>

          <section *ngIf="tab() === 'bills'" class="flex flex-1 min-h-0 flex-col" aria-label="Bills" [attr.aria-busy]="listState() === 'loading'">
            <boo-error-state
              *ngIf="listState() === 'error'"
              appearance="panel"
              title="We couldn't load the bills"
              description="Check your connection and try again. Your filters are kept."
              (retry)="loadList()"
            ></boo-error-state>

            <ng-container *ngIf="listState() !== 'error'">
              <boo-empty-state
                *ngIf="listState() === 'ready' && !data()?.items?.length"
                appearance="panel"
                icon="receipt"
                [title]="hasFilters ? 'No bills match your filters' : 'No bills yet'"
                [description]="hasFilters ? 'Try a different bill number or MRN, or clear the filters.' : 'Bills raised from visits and orders appear here for payment.'"
              >
                <button *ngIf="hasFilters" boo-button variant="secondary" (click)="onReset()">Reset filters</button>
              </boo-empty-state>

              <cashier-bill-list
                class="flex-1 min-h-0"
                *ngIf="listState() === 'loading' || data()?.items?.length"
                [data]="data()"
                [loading]="listState() === 'loading'"
                [selectedId]="selected()?.id ?? null"
                (pageChange)="onPageChange($event)"
                (select)="selectBill($event)"
              ></cashier-bill-list>
            </ng-container>
          </section>

          <section *ngIf="tab() === 'payments'" class="boo-scrollbar flex-1 min-h-0 overflow-auto" aria-label="Recent payments">
            <cashier-payments-list
              [events]="history()"
              [loading]="historyState() === 'loading'"
              [error]="historyState() === 'error'"
              (open)="openFromPayment($event)"
              (retry)="loadHistory()"
            ></cashier-payments-list>
          </section>
        </div>

        <aside *ngIf="isWide()" aria-label="Selected bill" class="min-h-0">
          <ng-container *ngTemplateOutlet="panelTpl; context: { embedded: false }"></ng-container>
        </aside>
      </div>
    </main>

    <drawer *ngIf="!isWide()" [isOpen]="drawerOpen()" (close)="drawerOpen.set(false)">
      <div *ngIf="drawerOpen()" role="dialog" aria-modal="true" aria-labelledby="cashier-bill-title">
        <ng-container *ngTemplateOutlet="panelTpl; context: { embedded: true }"></ng-container>
      </div>
    </drawer>

    <ng-template #panelTpl let-embedded="embedded">
      <cashier-bill-panel
        class="h-full"
        [bill]="selected()"
        [payments]="billPayments()"
        [paymentsState]="historyState()"
        [permissions]="permissions"
        [embedded]="embedded"
        (collect)="paymentOpen.set(true)"
        (refund)="refundOpen.set(true)"
        (discount)="adjustKind.set('discount')"
        (insurance)="openInsurance()"
        (voidBill)="adjustKind.set('void')"
        (retryPayments)="loadHistory()"
        (close)="drawerOpen.set(false)"
      ></cashier-bill-panel>
    </ng-template>

    <cashier-payment-dialog
      [open]="paymentOpen()"
      [bill]="selected()"
      [busy]="busy()"
      (close)="paymentOpen.set(false)"
      (confirm)="onPayment($event)"
    ></cashier-payment-dialog>

    <cashier-refund-dialog
      [open]="refundOpen()"
      [bill]="selected()"
      [payments]="refundables()"
      [sourceState]="historyState()"
      [busy]="busy()"
      (close)="refundOpen.set(false)"
      (retry)="loadHistory()"
      (confirm)="onRefund($event)"
    ></cashier-refund-dialog>

    <cashier-adjustment-dialog
      [open]="adjustKind() !== null"
      [kind]="adjustKind()"
      [bill]="selected()"
      [companies]="companies()"
      [companiesState]="companiesState()"
      [busy]="busy()"
      (close)="adjustKind.set(null)"
      (confirm)="onAdjustment($event)"
    ></cashier-adjustment-dialog>
  `,
})
export class AdminCashierComponent implements OnInit, OnDestroy {
    private readonly cashierSrv = inject(CashierService);
    private readonly companySrv = inject(InsuranceCompanyService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);

    // #region Permissions (the route only guarantees billing:bill:read)
    readonly canReadPayments = this.authSrv.hasPermission(Permissions.Billing.PaymentRead);
    private readonly canListCompanies = this.authSrv.hasPermission(Permissions.Admin.InsuranceCompanyRead);
    readonly permissions: CashierBillPermissions = {
        collect: this.authSrv.hasPermission(Permissions.Billing.PaymentCreate),
        refund: this.authSrv.hasPermission(Permissions.Billing.PaymentRefund) && this.canReadPayments,
        discount: this.authSrv.hasPermission(Permissions.Billing.BillDiscountApply),
        insurance: this.authSrv.hasPermission(Permissions.Billing.BillInsuranceApply),
        void: this.authSrv.hasPermission(Permissions.Billing.BillVoid),
    };
    // #endregion

    stats = signal<CashierDashboardStats | null>(null);
    statsState = signal<LoadState>('loading');
    statsRetrying = signal(false);

    data = signal<PaginationData<CashierInvoice> | null>(null);
    listState = signal<LoadState>('loading');

    history = signal<CashierTransactionEvent[]>([]);
    historyState = signal<CashierPaymentsState>(this.canReadPayments ? 'loading' : 'unavailable');

    selected = signal<CashierInvoice | null>(null);
    tab = signal<QueueTab>('bills');
    drawerOpen = signal(false);
    isWide = signal(false);

    paymentOpen = signal(false);
    refundOpen = signal(false);
    adjustKind = signal<CashierAdjustmentKind | null>(null);
    /** One mutation at a time: guards double submits across every dialog. */
    busy = signal(false);

    companies = signal<CashierCompanyOption[]>([]);
    companiesState = signal<CashierCompaniesState>(this.canListCompanies ? 'loading' : 'unavailable');

    search = '';
    status: CashierBillStatus | null = null;
    dateFrom: string | null = null;
    dateTo: string | null = null;
    pageNumber = 1;

    billPayments = computed(() => {
        const id = this.selected()?.id;
        return id ? this.history().filter(e => e.invoiceId === id) : [];
    });
    refundables = computed(() => {
        const id = this.selected()?.id;
        return id ? cashierRefundablePayments(this.history(), id) : [];
    });

    private readonly load$ = new Subject<boolean>();
    private readonly destroy$ = new Subject<void>();
    private wideQuery?: MediaQueryList;
    private readonly onWideChange = (e: MediaQueryListEvent) => this.isWide.set(e.matches);

    get hasFilters(): boolean {
        return !!this.search.trim() || !!this.status || !!this.dateFrom || !!this.dateTo;
    }

    ngOnInit(): void {
        this.wideQuery = window.matchMedia(WIDE_QUERY);
        this.isWide.set(this.wideQuery.matches);
        this.wideQuery.addEventListener('change', this.onWideChange);

        // switchMap drops the response of a request that a newer search, filter or page change has superseded.
        this.load$.pipe(
            switchMap(silent => {
                if (!silent) this.listState.set('loading');
                return this.cashierSrv.searchInvoices({
                    search: this.search,
                    status: this.status,
                    dateFrom: this.dateFrom,
                    dateTo: this.dateTo,
                    pageNumber: this.pageNumber,
                    pageSize: PAGE_SIZE,
                }).pipe(catchError(() => of(null)));
            }),
            takeUntil(this.destroy$),
        ).subscribe(res => {
            if (!res?.success) {
                this.listState.set('error');
                return;
            }
            this.data.set(res.data);
            this.listState.set('ready');
            if (!this.selected() && res.data.items.length) this.selected.set(res.data.items[0]);
        });

        this.refreshAll();
    }

    ngOnDestroy(): void {
        this.wideQuery?.removeEventListener('change', this.onWideChange);
        this.destroy$.next();
        this.destroy$.complete();
    }

    // #region Loading
    refreshAll(): void {
        this.loadStats();
        this.loadList();
        this.loadHistory();
    }

    loadStats(retry = false): void {
        if (retry) this.statsRetrying.set(true);
        else if (!this.stats()) this.statsState.set('loading');

        this.cashierSrv.getDashboardStats().pipe(
            catchError(() => of(null)),
            finalize(() => this.statsRetrying.set(false)),
            takeUntil(this.destroy$),
        ).subscribe(res => {
            if (res?.success) {
                this.stats.set(res.data);
                this.statsState.set('ready');
            } else {
                this.statsState.set('error');
            }
        });
    }

    loadList(silent = false): void {
        this.load$.next(silent);
    }

    loadHistory(): void {
        if (!this.canReadPayments) return;
        this.historyState.set('loading');
        this.cashierSrv.getPaymentHistory(HISTORY_LIMIT).pipe(catchError(() => of(null)), takeUntil(this.destroy$)).subscribe(res => {
            if (res?.success) {
                this.history.set(res.data);
                this.historyState.set('ready');
            } else {
                this.historyState.set('error');
            }
        });
    }

    private loadCompanies(): void {
        if (!this.canListCompanies || this.companiesState() === 'ready') return;
        this.companiesState.set('loading');
        this.companySrv.search({ pageNumber: 1, pageSize: 200, filter: { start: '', end: '' } }).pipe(catchError(() => of(null)), takeUntil(this.destroy$)).subscribe(res => {
            if (res?.success) {
                this.companies.set(res.data.items.map(c => ({ id: c.id, name: c.name })));
                this.companiesState.set('ready');
            } else {
                this.companiesState.set('error');
            }
        });
    }
    // #endregion

    // #region Filters
    onSearchChange(value: string): void {
        if (value.trim() === this.search.trim()) return;
        this.search = value;
        this.applyFilters();
    }

    onStatusChange(value: CashierBillStatus | null): void {
        this.status = value;
        this.applyFilters();
    }

    onDateFromChange(value: string | null): void {
        this.dateFrom = value;
        this.applyFilters();
    }

    onDateToChange(value: string | null): void {
        this.dateTo = value;
        this.applyFilters();
    }

    onReset(): void {
        this.search = '';
        this.status = null;
        this.dateFrom = null;
        this.dateTo = null;
        this.applyFilters();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadList();
    }

    private applyFilters(): void {
        this.pageNumber = 1;
        this.loadList();
    }
    // #endregion

    // #region Selection
    selectBill(bill: CashierInvoice): void {
        this.selected.set(bill);
        if (!this.isWide()) this.drawerOpen.set(true);
    }

    openFromPayment(event: CashierTransactionEvent): void {
        const onPage = this.data()?.items.find(i => i.id === event.invoiceId);
        if (onPage) {
            this.selectBill(onPage);
            return;
        }
        this.cashierSrv.getInvoiceDetail(event.invoiceId).pipe(takeUntil(this.destroy$)).subscribe(res => {
            if (res.success && res.data) this.selectBill(res.data);
            else this.toastSrv.info('That bill could not be found.');
        });
    }
    // #endregion

    // #region Mutations
    openInsurance(): void {
        this.loadCompanies();
        this.adjustKind.set('insurance');
    }

    onPayment(payload: { splits: CashierPaymentSplit[]; amountTendered: number }): void {
        const bill = this.selected();
        if (!bill) return;
        this.runMutation(
            this.cashierSrv.receivePayment({ invoiceId: bill.id, splits: payload.splits, amountTendered: payload.amountTendered }),
            `Payment recorded for ${bill.billNumber}`,
            () => this.paymentOpen.set(false),
        );
    }

    onRefund(payload: CashierRefundSubmit): void {
        const bill = this.selected();
        if (!bill) return;
        this.runMutation(
            this.cashierSrv.refundPayment({ invoiceId: bill.id, paymentId: payload.payment.paymentId, amount: payload.amount, reason: payload.reason, method: payload.payment.method }),
            `Refund issued for ${bill.billNumber}`,
            () => this.refundOpen.set(false),
        );
    }

    onAdjustment(payload: CashierAdjustmentSubmit): void {
        const bill = this.selected();
        if (!bill) return;

        switch (payload.kind) {
            case 'discount':
                this.runMutation(this.cashierSrv.applyDiscount(bill.id, payload.discountPercent), `Discount applied to ${bill.billNumber}`, () => this.adjustKind.set(null));
                break;
            case 'insurance':
                this.runMutation(this.cashierSrv.applyInsurance(bill.id, payload.request), `Insurance coverage applied to ${bill.billNumber}`, () => this.adjustKind.set(null));
                break;
            case 'void':
                this.runMutation(this.cashierSrv.voidInvoice(bill.id, payload.reason), `${bill.billNumber} was voided`, () => this.adjustKind.set(null));
                break;
        }
    }

    /**
     * Runs one financial request. Nothing is shown as done until the server says so: on failure the interceptor
     * toasts the server's message and the dialog stays open with what the user entered.
     */
    private runMutation(request$: Observable<MutationResponse>, successMessage: string, closeDialog: () => void): void {
        if (this.busy()) return;
        this.busy.set(true);

        request$.pipe(finalize(() => this.busy.set(false)), takeUntil(this.destroy$)).subscribe({
            next: res => {
                if (!res.success) {
                    this.toastSrv.error(res.errors?.[0] ?? 'The request was not accepted.');
                    return;
                }
                this.toastSrv.success(successMessage);
                closeDialog();
                if (res.data) this.applyInvoice(res.data);
                this.loadStats();
                this.loadList(true);
                this.loadHistory();
            },
            error: () => { /* already reported by the HTTP interceptor */ },
        });
    }

    private applyInvoice(invoice: CashierInvoice): void {
        this.selected.set(invoice);
        this.data.update(page => page ? { ...page, items: page.items.map(i => i.id === invoice.id ? invoice : i) } : page);
    }
    // #endregion
}
