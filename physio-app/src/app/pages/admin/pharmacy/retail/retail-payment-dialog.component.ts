import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailPaymentMethod, RetailPaymentSplit } from "../../../../shared/types/retail-pos.types";

@Component({
  selector: 'retail-payment-dialog',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" (click)="close.emit()" aria-hidden="true"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">Payment</h2>
          <button type="button" (click)="close.emit()" class="text-gray-400 hover:text-gray-600" aria-label="Close payment dialog">
            <boo-icon name="x" [size]="18"></boo-icon>
          </button>
        </div>

        <div class="p-5 grid md:grid-cols-2 gap-5">
          <!-- Left: method + tender -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Method</p>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <button *ngFor="let m of methods" type="button" (click)="selectMethod(m.key)"
                [disabled]="m.key === 'Insurance' && !hasInsurance"
                class="px-2 py-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                [ngClass]="method === m.key ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-gray-200 text-gray-600 hover:border-gray-300'">
                <boo-icon [name]="m.icon" [size]="16"></boo-icon>
                {{ m.label }}
              </button>
            </div>

            <div *ngIf="method === 'Insurance' && !hasInsurance" class="bg-amber-50 text-amber-700 text-xs rounded-lg p-2.5 mb-3">
              This customer has no insurance on file. Choose another payment method.
            </div>

            <ng-container *ngIf="method !== 'Mixed'">
              <label class="text-xs font-semibold text-gray-500 uppercase mb-1 block">Amount Tendered</label>
              <input type="number" [(ngModel)]="tenderedAmount" min="0" step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            </ng-container>

            <ng-container *ngIf="method === 'Mixed'">
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Split Payment</p>
              <div *ngFor="let split of splits; let i = index" class="flex items-center gap-2 mb-2">
                <select [(ngModel)]="split.method" class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="QR">QR</option>
                  <option [disabled]="!hasInsurance" value="Insurance">Insurance</option>
                </select>
                <input type="number" [(ngModel)]="split.amount" min="0" step="0.01" class="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                <button type="button" (click)="removeSplit(i)" class="text-gray-400 hover:text-rose-600" aria-label="Remove split"><boo-icon name="x" [size]="14"></boo-icon></button>
              </div>
              <button type="button" (click)="addSplit()" class="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <boo-icon name="plus" [size]="12"></boo-icon> Add payment line
              </button>
              <p class="text-xs mt-2" [ngClass]="remainingSplit() === 0 ? 'text-emerald-600' : 'text-amber-600'" aria-live="polite">
                Remaining: \${{ remainingSplit().toFixed(2) }}
              </p>
            </ng-container>
          </div>

          <!-- Right: summary + receipt preview -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Summary</p>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-500">Grand Total</span>
              <span class="font-bold text-gray-900">\${{ grandTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm mb-1" *ngIf="method !== 'Mixed'">
              <span class="text-gray-500">Tendered</span>
              <span class="font-medium text-gray-800">\${{ (tenderedAmount || 0).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm" *ngIf="method !== 'Mixed'" aria-live="polite">
              <span class="text-gray-500">Change</span>
              <span class="font-semibold text-primary">\${{ change().toFixed(2) }}</span>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-200 flex gap-2">
              <button type="button" class="flex-1 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100">Print</button>
              <button type="button" class="flex-1 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100">Email</button>
              <button type="button" class="flex-1 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100">SMS</button>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button type="button" (click)="close.emit()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="button" (click)="complete()" [disabled]="!canComplete()"
            class="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            [ngClass]="canComplete() ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RetailPaymentDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() grandTotal = 0;
  @Input() hasInsurance = false;
  @Output() close = new EventEmitter<void>();
  @Output() completeSale = new EventEmitter<{ paymentSplits: RetailPaymentSplit[]; amountTendered: number }>();

  readonly methods: { key: RetailPaymentMethod; label: string; icon: string }[] = [
    { key: 'Cash', label: 'Cash', icon: 'banknote' },
    { key: 'Card', label: 'Card', icon: 'credit-card' },
    { key: 'QR', label: 'QR', icon: 'qr-code' },
    { key: 'Insurance', label: 'Insurance', icon: 'shield-check' },
    { key: 'Mixed', label: 'Mixed', icon: 'split' },
  ];

  method: RetailPaymentMethod = 'Cash';
  tenderedAmount = 0;
  splits: RetailPaymentSplit[] = [];

  ngOnChanges(): void {
    if (this.isOpen) {
      this.method = 'Cash';
      this.tenderedAmount = this.grandTotal;
      this.splits = [{ method: 'Cash', amount: this.grandTotal }];
    }
  }

  selectMethod(key: RetailPaymentMethod): void {
    if (key === 'Insurance' && !this.hasInsurance) return;
    this.method = key;
    this.tenderedAmount = this.grandTotal;
    if (key === 'Mixed' && !this.splits.length) {
      this.splits = [{ method: 'Cash', amount: this.grandTotal }];
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
    return Math.round((this.grandTotal - this.splitTotal()) * 100) / 100;
  }

  change(): number {
    return Math.max(0, (this.tenderedAmount || 0) - this.grandTotal);
  }

  canComplete(): boolean {
    if (this.grandTotal <= 0) return false;
    if (this.method === 'Mixed') return this.remainingSplit() === 0;
    return (this.tenderedAmount || 0) >= this.grandTotal;
  }

  complete(): void {
    if (!this.canComplete()) return;
    if (this.method === 'Mixed') {
      this.completeSale.emit({ paymentSplits: this.splits, amountTendered: this.splitTotal() });
    } else {
      this.completeSale.emit({ paymentSplits: [{ method: this.method, amount: this.grandTotal }], amountTendered: this.tenderedAmount });
    }
  }
}
