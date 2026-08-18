import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { CashierService } from "../../../../services/admin/cashier.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
  CashierDashboardStats,
  CashierInvoice,
  CashierInvoiceStatus,
  CashierPaymentMethod,
  CashierPaymentSplit,
  CashierTransactionEvent,
} from "../../../../shared/types/cashier.types";
import { PaginationData, PaginationDataWithInit } from "../../../../shared/types/common";
import { CashierInvoiceDetailPanelComponent } from "./cashier-invoice-detail-panel.component";
import { CashierInvoiceTableComponent } from "./cashier-invoice-table.component";
import { CashierPaymentDialogComponent } from "./cashier-payment-dialog.component";
import { CashierRefundDialogComponent } from "./cashier-refund-dialog.component";
import { CashierSearchPanelComponent } from "./cashier-search-panel.component";
import { CashierTransactionsTimelineComponent } from "./cashier-transactions-timeline.component";

type LeftTab = 'invoices' | 'activity';

@Component({
  selector: 'admin-cashier',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    ErrorStateComponent,
    CashierSearchPanelComponent,
    CashierInvoiceTableComponent,
    CashierInvoiceDetailPanelComponent,
    CashierPaymentDialogComponent,
    CashierRefundDialogComponent,
    CashierTransactionsTimelineComponent,
  ],
  host: { class: 'block min-h-screen bg-slate-50' },
  template: `
    <!-- Hero header -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-4 sm:px-6 pt-6 pb-8">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p class="text-amber-400 text-[11px] font-semibold uppercase tracking-wider mb-1">Finance Workspace</p>
          <h1 class="text-white text-xl sm:text-2xl font-semibold">Cashier — Billing &amp; Payment</h1>
          <p class="text-slate-400 text-xs mt-1">Cashier: Current Cashier · Shift started {{ shiftStart | date:'shortTime' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="exportTransactions()"
            class="px-3 py-2 border border-white/15 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 flex items-center gap-1.5">
            <boo-icon name="download" [size]="14"></boo-icon> Export
          </button>
          <button type="button" (click)="refreshAll()"
            class="px-3 py-2 rounded-lg text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 flex items-center gap-1.5">
            <boo-icon name="refresh-cw" [size]="14" [class.animate-spin]="loadingSrv.isLoading('cashier-dashboard')"></boo-icon> Refresh
          </button>
        </div>
      </div>

      <!-- Revenue / stats strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Today's Revenue</p>
          <p class="text-white font-bold text-lg mt-0.5">\${{ (stats()?.todayRevenue ?? 0) | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Cash Collected</p>
          <p class="text-emerald-300 font-bold text-lg mt-0.5">\${{ (stats()?.cashCollected ?? 0) | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Card Payments</p>
          <p class="text-sky-300 font-bold text-lg mt-0.5">\${{ (stats()?.cardPayments ?? 0) | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Insurance Claims</p>
          <p class="text-purple-300 font-bold text-lg mt-0.5">\${{ (stats()?.insuranceClaims ?? 0) | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Outstanding</p>
          <p class="text-rose-300 font-bold text-lg mt-0.5">\${{ (stats()?.outstandingBills ?? 0) | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Refunds</p>
          <p class="text-amber-300 font-bold text-lg mt-0.5">\${{ (stats()?.refundAmount ?? 0) | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Transactions</p>
          <p class="text-white font-bold text-lg mt-0.5">{{ stats()?.completedTransactions ?? 0 }}</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <p class="text-[10px] text-slate-400 uppercase tracking-wide">Avg. Payment Time</p>
          <p class="text-white font-bold text-lg mt-0.5">{{ avgPaymentTimeLabel() }}</p>
        </div>
      </div>
    </div>

    <!-- Main workspace -->
    <main class="px-4 sm:px-6 -mt-4 pb-8">
      <cashier-search-panel
        (searchChange)="onSearchChange($event)"
        (statusChange)="onStatusChange($event)"
        (barcodeSubmit)="onBarcodeSubmit($event)">
      </cashier-search-panel>

      <!-- Error state -->
      <div *ngIf="error() && !loadingSrv.isLoading('cashier-invoices-search')" class="mt-4">
        <boo-error-state title="Couldn't load cashier data" [description]="error()" (retry)="retryLoad()"></boo-error-state>
      </div>

      <div *ngIf="!error()" class="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 mt-4">
        <!-- Left: outstanding invoices / activity -->
        <div class="h-[calc(100vh-330px)] min-h-[480px] flex flex-col gap-3">
          <div class="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            <button type="button" (click)="leftTab.set('invoices')"
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              [ngClass]="leftTab() === 'invoices' ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
              Outstanding Invoices
            </button>
            <button type="button" (click)="leftTab.set('activity')"
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              [ngClass]="leftTab() === 'activity' ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
              Recent Transactions
            </button>
          </div>

          <div class="flex-1 min-h-0">
            <cashier-invoice-table *ngIf="leftTab() === 'invoices'"
              [data]="invoicePage()"
              [loading]="loadingSrv.isLoading('cashier-invoices-search')"
              [selectedId]="selectedInvoice()?.id ?? null"
              (pageChange)="onPageChange($event)"
              (rowSelect)="selectInvoice($event)"
              (receivePayment)="openPaymentDialog($event)"
              (refund)="openRefundDialog($event)"
              (voidInvoice)="confirmVoid($event)"
              (printInvoice)="printInvoice($event)">
            </cashier-invoice-table>

            <cashier-transactions-timeline *ngIf="leftTab() === 'activity'"
              [events]="transactions()"
              [loading]="loadingSrv.isLoading('cashier-payment-history')">
            </cashier-transactions-timeline>
          </div>
        </div>

        <!-- Right: floating invoice detail / payment panel -->
        <div class="h-[calc(100vh-330px)] min-h-[480px]">
          <cashier-invoice-detail-panel
            [invoice]="selectedInvoice()"
            (receivePayment)="openPaymentDialog($event)"
            (refund)="openRefundDialog($event)"
            (voidInvoice)="confirmVoid($event)"
            (printInvoice)="printInvoice($event)"
            (discountChange)="onDiscountChange($event)"
            (insuranceChange)="onInsuranceChange($event)">
          </cashier-invoice-detail-panel>
        </div>
      </div>
    </main>

    <cashier-payment-dialog
      [isOpen]="paymentDialogOpen()"
      [invoice]="selectedInvoice()"
      (close)="paymentDialogOpen.set(false)"
      (completePayment)="onCompletePayment($event)">
    </cashier-payment-dialog>

    <cashier-refund-dialog
      [isOpen]="refundDialogOpen()"
      [invoice]="refundTarget()"
      (close)="refundDialogOpen.set(false)"
      (confirmRefund)="onConfirmRefund($event)">
    </cashier-refund-dialog>
  `,
})
export class AdminCashierComponent implements OnInit {
  shiftStart = new Date();

