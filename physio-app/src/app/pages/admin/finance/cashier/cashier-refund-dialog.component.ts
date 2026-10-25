import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierInvoice, cashierMethodLabel, CashierRefundablePayment, roundMoney } from "../../../../shared/types/cashier.types";
import { CashierDialogComponent } from "./cashier-dialog.component";

export type CashierRefundSourceState = 'unavailable' | 'loading' | 'ready' | 'error';

export interface CashierRefundSubmit {
    payment: CashierRefundablePayment;
    amount: number;
    reason: string;
}

const REASON_MAX_LENGTH = 500;

@Component({
    selector: 'cashier-refund-dialog',
    standalone: true,
    imports: [SharedModule, CashierDialogComponent, BooButtonComponent, BooInputComponent, BooSelectComponent, BooTextareaComponent],
    template: `
    <cashier-dialog
      [open]="open && !!bill"
      heading="Refund a payment"
      [description]="bill ? bill.billNumber + ' · ' + (bill.patientName || 'Unknown patient') : ''"
      icon="undo-2"
      [busy]="busy"
      (dismiss)="close.emit()"
      (submitForm)="submit()"
    >
      <p *ngIf="sourceState === 'loading'" class="m-0 text-sm text-secondary">Loading payments…</p>
      <p *ngIf="sourceState === 'unavailable'" class="m-0 text-sm text-secondary">Refunds need permission to view payment history, which you don't have.</p>
      <div *ngIf="sourceState === 'error'" class="space-y-2">
        <p class="m-0 text-sm text-danger" role="alert">Couldn't load this bill's payments.</p>
        <button type="button" boo-button variant="secondary" size="sm" (click)="retry.emit()">Try again</button>
      </div>
      <p *ngIf="sourceState === 'ready' && !payments.length" class="m-0 text-sm text-secondary">
        No refundable payment was found for this bill in the latest transactions. Older payments cannot be refunded from this screen.
      </p>

      <ng-container *ngIf="sourceState === 'ready' && payments.length">
        <fieldset class="m-0 p-0 border-0 space-y-4" [disabled]="busy">
          <div>
            <boo-select label="Payment to refund" [options]="paymentOptions" [ngModel]="paymentId" (ngModelChange)="onPaymentChange($event)" required></boo-select>
            <p *ngIf="touched && !selected" class="mt-1 mb-0 text-xs text-danger" role="alert">Choose the payment to refund.</p>
          </div>

          <div>
            <boo-input label="Refund amount" type="number" [(ngModel)]="amount" required></boo-input>
            <p *ngIf="touched && amountError as msg; else amountHint" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
            <ng-template #amountHint>
              <p class="mt-1 mb-0 text-xs text-secondary" *ngIf="selected">Up to {{ selected.refundable | currency:'USD':'symbol':'1.2-2' }} can be refunded on this payment.</p>
            </ng-template>
          </div>

          <div>
            <boo-textarea label="Reason" [(ngModel)]="reason" required [rows]="3" [maxlength]="reasonMaxLength"></boo-textarea>
            <p *ngIf="touched && reasonError as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
          </div>
        </fieldset>
      </ng-container>

      <div dialogFooter class="contents">
        <button type="button" boo-button variant="ghost" (click)="close.emit()" [disabled]="busy">Cancel</button>
        <button type="submit" boo-button variant="primary" [loading]="busy" [disabled]="sourceState !== 'ready' || !payments.length">Issue refund</button>
      </div>
    </cashier-dialog>
  `,
})
export class CashierRefundDialogComponent implements OnChanges {
    @Input() open = false;
    @Input() bill: CashierInvoice | null = null;
    @Input() payments: CashierRefundablePayment[] = [];
    @Input() sourceState: CashierRefundSourceState = 'loading';
    @Input() busy = false;

    @Output() close = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<CashierRefundSubmit>();

    readonly reasonMaxLength = REASON_MAX_LENGTH;

    paymentId: string | null = null;
    amount = '';
    reason = '';
    touched = false;

    get paymentOptions(): { value: string; label: string }[] {
        return this.payments.map(p => ({
            value: p.paymentId,
            label: `${cashierMethodLabel(p.method)} · ${this.money(p.amount)} paid · ${this.money(p.refundable)} refundable`,
        }));
    }

    get selected(): CashierRefundablePayment | null {
        return this.payments.find(p => p.paymentId === this.paymentId) ?? null;
    }

    get amountError(): string | null {
        const value = Number(this.amount);
        if (!this.amount || !(value > 0)) return 'Enter an amount above 0.';
        if (roundMoney(value) !== value) return 'Use at most 2 decimals.';
        if (this.selected && value > this.selected.refundable) return `The most you can refund on this payment is ${this.money(this.selected.refundable)}.`;
        return null;
    }

    get reasonError(): string | null {
        return this.reason.trim() ? null : 'Enter the reason for the refund.';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['open'] && this.open) {
            this.reset();
        }
        // The payment list arrives after the dialog opens: preselect once, never override the user's choice.
        if (this.open && !this.paymentId && this.payments.length) {
            this.onPaymentChange(this.payments[0].paymentId);
        }
    }

    onPaymentChange(paymentId: string | null): void {
        this.paymentId = paymentId;
        const payment = this.selected;
        this.amount = payment ? payment.refundable.toFixed(2) : '';
    }

    submit(): void {
        const payment = this.selected;
        if (this.busy || this.sourceState !== 'ready') return;
        this.touched = true;
        if (!payment || this.amountError || this.reasonError) return;

        this.confirm.emit({ payment, amount: roundMoney(Number(this.amount)), reason: this.reason.trim() });
    }

    private reset(): void {
        this.paymentId = null;
        this.amount = '';
        this.reason = '';
        this.touched = false;
    }

    private money(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
}
