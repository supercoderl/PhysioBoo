import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierInvoice, CashierPaymentMethod, CashierPaymentSplit } from "../../../../shared/types/cashier.types";

@Component({
    selector: 'cashier-payment-dialog',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div *ngIf="isOpen && invoice" class="fixed inset-0 z-[10000] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="close.emit()" aria-hidden="true"></div>

      <div class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 rounded-t-2xl">
          <div>
            <h2 class="text-base font-semibold text-white">Receive Payment</h2>
            <p class="text-xs text-slate-400">{{ invoice.invoiceNo }} · {{ invoice.patientName }}</p>
          </div>
          <button type="button" (click)="close.emit()" class="text-slate-400 hover:text-white" aria-label="Close payment dialog">
            <boo-icon name="x" [size]="18"></boo-icon>
          </button>
        </div>

        <div class="p-5 grid md:grid-cols-2 gap-5">
          <!-- Left: method + tender -->
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase mb-2">Payment Method</p>
            <div class="grid grid-cols-4 gap-2 mb-4">
              <button *ngFor="let m of methods" type="button" (click)="selectMethod(m.key)"
                class="px-2 py-2.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-colors"
                [ngClass]="method === m.key ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-surface border-slate-200 text-slate-600 hover:border-slate-300'">
                <boo-icon [name]="m.icon" [size]="16"></boo-icon>
                {{ m.label }}
              </button>
            </div>

            <ng-container *ngIf="method !== 'Mixed'">
              <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">Amount Tendered</label>
              <input type="number" [(ngModel)]="tenderedAmount" min="0" step="0.01"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400/30 outline-none" />
            </ng-container>

            <ng-container *ngIf="method === 'Mixed'">
              <p class="text-xs font-semibold text-slate-500 uppercase mb-1">Split Payment</p>
              <div *ngFor="let split of splits; let i = index" class="flex items-center gap-2 mb-2">
                <select [(ngModel)]="split.method" class="px-2 py-1.5 border border-slate-300 rounded-lg text-xs">
                  <option value="Cash">Cash</option>
                  <option value="CreditCard">Credit Card</option>
                  <option value="DebitCard">Debit Card</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="QRCode">QR Code</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Corporate">Corporate</option>
                </select>
                <input type="number" [(ngModel)]="split.amount" min="0" step="0.01" class="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs" />
                <button type="button" (click)="removeSplit(i)" class="text-slate-400 hover:text-rose-600" aria-label="Remove split"><boo-icon name="x" [size]="14"></boo-icon></button>
              </div>
              <button type="button" (click)="addSplit()" class="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1">
                <boo-icon name="plus" [size]="12"></boo-icon> Add payment line
              </button>
              <p class="text-xs mt-2" [ngClass]="remainingSplit() === 0 ? 'text-emerald-600' : 'text-amber-600'" aria-live="polite">
                Remaining: \${{ remainingSplit().toFixed(2) }}
              </p>
            </ng-container>
          </div>

          <!-- Right: summary -->
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs font-semibold text-slate-500 uppercase mb-2">Summary</p>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-slate-500">Remaining Balance</span>
              <span class="font-bold text-slate-900">\${{ invoice.remainingBalance.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm mb-1" *ngIf="method !== 'Mixed'">
              <span class="text-slate-500">Tendered</span>
              <span class="font-medium text-slate-800">\${{ (tenderedAmount || 0).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm" *ngIf="method !== 'Mixed'" aria-live="polite">
              <span class="text-slate-500">Change</span>
              <span class="font-semibold text-amber-700">\${{ change().toFixed(2) }}</span>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <boo-icon name="shield-check" [size]="13" iconClass="text-emerald-500"></boo-icon>
              Receipt will be available for print or reprint after confirmation.
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" (click)="close.emit()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="button" (click)="complete()" [disabled]="!canComplete()"
            class="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            [ngClass]="canComplete() ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CashierPaymentDialogComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() invoice: CashierInvoice | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() completePayment = new EventEmitter<{ splits: CashierPaymentSplit[]; amountTendered: number }>();

    readonly methods: { key: CashierPaymentMethod; label: string; icon: string }[] = [
        { key: 'Cash', label: 'Cash', icon: 'banknote' },
        { key: 'CreditCard', label: 'Credit Card', icon: 'credit-card' },
        { key: 'DebitCard', label: 'Debit Card', icon: 'credit-card' },
        { key: 'BankTransfer', label: 'Bank Transfer', icon: 'landmark' },
        { key: 'QRCode', label: 'QR Code', icon: 'qr-code' },
        { key: 'Insurance', label: 'Insurance', icon: 'shield-check' },
        { key: 'Corporate', label: 'Corporate', icon: 'building-2' },
        { key: 'Mixed', label: 'Split', icon: 'split' },
    ];

    method: CashierPaymentMethod = 'Cash';
    tenderedAmount = 0;
    splits: CashierPaymentSplit[] = [];

    ngOnChanges(): void {
        if (this.isOpen && this.invoice) {
            this.method = 'Cash';
            this.tenderedAmount = this.invoice.remainingBalance;
            this.splits = [{ method: 'Cash', amount: this.invoice.remainingBalance }];
        }
    }

    selectMethod(key: CashierPaymentMethod): void {
        this.method = key;
        this.tenderedAmount = this.invoice?.remainingBalance ?? 0;
        if (key === 'Mixed' && !this.splits.length) {
            this.splits = [{ method: 'Cash', amount: this.invoice?.remainingBalance ?? 0 }];
        }
    }

    addSplit(): void {
        this.splits.push({ method: 'Cash', amount: 0 });
    }

    removeSplit(index: number): void {
        this.splits.splice(index, 1);
    }

    splitTotal(): number {
        return this.splits.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    }

    remainingSplit(): number {
        const target = this.invoice?.remainingBalance ?? 0;
        return Math.round((target - this.splitTotal()) * 100) / 100;
    }

    change(): number {
        const target = this.invoice?.remainingBalance ?? 0;
        return Math.max(0, (this.tenderedAmount || 0) - target);
    }

    canComplete(): boolean {
        const target = this.invoice?.remainingBalance ?? 0;
        if (target <= 0) return false;
        if (this.method === 'Mixed') return this.remainingSplit() === 0;
        return (this.tenderedAmount || 0) >= target;
    }

    complete(): void {
        if (!this.canComplete()) return;
        if (this.method === 'Mixed') {
            this.completePayment.emit({ splits: this.splits, amountTendered: this.splitTotal() });
        } else {
            const target = this.invoice?.remainingBalance ?? 0;
            this.completePayment.emit({ splits: [{ method: this.method, amount: target }], amountTendered: this.tenderedAmount });
        }
    }
}