  leftTab = signal<LeftTab>('invoices');
  stats = signal<CashierDashboardStats | null>(null);
  invoicePage = signal<PaginationData<CashierInvoice>>(PaginationDataWithInit<CashierInvoice>());
  transactions = signal<CashierTransactionEvent[]>([]);
  selectedInvoice = signal<CashierInvoice | null>(null);

  paymentDialogOpen = signal(false);
  refundDialogOpen = signal(false);
  refundTarget = signal<CashierInvoice | null>(null);

  error = signal<string | null>(null);

  filter = { search: '', status: 'All' as CashierInvoiceStatus | 'All', pageNumber: 1, pageSize: 8 };

  constructor(
    private cashierSrv: CashierService,
    protected loadingSrv: LocalLoadingService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService,
  ) { }

  ngOnInit(): void {
    this.error.set(null);
    this.loadStats();
    this.loadInvoices();
    this.loadTransactions();
  }

  retryLoad(): void {
    this.ngOnInit();
  }

  avgPaymentTimeLabel(): string {
    const seconds = this.stats()?.averagePaymentTimeSeconds ?? 0;
    if (seconds < 60) return `${seconds}s`;
    return `${Math.round(seconds / 60)}m ${seconds % 60}s`;
  }

  loadStats(): void {
    this.cashierSrv.getDashboardStats().subscribe({
      next: res => { if (res.success) this.stats.set(res.data); },
      error: () => this.error.set('Failed to load cashier dashboard stats. Please try again.'),
    });
  }

