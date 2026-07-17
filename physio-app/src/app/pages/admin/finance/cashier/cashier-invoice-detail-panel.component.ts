import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierChargeCategory, CashierInvoice } from "../../../../shared/types/cashier.types";

const CATEGORY_ICON: Record<CashierChargeCategory, string> = {
    Medication: 'pill',
    Laboratory: 'flask-conical',
    Imaging: 'scan',
    Procedure: 'stethoscope',
    Room: 'bed-single',
    Service: 'concierge-bell',
};

const STATUS_CLASS: Record<CashierInvoice['status'], string> = {
    Pending: 'bg-amber-400/15 text-amber-100 border border-amber-300/30',
    PartiallyPaid: 'bg-sky-400/15 text-sky-100 border border-sky-300/30',
    Paid: 'bg-emerald-400/15 text-emerald-100 border border-emerald-300/30',
    Cancelled: 'bg-slate-400/15 text-slate-200 border border-slate-300/30',
    Refunded: 'bg-rose-400/15 text-rose-100 border border-rose-300/30',
    InsurancePending: 'bg-purple-400/15 text-purple-100 border border-purple-300/30',
};

@Component({
    selector: 'cashier-invoice-detail-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <ng-container *ngIf="invoice; else emptyState">
        <!-- Patient / invoice header -->
        <div class="bg-slate-900 px-5 py-4 shrink-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">Invoice</p>
              <h3 class="text-white font-semibold text-base truncate">{{ invoice.invoiceNo }}</h3>
            </div>
            <span class="px-2 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap" [ngClass]="statusClass(invoice.status)">
              {{ statusLabel(invoice.status) }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
              <span class="text-amber-300 font-bold text-sm">{{ invoice.patientName.charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ invoice.patientName }}</p>
              <p class="text-slate-400 text-xs truncate">{{ invoice.patientMrn }} · {{ invoice.patientPhone }}</p>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div class="bg-white/5 rounded-lg px-2 py-1.5">
              <p class="text-slate-400">Visit</p>
              <p class="text-white font-medium truncate">{{ invoice.visitType }}</p>
            </div>
            <div class="bg-white/5 rounded-lg px-2 py-1.5">
              <p class="text-slate-400">Department</p>
              <p class="text-white font-medium truncate">{{ invoice.department }}</p>
            </div>
            <div class="bg-white/5 rounded-lg px-2 py-1.5">
              <p class="text-slate-400">Doctor</p>
              <p class="text-white font-medium truncate">{{ invoice.doctorName }}</p>
            </div>
          </div>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          <p class="text-[11px] font-semibold text-slate-500 uppercase mb-2">Itemized Charges</p>
          <div class="space-y-1.5 mb-4">
            <div *ngFor="let line of invoice.charges" class="flex items-center gap-2.5 py-1.5">
              <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <boo-icon [name]="categoryIcon(line.category)" [size]="13" iconClass="text-slate-500"></boo-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-700 truncate">{{ line.description }}</p>
                <p class="text-[11px] text-slate-400">{{ line.category }} · {{ line.quantity }} × \${{ line.unitPrice.toFixed(2) }}</p>
              </div>
              <span class="text-sm font-medium text-slate-800 shrink-0">\${{ line.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-3 space-y-2.5">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-medium text-slate-800">\${{ invoice.subtotal.toFixed(2) }}</span>
            </div>

            <div class="flex items-center justify-between text-sm gap-2">
              <span class="text-slate-500 flex items-center gap-1">
                Discount
                <button type="button" (click)="editingDiscount = !editingDiscount" class="text-amber-600 hover:text-amber-700">
                  <boo-icon name="pencil" [size]="11"></boo-icon>
                </button>
              </span>
              <div class="flex items-center gap-2">
                <input *ngIf="editingDiscount" type="number" min="0" max="100" [(ngModel)]="discountInput"
                  (change)="applyDiscount()" class="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-right text-xs outline-none focus:ring-2 focus:ring-amber-400/30" />
                <span class="font-medium text-emerald-600">-\${{ invoice.discountAmount.toFixed(2) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm gap-2">
              <span class="text-slate-500 flex items-center gap-1">
                Insurance Coverage
                <button type="button" (click)="editingInsurance = !editingInsurance" class="text-amber-600 hover:text-amber-700">
                  <boo-icon name="pencil" [size]="11"></boo-icon>
                </button>
              </span>
              <div class="flex items-center gap-2">
                <input *ngIf="editingInsurance" type="number" min="0" [(ngModel)]="insuranceInput"
                  (change)="applyInsurance()" class="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right text-xs outline-none focus:ring-2 focus:ring-amber-400/30" />
                <span class="font-medium text-primary">-\${{ invoice.insuranceCoverageAmount.toFixed(2) }}</span>
              </div>
            </div>
            <p *ngIf="invoice.insuranceProvider" class="text-[11px] text-slate-400 -mt-1.5">{{ invoice.insuranceProvider }} · {{ invoice.insurancePolicyNo }}</p>

            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">Tax ({{ invoice.taxRate }}%)</span>
              <span class="font-medium text-slate-800">\${{ invoice.taxAmount.toFixed(2) }}</span>
            </div>

            <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">Total Charges</span>
              <span class="text-lg font-bold text-slate-900">\${{ invoice.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500">Paid</span>
              <span class="font-medium text-emerald-600">\${{ invoice.paidAmount.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">Remaining Balance</span>
              <span class="text-xl font-bold" [ngClass]="invoice.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'">\${{ invoice.remainingBalance.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Sticky payment action bar -->
        <div class="shrink-0 border-t border-slate-100 px-5 py-3 bg-slate-50/60">
          <button type="button" (click)="receivePayment.emit(invoice)" [disabled]="invoice.remainingBalance <= 0"
            class="w-full py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            [ngClass]="invoice.remainingBalance > 0 ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
            <boo-icon name="wallet" [size]="15"></boo-icon> Receive Payment
          </button>
          <div class="grid grid-cols-3 gap-2 mt-2">
            <button type="button" (click)="printInvoice.emit(invoice)" class="py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1">
              <boo-icon name="printer" [size]="13"></boo-icon> Print
            </button>
            <button type="button" (click)="refund.emit(invoice)" [disabled]="invoice.paidAmount <= 0"
              class="py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
              <boo-icon name="undo-2" [size]="13"></boo-icon> Refund
            </button>
            <button type="button" (click)="voidInvoice.emit(invoice)"
              class="py-2 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1">
              <boo-icon name="ban" [size]="13"></boo-icon> Void
            </button>
          </div>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <div class="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <boo-icon name="receipt" [size]="22" iconClass="text-slate-400"></boo-icon>
          </div>
          <p class="text-sm font-semibold text-slate-500 mb-0.5">No invoice selected</p>
          <p class="text-xs text-slate-400">Select a bill from the list to review charges and collect payment</p>
        </div>
      </ng-template>
    </div>
  `,
})
export class CashierInvoiceDetailPanelComponent {
    @Input() invoice: CashierInvoice | null = null;

    @Output() receivePayment = new EventEmitter<CashierInvoice>();
    @Output() refund = new EventEmitter<CashierInvoice>();
    @Output() voidInvoice = new EventEmitter<CashierInvoice>();
    @Output() printInvoice = new EventEmitter<CashierInvoice>();
    @Output() discountChange = new EventEmitter<{ invoice: CashierInvoice; discountPercent: number }>();
    @Output() insuranceChange = new EventEmitter<{ invoice: CashierInvoice; coverageAmount: number }>();

    editingDiscount = false;
    editingInsurance = false;
    discountInput = 0;
    insuranceInput = 0;

    ngOnChanges(): void {
        this.discountInput = this.invoice?.discountPercent ?? 0;
        this.insuranceInput = this.invoice?.insuranceCoverageAmount ?? 0;
        this.editingDiscount = false;
        this.editingInsurance = false;
    }

    statusLabel(status: CashierInvoice['status']): string {
        return status.replace(/([A-Z])/g, ' $1').trim();
    }

    statusClass(status: CashierInvoice['status']): string {
        return STATUS_CLASS[status];
    }

    categoryIcon(category: CashierChargeCategory): string {
        return CATEGORY_ICON[category];
    }

    applyDiscount(): void {
        if (!this.invoice) return;
        this.discountChange.emit({ invoice: this.invoice, discountPercent: Number(this.discountInput) || 0 });
        this.editingDiscount = false;
    }

    applyInsurance(): void {
        if (!this.invoice) return;
        this.insuranceChange.emit({ invoice: this.invoice, coverageAmount: Number(this.insuranceInput) || 0 });
        this.editingInsurance = false;
    }
}
