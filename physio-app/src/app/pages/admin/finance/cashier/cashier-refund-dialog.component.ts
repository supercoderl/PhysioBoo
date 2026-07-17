import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierInvoice, CashierPaymentMethod } from "../../../../shared/types/cashier.types";

@Component({
    selector: 'cashier-refund-dialog',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div *ngIf="isOpen && invoice" class="fixed inset-0 z-[10000] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="close.emit()" aria-hidden="true"></div>

      <div class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900 flex items-center gap-2">
              <boo-icon name="undo-2" [size]="16" iconClass="text-rose-600"></boo-icon>
              Refund Payment
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">{{ invoice.invoiceNo }} · {{ invoice.patientName }}</p>
          </div>
          <button type="button" (click)="close.emit()" class="text-slate-400 hover:text-slate-600" aria-label="Close refund dialog">
            <boo-icon name="x" [size]="18"></boo-icon>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div class="bg-rose-50 rounded-lg px-3 py-2 text-xs text-rose-700 flex items-start gap-2">
            <boo-icon name="alert-triangle" [size]="14" iconClass="mt-0.5 shrink-0"></boo-icon>
            Refunds are final and will be recorded in the payment history.
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Refund Amount</label>
            <input type="number" [(ngModel)]="amount" min="0" [max]="invoice.paidAmount" step="0.01"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-400/30" />
            <p class="text-[11px] text-slate-400 mt-1">Paid amount: \${{ invoice.paidAmount.toFixed(2) }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Refund Method</label>
            <select [(ngModel)]="method" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-400/30">
              <option value="Cash">Cash</option>
              <option value="CreditCard">Credit Card</option>
              <option value="DebitCard">Debit Card</option>
              <option value="BankTransfer">Bank Transfer</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Reason</label>
            <textarea [(ngModel)]="reason" rows="3" placeholder="Explain the reason for this refund"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-400/30 resize-none"></textarea>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" (click)="close.emit()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="button" (click)="confirm()" [disabled]="!canConfirm()"
            class="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            [ngClass]="canConfirm() ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
            Confirm Refund
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CashierRefundDialogComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() invoice: CashierInvoice | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() confirmRefund = new EventEmitter<{ amount: number; reason: string; method: CashierPaymentMethod }>();

    amount = 0;
    reason = '';
    method: CashierPaymentMethod = 'Cash';

    ngOnChanges(): void {
        if (this.isOpen && this.invoice) {
            this.amount = this.invoice.paidAmount;
            this.reason = '';
            this.method = 'Cash';
        }
    }

    canConfirm(): boolean {
        return !!this.invoice && this.amount > 0 && this.amount <= this.invoice.paidAmount && this.reason.trim().length > 0;
    }

    confirm(): void {
        if (!this.canConfirm()) return;
        this.confirmRefund.emit({ amount: Number(this.amount), reason: this.reason.trim(), method: this.method });
    }
}