  loadInvoices(): void {
    this.cashierSrv.searchInvoices(this.filter).subscribe({
      next: res => {
        if (res.success) {
          this.invoicePage.set(res.data);
          if (!this.selectedInvoice() && res.data.items.length) {
            this.selectedInvoice.set(res.data.items[0]);
          }
        }
      },
      error: () => this.error.set('Failed to load invoices. Please try again.'),
    });
  }

  loadTransactions(): void {
    this.cashierSrv.getPaymentHistory().subscribe({
      next: res => { if (res.success) this.transactions.set(res.data); },
      error: () => this.error.set('Failed to load recent transactions. Please try again.'),
    });
  }

  refreshAll(): void {
    this.error.set(null);
    this.loadStats();
    this.loadInvoices();
    this.loadTransactions();
  }

  exportTransactions(): void {
    this.toastSrv.info('Preparing export… this will download shortly.');
  }

  onSearchChange(value: string): void {
    this.filter = { ...this.filter, search: value, pageNumber: 1 };
    this.loadInvoices();
  }

  onStatusChange(status: CashierInvoiceStatus | 'All'): void {
    this.filter = { ...this.filter, status, pageNumber: 1 };
    this.loadInvoices();
  }

  onBarcodeSubmit(code: string): void {
    this.filter = { ...this.filter, search: code, pageNumber: 1 };
    this.loadInvoices();
  }

  onPageChange(page: number): void {
    this.filter = { ...this.filter, pageNumber: page };
    this.loadInvoices();
  }

  selectInvoice(invoice: CashierInvoice): void {
    this.selectedInvoice.set(invoice);
  }

  openPaymentDialog(invoice: CashierInvoice): void {
    if (invoice.remainingBalance <= 0) {
      this.toastSrv.info('This invoice has no remaining balance');
      return;
    }
    this.selectedInvoice.set(invoice);
    this.paymentDialogOpen.set(true);
  }

  onCompletePayment(payload: { splits: CashierPaymentSplit[]; amountTendered: number }): void {
    const invoice = this.selectedInvoice();
    if (!invoice) return;
    this.cashierSrv.receivePayment(invoice.id, payload.splits, payload.amountTendered).subscribe(res => {
      if (res.success) {
        this.toastSrv.success(`Payment recorded for ${res.data.invoiceNo}`, 'Payment Complete');
        this.paymentDialogOpen.set(false);
        const paidAmount = invoice.paidAmount + res.data.amountPaid;
        const remainingBalance = Math.max(0, invoice.totalAmount - paidAmount);
        const updated: CashierInvoice = {
          ...invoice,
          paidAmount,
          remainingBalance,
          status: remainingBalance === 0 ? 'Paid' : 'PartiallyPaid',
        };
        this.applyInvoiceUpdate(updated);
        this.loadStats();
        this.loadTransactions();
      }
    });
  }

  openRefundDialog(invoice: CashierInvoice): void {
    if (invoice.paidAmount <= 0) {
      this.toastSrv.info('No payment has been collected on this invoice yet');
      return;
    }
    this.refundTarget.set(invoice);
    this.refundDialogOpen.set(true);
  }

