import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import { BooButtonComponent, BooInputComponent, BooStatusBadgeComponent, BooDialogComponent } from '@physioboo/ui';
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailTransaction } from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney } from "../../../../shared/utils/retail-pos.utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shown after a successful checkout with the transaction exactly as the API returned it. The receipt endpoint is JSON
 * only (no PDF/print template exists for retail yet), so the actions here are the ones the API supports: email, SMS
 * and a full-transaction refund.
 */
@Component({
  selector: 'retail-receipt-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooInputComponent, BooStatusBadgeComponent, BooDialogComponent],
  template: `
    <boo-dialog *ngIf="transaction" [heading]="transaction.status === 'Refunded' ? 'Sale refunded' : 'Sale complete'" [description]="transaction.transactionNumber + ' · ' + (transaction.completedAt | date:'medium')" tone="success" icon="receipt" [busy]="refundBusy()" (dismiss)="requestClose()">
        <div class="space-y-4">
          <boo-status-badge [label]="transaction.status" [tone]="transaction.status === 'Completed' ? 'success' : 'warning'" [dotted]="true"></boo-status-badge>
          <p *ngIf="transaction.customer" class="text-sm text-regular m-0">{{ transaction.customer.fullName }}<span *ngIf="transaction.customer.mrn" class="text-secondary"> · MRN {{ transaction.customer.mrn }}</span></p>

          <ul class="list-none m-0 p-0 divide-y divide-borderGray/60 border border-borderGray/60 rounded-1.5">
            <li *ngFor="let line of transaction.items" class="px-3 py-2 flex items-start justify-between gap-3 text-sm">
              <div class="min-w-0">
                <p class="m-0 text-regular break-words">{{ line.name }}</p>
                <p class="m-0 text-xs text-secondary">{{ money(line.unitPrice) }} × {{ line.quantity }}<span *ngIf="line.discountPercent"> − {{ line.discountPercent }}%</span></p>
              </div>
              <span class="font-medium text-regular shrink-0">{{ money(line.total) }}</span>
            </li>
          </ul>

          <dl class="m-0 space-y-1 text-sm">
            <div class="flex justify-between"><dt class="text-secondary">Subtotal</dt><dd class="m-0">{{ money(transaction.subtotal) }}</dd></div>
            <div class="flex justify-between" *ngIf="transaction.discountTotal"><dt class="text-secondary">Discount</dt><dd class="m-0">−{{ money(transaction.discountTotal) }}</dd></div>
            <div class="flex justify-between" *ngIf="transaction.insuranceCoverage"><dt class="text-secondary">Insurance coverage</dt><dd class="m-0">−{{ money(transaction.insuranceCoverage) }}</dd></div>
            <div class="flex justify-between" *ngIf="transaction.vat"><dt class="text-secondary">VAT</dt><dd class="m-0">{{ money(transaction.vat) }}</dd></div>
            <div class="flex justify-between pt-1 border-t border-borderGray/60 font-semibold"><dt>Total</dt><dd class="m-0 text-primaryDeep">{{ money(transaction.grandTotal) }}</dd></div>
            <div class="flex justify-between" *ngFor="let p of transaction.paymentSplits"><dt class="text-secondary">Paid by {{ p.method }}</dt><dd class="m-0">{{ money(p.amount) }}</dd></div>
            <div class="flex justify-between"><dt class="text-secondary">Tendered</dt><dd class="m-0">{{ money(transaction.amountTendered) }}</dd></div>
            <div class="flex justify-between"><dt class="text-secondary">Change</dt><dd class="m-0">{{ money(transaction.changeDue) }}</dd></div>
          </dl>

          <div *ngIf="canSend" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-borderGray/60">
            <div class="space-y-2">
              <boo-input type="email" label="Email receipt to" size="small" [(ngModel)]="email" [disabled]="sendingEmail()"></boo-input>
              <button boo-button variant="secondary" size="sm" [block]="true" (click)="sendEmail()" [disabled]="!emailValid()" [loading]="sendingEmail()">Email receipt</button>
            </div>
            <div class="space-y-2">
              <boo-input type="tel" label="SMS receipt to" size="small" [(ngModel)]="phone" [disabled]="sendingSms()"></boo-input>
              <button boo-button variant="secondary" size="sm" [block]="true" (click)="sendSms()" [disabled]="!phone.trim()" [loading]="sendingSms()">Send SMS</button>
            </div>
          </div>

          <div *ngIf="canRefund && transaction.status === 'Completed'" class="pt-2 border-t border-borderGray/60">
            <button *ngIf="!refunding()" boo-button variant="ghost" size="sm" (click)="refunding.set(true)" class="!text-danger">Refund this sale…</button>
            <div *ngIf="refunding()" class="space-y-2">
              <p class="text-xs text-secondary m-0">The whole sale is refunded and its stock returned to inventory. This cannot be undone.</p>
              <boo-input label="Refund reason" size="small" [(ngModel)]="reason" [required]="true" [disabled]="refundBusy()"></boo-input>
              <div class="flex justify-end gap-2">
                <button boo-button variant="ghost" size="sm" (click)="refunding.set(false)" [disabled]="refundBusy()">Keep sale</button>
                <button boo-button variant="danger" size="sm" (click)="refund()" [disabled]="!reason.trim()" [loading]="refundBusy()" >Confirm refund</button>
              </div>
            </div>
          </div>
        </div>
        <button boo-dialog-footer type="button" boo-button variant="primary" size="sm" (click)="requestClose()">Done</button>
    </boo-dialog>
  `,
})
export class RetailReceiptDialogComponent implements OnChanges {
  @Input() transaction: RetailTransaction | null = null;
  /** pharmacy:retail-transaction:read — the email and SMS endpoints are guarded by it. */
  @Input() canSend = false;
  @Input() canRefund = false;
  @Output() close = new EventEmitter<void>();
  @Output() refunded = new EventEmitter<RetailTransaction>();


