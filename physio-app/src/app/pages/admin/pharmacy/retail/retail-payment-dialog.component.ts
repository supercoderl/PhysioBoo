import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCheckoutPayload, RetailPaymentMethod, RetailPaymentSplit } from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney, roundMoney } from "../../../../shared/utils/retail-pos.utils";

type PaymentMode = RetailPaymentMethod | 'Split';

@Component({
  selector: 'retail-payment-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooInputComponent, BooSelectComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="requestClose()" aria-hidden="true"></div>

      <div #panel role="dialog" aria-modal="true" aria-labelledby="retail-payment-title" tabindex="-1"
        class="relative bg-surface rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-100 outline-none">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 id="retail-payment-title" class="text-base font-semibold text-regular m-0">Payment</h2>
          <button type="button" (click)="requestClose()" [disabled]="submitting" class="w-8 h-8 rounded-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40" aria-label="Close payment dialog">
            <physio-icon name="x" [size]="18"></physio-icon>
          </button>
        </div>

        <div class="p-5 space-y-5">
          <div class="flex items-baseline justify-between bg-gray-50 rounded-1.5 px-4 py-3">
            <span class="text-sm text-secondary">Total due</span>
            <span class="text-2xl font-bold text-primaryDeep">{{ money(grandTotal) }}</span>
          </div>

          <div>
            <p class="text-xs font-semibold text-secondary uppercase m-0 mb-2" id="retail-payment-method">Payment method</p>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2" role="group" aria-labelledby="retail-payment-method">
              <button *ngFor="let m of modes" type="button" (click)="selectMode(m.key)" [disabled]="submitting || (m.key === 'Insurance' && !hasInsurance)"
                [attr.aria-pressed]="mode === m.key"
                class="min-h-11 px-2 py-2 rounded-1.5 border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                [ngClass]="mode === m.key ? 'bg-primarySoft border-primary text-primaryDeep' : 'bg-surface border-gray-300 text-gray-700 hover:border-gray-400'">
                <physio-icon [name]="m.icon" [size]="16"></physio-icon>
                {{ m.label }}
              </button>
            </div>
            <p *ngIf="!hasInsurance" class="text-xs text-secondary m-0 mt-2">Insurance is available when the customer has an insurance provider on file.</p>
          </div>

          <div *ngIf="mode === 'Cash'" class="space-y-2">
            <boo-input type="number" label="Amount tendered" [(ngModel)]="tendered" [disabled]="submitting" [maxlength]="12"></boo-input>
            <div class="flex justify-between text-sm" aria-live="polite">
              <span class="text-secondary">Change due</span>
              <span class="font-semibold" [ngClass]="cashShort() ? 'text-danger' : 'text-primaryDeep'">{{ cashShort() ? 'Short by ' + money(cashShort()) : money(changeDue()) }}</span>
            </div>
          </div>

          <p *ngIf="mode !== 'Cash' && mode !== 'Split'" class="text-sm text-secondary m-0">
            {{ money(grandTotal) }} will be recorded as paid by {{ mode === 'QR' ? 'QR' : mode.toLowerCase() }}.
          </p>

          <div *ngIf="mode === 'Split'" class="space-y-2">
            <div *ngFor="let split of splits; let i = index" class="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              <boo-select label="Method" size="small" [options]="splitMethods()" bindLabel="label" bindValue="value" [required]="true" [(ngModel)]="split.method" [ngModelOptions]="{ standalone: true }"></boo-select>
              <boo-input type="number" label="Amount" size="small" [(ngModel)]="split.amount" [ngModelOptions]="{ standalone: true }" [disabled]="submitting" [maxlength]="12"></boo-input>
              <button type="button" (click)="removeSplit(i)" [disabled]="submitting || splits.length === 1" class="w-8 h-8 rounded-1.5 flex items-center justify-center text-gray-500 hover:text-danger hover:bg-gray-100 disabled:opacity-40" [attr.aria-label]="'Remove payment line ' + (i + 1)">
                <physio-icon name="x" [size]="14"></physio-icon>
              </button>
            </div>
            <button boo-button variant="ghost" size="sm" (click)="addSplit()" [disabled]="submitting"><physio-icon name="plus" [size]="14"></physio-icon> Add payment line</button>
            <p class="text-xs m-0" [ngClass]="remaining() === 0 ? 'text-emerald-700' : 'text-danger'" aria-live="polite">
              {{ remaining() === 0 ? 'Payment lines match the total.' : (remaining() > 0 ? 'Remaining: ' : 'Over by: ') + money(abs(remaining())) }}
            </p>
          </div>

          <div *ngIf="errorMessage" class="bg-dangerSoft border border-dangerBorder rounded-1.5 p-3 text-sm text-gray-900 flex items-start gap-2" role="alert">
            <physio-icon name="circle-alert" [size]="16" class="text-danger mt-0.5 shrink-0"></physio-icon>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
          <button boo-button variant="ghost" size="sm" (click)="requestClose()" [disabled]="submitting">Cancel</button>
          <button boo-button variant="primary" size="sm" (click)="complete()" [disabled]="!canComplete()" [loading]="submitting">Complete sale</button>
        </div>
      </div>
    </div>
  `,
})
export class RetailPaymentDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() grandTotal = 0;
  @Input() hasInsurance = false;
  @Input() hospitalId: string | null = null;
  /** The checkout request is in flight: the form locks and Complete sale cannot be pressed twice. */
  @Input() submitting = false;
  /** Failure from the last attempt; the dialog stays open with everything the cashier entered. */
  @Input() errorMessage: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() completeSale = new EventEmitter<RetailCheckoutPayload>();

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  readonly modes: { key: PaymentMode; label: string; icon: string }[] = [
    { key: 'Cash', label: 'Cash', icon: 'banknote' },
    { key: 'Card', label: 'Card', icon: 'credit-card' },
    { key: 'QR', label: 'QR', icon: 'qr-code' },
    { key: 'Insurance', label: 'Insurance', icon: 'shield-check' },
    { key: 'Split', label: 'Split', icon: 'split' },
  ];

  mode: PaymentMode = 'Cash';
  tendered: number | null = null;
  splits: { method: RetailPaymentMethod; amount: number | null }[] = [];

  private openedFrom: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const open = changes['isOpen'];
    if (open && this.isOpen) {
      this.openedFrom = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.mode = 'Cash';
      this.tendered = this.grandTotal;
      this.splits = [{ method: 'Cash', amount: this.grandTotal }];
      setTimeout(() => this.panel?.nativeElement.focus());
    } else if (open && !this.isOpen) {
      setTimeout(() => this.openedFrom?.focus());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.requestClose();
  }

  requestClose(): void {
    if (!this.submitting) this.close.emit();
  }

  selectMode(key: PaymentMode): void {
    if (this.submitting) return;
    if (key === 'Insurance' && !this.hasInsurance) return;
    this.mode = key;
    if (key === 'Cash') this.tendered = this.grandTotal;
  }

  splitMethods(): { label: string; value: RetailPaymentMethod }[] {
    const methods: { label: string; value: RetailPaymentMethod }[] = [
      { label: 'Cash', value: 'Cash' }, { label: 'Card', value: 'Card' }, { label: 'QR', value: 'QR' },
    ];
    if (this.hasInsurance) methods.push({ label: 'Insurance', value: 'Insurance' });
    return methods;
  }

  addSplit(): void {
    this.splits = [...this.splits, { method: 'Cash', amount: Math.max(0, this.remaining()) || null }];
  }

  removeSplit(index: number): void {
    if (this.splits.length > 1) this.splits = this.splits.filter((_, i) => i !== index);
  }

  remaining(): number {
    const paid = this.splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    return roundMoney(this.grandTotal - paid);
  }

  cashShort(): number {
    return Math.max(0, roundMoney(this.grandTotal - (Number(this.tendered) || 0)));
  }

  changeDue(): number {
    return Math.max(0, roundMoney((Number(this.tendered) || 0) - this.grandTotal));
  }

  canComplete(): boolean {
    if (this.submitting || !this.hospitalId || this.grandTotal <= 0) return false;
    if (this.mode === 'Cash') return this.cashShort() === 0;
    if (this.mode === 'Split') return this.remaining() === 0 && this.splits.every(s => (Number(s.amount) || 0) > 0);
    return true;
  }

  complete(): void {
    if (!this.canComplete() || !this.hospitalId) return;
    let paymentSplits: RetailPaymentSplit[];
    let amountTendered: number;
    if (this.mode === 'Split') {
      paymentSplits = this.splits.map(s => ({ method: s.method, amount: Number(s.amount) }));
      amountTendered = this.grandTotal;
    } else if (this.mode === 'Cash') {
      paymentSplits = [{ method: 'Cash', amount: this.grandTotal }];
      amountTendered = Number(this.tendered);
    } else {
      paymentSplits = [{ method: this.mode, amount: this.grandTotal }];
      amountTendered = this.grandTotal;
    }
    this.completeSale.emit({ hospitalId: this.hospitalId, paymentSplits, amountTendered });
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
