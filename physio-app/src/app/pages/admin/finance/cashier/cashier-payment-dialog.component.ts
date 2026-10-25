import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CASHIER_PAYMENT_METHODS, CashierInvoice, CashierPaymentMethod, CashierPaymentSplit, roundMoney } from "../../../../shared/types/cashier.types";
import { CashierDialogComponent } from "./cashier-dialog.component";

interface PaymentLine {
    key: number;
    method: CashierPaymentMethod | null;
    amount: string;
}

@Component({
    selector: 'cashier-payment-dialog',
    standalone: true,
    imports: [SharedModule, CashierDialogComponent, BooButtonComponent, BooInputComponent, BooSelectComponent],
    template: `
    <cashier-dialog
      [open]="open && !!bill"
      heading="Collect payment"
      [description]="bill ? bill.billNumber + ' · ' + (bill.patientName || 'Unknown patient') : ''"
      icon="wallet"
      [busy]="busy"
      (dismiss)="close.emit()"
      (submitForm)="submit()"
    >
      <ng-container *ngIf="bill as b">
        <dl class="grid grid-cols-2 gap-2 m-0">
          <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
            <dt class="text-[11px] font-medium text-secondary">Outstanding</dt>
            <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ b.remainingBalance | currency:'USD':'symbol':'1.2-2' }}</dd>
          </div>
          <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
            <dt class="text-[11px] font-medium text-secondary">Already paid</dt>
            <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ b.paidAmount | currency:'USD':'symbol':'1.2-2' }}</dd>
          </div>
        </dl>

        <fieldset class="m-0 p-0 border-0 space-y-3" [disabled]="busy">
          <legend class="text-sm font-semibold text-regular mb-2 p-0">Payment lines</legend>

          <div *ngFor="let line of lines; let i = index; trackBy: trackLine" class="grid grid-cols-[minmax(0,1fr)_minmax(0,9rem)_auto] gap-2 items-start">
            <boo-select label="Method" [options]="methods" [(ngModel)]="line.method" required></boo-select>
            <div>
              <boo-input label="Amount" type="number" [(ngModel)]="line.amount" required></boo-input>
              <p *ngIf="touched && lineError(line) as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
            </div>
            <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" class="mt-1" (click)="removeLine(i)" [disabled]="lines.length === 1" [attr.aria-label]="'Remove payment line ' + (i + 1)">
              <physio-icon name="x" [size]="18"></physio-icon>
            </button>
          </div>

          <button type="button" boo-button variant="link" (click)="addLine()">
            <physio-icon name="plus" [size]="16"></physio-icon>Add payment line
          </button>
        </fieldset>

        <dl class="m-0 space-y-1 text-sm" aria-live="polite">
          <div class="flex justify-between"><dt class="text-secondary">Collecting now</dt><dd class="m-0 font-semibold tabular-nums">{{ total | currency:'USD':'symbol':'1.2-2' }}</dd></div>
          <div class="flex justify-between"><dt class="text-secondary">Outstanding after payment</dt><dd class="m-0 font-semibold tabular-nums">{{ remainingAfter | currency:'USD':'symbol':'1.2-2' }}</dd></div>
        </dl>
        <p *ngIf="touched && totalError as msg" class="m-0 text-xs text-danger" role="alert">{{ msg }}</p>
      </ng-container>

      <div dialogFooter class="contents">
        <button type="button" boo-button variant="ghost" (click)="close.emit()" [disabled]="busy">Cancel</button>
        <button type="submit" boo-button variant="primary" [loading]="busy">Record payment</button>
      </div>
    </cashier-dialog>
  `,
})
export class CashierPaymentDialogComponent implements OnChanges {
    @Input() open = false;
    @Input() bill: CashierInvoice | null = null;
    @Input() busy = false;

    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<{ splits: CashierPaymentSplit[]; amountTendered: number }>();

    readonly methods = CASHIER_PAYMENT_METHODS;

    lines: PaymentLine[] = [];
    touched = false;

    private nextKey = 0;

    ngOnChanges(changes: SimpleChanges): void {
        // Only a fresh open resets the form: a failed request leaves the dialog open with the user's entries.
        if (changes['open'] && this.open && this.bill) {
            this.touched = false;
            this.lines = [this.newLine(this.bill.remainingBalance.toFixed(2))];
        }
    }

    get total(): number {
        return roundMoney(this.lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0));
    }

    get remainingAfter(): number {
        return roundMoney((this.bill?.remainingBalance ?? 0) - this.total);
    }

    get totalError(): string | null {
        if (this.total <= 0) return 'Enter an amount to collect.';
        if (this.remainingAfter < 0) return 'The payment is more than the outstanding balance.';
        return null;
    }

    lineError(line: PaymentLine): string | null {
        const amount = Number(line.amount);
        if (!line.method) return 'Choose a method.';
        if (!line.amount || !(amount > 0)) return 'Enter an amount above 0.';
        if (roundMoney(amount) !== amount) return 'Use at most 2 decimals.';
        return null;
    }

    addLine(): void {
        const remaining = Math.max(0, this.remainingAfter);
        this.lines = [...this.lines, this.newLine(remaining > 0 ? remaining.toFixed(2) : '')];
    }

    removeLine(index: number): void {
        if (this.lines.length > 1) this.lines = this.lines.filter((_, i) => i !== index);
    }

    trackLine(_: number, line: PaymentLine): number {
        return line.key;
    }

    submit(): void {
        if (this.busy || !this.bill) return;
        this.touched = true;
        if (this.totalError || this.lines.some(l => this.lineError(l))) return;

        this.confirm.emit({
            splits: this.lines.map(l => ({ method: l.method as CashierPaymentMethod, amount: roundMoney(Number(l.amount)) })),
            amountTendered: this.total,
        });
    }

    private newLine(amount: string): PaymentLine {
        return { key: this.nextKey++, method: 'Cash', amount };
    }
}