  private readonly srv = inject(RetailPosService);
  private readonly toastSrv = inject(ToastService);

  email = '';
  phone = '';
  reason = '';
  sendingEmail = signal(false);
  sendingSms = signal(false);
  refunding = signal(false);
  refundBusy = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['transaction'];
    if (!change) return;
    if (change.currentValue && !change.previousValue) {
      this.email = '';
      this.phone = this.transaction?.customer?.phone ?? '';
      this.reason = '';
      this.refunding.set(false);
    }
  }

  requestClose(): void {
    if (!this.refundBusy()) this.close.emit();
  }

  emailValid(): boolean {
    return EMAIL_PATTERN.test(this.email.trim()) && !this.sendingEmail();
  }

  sendEmail(): void {
    if (!this.transaction || !this.emailValid()) return;
    this.sendingEmail.set(true);
    this.srv.emailReceipt(this.transaction.id, this.email.trim()).subscribe({
      next: res => {
        this.sendingEmail.set(false);
        if (res.success) this.toastSrv.success(`Receipt queued for ${this.email.trim()}`);
      },
      error: () => this.sendingEmail.set(false),
    });
  }

  sendSms(): void {
    if (!this.transaction || !this.phone.trim() || this.sendingSms()) return;
    this.sendingSms.set(true);
    this.srv.smsReceipt(this.transaction.id, this.phone.trim()).subscribe({
      next: res => {
        this.sendingSms.set(false);
        if (res.success) this.toastSrv.success(`Receipt SMS queued for ${this.phone.trim()}`);
      },
      error: () => this.sendingSms.set(false),
    });
  }

  refund(): void {
    if (!this.transaction || !this.reason.trim() || this.refundBusy()) return;
    this.refundBusy.set(true);
    this.srv.refund(this.transaction.id, this.reason.trim()).subscribe({
      next: res => {
        this.refundBusy.set(false);
        if (res.success && res.data) {
          this.refunding.set(false);
          this.toastSrv.success(`${res.data.transactionNumber} refunded`);
          this.refunded.emit(res.data);
        }
      },
      error: () => this.refundBusy.set(false), // reason stays filled so the cashier can retry
    });
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }
}