  onConfirmRefund(payload: { amount: number; reason: string; method: CashierPaymentMethod }): void {
    const invoice = this.refundTarget();
    if (!invoice) return;
    this.cashierSrv.refundPayment(invoice.id, payload.amount, payload.reason, payload.method).subscribe(res => {
      if (res.success) {
        this.toastSrv.success(`Refund of $${payload.amount.toFixed(2)} issued for ${res.data.invoiceNo}`, 'Refund Complete');
        this.refundDialogOpen.set(false);
        const paidAmount = Math.max(0, invoice.paidAmount - payload.amount);
        const updated: CashierInvoice = {
          ...invoice,
          paidAmount,
          remainingBalance: invoice.totalAmount - paidAmount,
          status: paidAmount === 0 ? 'Refunded' : 'PartiallyPaid',
        };
        this.applyInvoiceUpdate(updated);
        this.loadStats();
        this.loadTransactions();
      }
    });
  }

  confirmVoid(invoice: CashierInvoice): void {
    this.dialogSrv.confirm(
      `Void invoice ${invoice.invoiceNo}? This will cancel the bill and cannot be undone.`,
      () => this.doVoid(invoice),
      'Void Invoice',
      'danger',
      'Void Invoice',
      'Cancel',
    );
  }

  private doVoid(invoice: CashierInvoice): void {
    this.cashierSrv.voidInvoice(invoice.id, 'Voided by cashier').subscribe(res => {
      if (res.success) {
        this.toastSrv.success(`${invoice.invoiceNo} has been voided`);
        this.applyInvoiceUpdate({ ...invoice, status: 'Cancelled' });
        this.loadStats();
      }
    });
  }

  onDiscountChange(payload: { invoice: CashierInvoice; discountPercent: number }): void {
    this.cashierSrv.applyDiscount(payload.invoice.id, payload.discountPercent).subscribe(res => {
      if (res.success) {
        const discountAmount = payload.invoice.subtotal * payload.discountPercent / 100;
        const taxableBase = Math.max(0, payload.invoice.subtotal - discountAmount - payload.invoice.insuranceCoverageAmount);
        const taxAmount = taxableBase * payload.invoice.taxRate / 100;
        const totalAmount = Math.max(0, taxableBase + taxAmount);
        const updated: CashierInvoice = {
          ...payload.invoice,
          discountPercent: payload.discountPercent,
          discountAmount,
          taxAmount,
          totalAmount,
          remainingBalance: Math.max(0, totalAmount - payload.invoice.paidAmount),
        };
        this.applyInvoiceUpdate(updated);
        this.toastSrv.success('Discount applied');
      }
    });
  }

  onInsuranceChange(payload: { invoice: CashierInvoice; coverageAmount: number }): void {
    this.cashierSrv.applyInsurance(payload.invoice.id, payload.invoice.insuranceProvider ?? '', payload.invoice.insurancePolicyNo ?? '', payload.coverageAmount).subscribe(res => {
      if (res.success) {
        const taxableBase = Math.max(0, payload.invoice.subtotal - payload.invoice.discountAmount - payload.coverageAmount);
        const taxAmount = taxableBase * payload.invoice.taxRate / 100;
        const totalAmount = Math.max(0, taxableBase + taxAmount);
        const updated: CashierInvoice = {
          ...payload.invoice,
          insuranceCoverageAmount: payload.coverageAmount,
          taxAmount,
          totalAmount,
          remainingBalance: Math.max(0, totalAmount - payload.invoice.paidAmount),
        };
        this.applyInvoiceUpdate(updated);
        this.toastSrv.success('Insurance coverage updated');
      }
    });
  }

  printInvoice(invoice: CashierInvoice): void {
    this.cashierSrv.printInvoice(invoice.id).subscribe(res => {
      if (res.success) this.toastSrv.success(`${invoice.invoiceNo} sent to printer`);
    });
  }

  private applyInvoiceUpdate(updated: CashierInvoice): void {
    this.selectedInvoice.set(updated);
    this.invoicePage.update(page => ({
      ...page,
      items: page.items.map(i => i.id === updated.id ? updated : i),
    }));
  }
}
