import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import {
    canAdjustBill,
    canCollectPayment,
    canRefundBill,
    canVoidBill,
    CashierInvoice,
    cashierMethodLabel,
    cashierStatusLabel,
    cashierStatusTone,
    CashierTransactionEvent,
} from "../../../../shared/types/cashier.types";

export type CashierPaymentsState = 'unavailable' | 'loading' | 'ready' | 'error';

export interface CashierBillPermissions {
    collect: boolean;
    refund: boolean;
    discount: boolean;
    insurance: boolean;
    void: boolean;
}

/** The selected bill: balance, charges, totals, payments taken and the actions the user may take. */
@Component({
    selector: 'cashier-bill-panel',
    standalone: true,
    imports: [SharedModule, BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooStatusBadgeComponent],
    host: { class: 'block' },
    template: `
    <div class="flex flex-col bg-surface" [ngClass]="embedded ? 'h-screen' : 'h-full min-h-[420px] rounded-2 border border-borderGray/60 overflow-hidden'">
      <boo-empty-state *ngIf="!bill; else billTpl" appearance="panel" icon="receipt" title="Select a bill" description="Choose a bill from the queue to review its charges and take payment."></boo-empty-state>

      <ng-template #billTpl>
        <ng-container *ngIf="bill as b">
          <header class="flex-none px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 id="cashier-bill-title" class="text-lg font-bold text-regular leading-tight m-0 break-words">{{ b.billNumber }}</h2>
                <boo-status-badge [label]="statusLabel(b.status)" [tone]="statusTone(b.status)" dotted></boo-status-badge>
              </div>
              <p class="text-sm text-secondary mt-1 mb-0">
                {{ b.patientName || 'Unknown patient' }}<ng-container *ngIf="b.patientMrn"> · MRN {{ b.patientMrn }}</ng-container><ng-container *ngIf="b.patientPhone"> · {{ b.patientPhone }}</ng-container>
              </p>
              <p class="text-xs text-secondary mt-0.5 mb-0">
                {{ b.billDate | date:'mediumDate' }} · {{ b.visitType || 'Visit' }}<ng-container *ngIf="b.departmentName"> · {{ b.departmentName }}</ng-container><ng-container *ngIf="b.doctorName"> · {{ b.doctorName }}</ng-container>
              </p>
            </div>
            <button *ngIf="embedded" boo-button variant="ghost" size="sm" [iconOnly]="true" (click)="close.emit()" aria-label="Close bill panel">
              <physio-icon name="x" [size]="20"></physio-icon>
            </button>
          </header>

          <div class="flex-1 min-h-0 overflow-y-auto" custom-scrollbar>
            <div class="px-5 py-4 space-y-5">
              <dl class="grid grid-cols-3 gap-2 m-0" aria-label="Balance">
                <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                  <dt class="text-[11px] font-medium text-secondary">Total</dt>
                  <dd class="m-0 mt-0.5 text-base font-bold text-regular tabular-nums">{{ b.totalAmount | currency:'USD':'symbol':'1.2-2' }}</dd>
                </div>
                <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                  <dt class="text-[11px] font-medium text-secondary">Paid</dt>
                  <dd class="m-0 mt-0.5 text-base font-bold text-emerald-700 tabular-nums">{{ b.paidAmount | currency:'USD':'symbol':'1.2-2' }}</dd>
                </div>
                <div class="rounded-1.5 px-3 py-2.5" [ngClass]="b.remainingBalance > 0 ? 'bg-rose-50' : 'bg-gray-50'">
                  <dt class="text-[11px] font-medium text-secondary">Outstanding</dt>
                  <dd class="m-0 mt-0.5 text-base font-bold tabular-nums" [ngClass]="b.remainingBalance > 0 ? 'text-rose-700' : 'text-regular'">{{ b.remainingBalance | currency:'USD':'symbol':'1.2-2' }}</dd>
                </div>
              </dl>

              <section aria-labelledby="cashier-charges-title">
                <h3 id="cashier-charges-title" class="text-sm font-semibold text-regular m-0 mb-2">Charges</h3>
                <p *ngIf="!b.charges.length" class="text-sm text-secondary m-0">No charge lines on this bill.</p>
                <ul *ngIf="b.charges.length" class="list-none m-0 p-0 divide-y divide-gray-100 border border-gray-100 rounded-1.5">
                  <li *ngFor="let c of b.charges" class="px-3 py-2.5 flex items-start justify-between gap-3">
                    <div class="min-w-0 leading-tight">
                      <div class="text-sm font-medium text-regular break-words">{{ c.name || c.category }}</div>
                      <div class="text-[11px] text-secondary">
                        {{ c.category }} · {{ c.quantity | number }} × {{ c.unitPrice | currency:'USD':'symbol':'1.2-2' }}<ng-container *ngIf="c.isInsuranceCovered"> · insurance covered</ng-container>
                      </div>
                    </div>
                    <div class="text-sm font-semibold text-regular tabular-nums flex-none">{{ c.totalAmount | currency:'USD':'symbol':'1.2-2' }}</div>
                  </li>
                </ul>

                <dl class="m-0 mt-3 space-y-1 text-sm">
                  <div class="flex justify-between"><dt class="text-secondary">Subtotal</dt><dd class="m-0 tabular-nums">{{ b.subtotal | currency:'USD':'symbol':'1.2-2' }}</dd></div>
                  <div class="flex justify-between"><dt class="text-secondary">Tax</dt><dd class="m-0 tabular-nums">{{ b.taxAmount | currency:'USD':'symbol':'1.2-2' }}</dd></div>
                  <div class="flex justify-between" *ngIf="b.discountAmount > 0"><dt class="text-secondary">Discount ({{ b.discountPercent | number:'1.0-2' }}%)</dt><dd class="m-0 tabular-nums text-emerald-700">−{{ b.discountAmount | currency:'USD':'symbol':'1.2-2' }}</dd></div>
                  <div class="flex justify-between" *ngIf="b.insuranceCoverageAmount > 0"><dt class="text-secondary">Insurance coverage</dt><dd class="m-0 tabular-nums text-emerald-700">−{{ b.insuranceCoverageAmount | currency:'USD':'symbol':'1.2-2' }}</dd></div>
                  <div class="flex justify-between pt-1.5 border-t border-gray-100 font-semibold"><dt>Total due</dt><dd class="m-0 tabular-nums">{{ b.totalAmount | currency:'USD':'symbol':'1.2-2' }}</dd></div>
                </dl>
              </section>

              <section aria-labelledby="cashier-payments-title">
                <h3 id="cashier-payments-title" class="text-sm font-semibold text-regular m-0 mb-2">Payments</h3>

                <p *ngIf="paymentsState === 'unavailable'" class="text-sm text-secondary m-0">You don't have permission to view payment history.</p>
                <div *ngIf="paymentsState === 'loading'" class="space-y-2 animate-pulse" aria-busy="true"><div class="h-9 bg-gray-100 rounded"></div><div class="h-9 bg-gray-100 rounded"></div></div>
                <boo-inline-error *ngIf="paymentsState === 'error'" what="the payments" [compact]="true" (retry)="retryPayments.emit()"></boo-inline-error>

                <ng-container *ngIf="paymentsState === 'ready'">
                  <p *ngIf="!payments.length" class="text-sm text-secondary m-0">No payments in the latest transactions for this bill.</p>
                  <ul *ngIf="payments.length" class="list-none m-0 p-0 divide-y divide-gray-100 border border-gray-100 rounded-1.5">
                    <li *ngFor="let p of payments; trackBy: trackEvent" class="px-3 py-2 flex items-center justify-between gap-3">
                      <div class="min-w-0 leading-tight">
                        <div class="text-sm text-regular">{{ p.type === 'Refund' ? 'Refund' : 'Payment' }} · {{ methodLabel(p.method) }}</div>
                        <div class="text-[11px] text-secondary">{{ p.occurredAt | date:'medium' }}<ng-container *ngIf="p.performedBy"> · {{ p.performedBy }}</ng-container></div>
                      </div>
                      <div class="text-sm font-semibold tabular-nums flex-none" [ngClass]="p.amount < 0 ? 'text-rose-700' : 'text-emerald-700'">{{ p.amount | currency:'USD':'symbol':'1.2-2' }}</div>
                    </li>
                  </ul>
                </ng-container>
              </section>
            </div>
          </div>

          <footer class="flex-none px-5 py-3 border-t border-gray-100 bg-surface flex items-center gap-2 flex-wrap">
            <button *ngIf="permissions.collect" boo-button variant="primary" (click)="collect.emit()" [disabled]="!collectable">
              <physio-icon name="wallet" [size]="16"></physio-icon>Collect payment
            </button>
            <button *ngIf="permissions.discount" boo-button variant="outline" (click)="discount.emit()" [disabled]="!adjustable">
              <physio-icon name="badge-percent" [size]="16"></physio-icon>Discount
            </button>
            <button *ngIf="permissions.insurance" boo-button variant="outline" (click)="insurance.emit()" [disabled]="!adjustable">
              <physio-icon name="shield-check" [size]="16"></physio-icon>Insurance
            </button>
            <button *ngIf="permissions.refund" boo-button variant="outline" (click)="refund.emit()" [disabled]="!refundable">
              <physio-icon name="undo-2" [size]="16"></physio-icon>Refund
            </button>
            <button *ngIf="permissions.void" boo-button variant="ghost" class="text-rose-700 ml-auto" (click)="voidBill.emit()" [disabled]="!voidable">
              <physio-icon name="ban" [size]="16"></physio-icon>Void
            </button>
          </footer>
        </ng-container>
      </ng-template>
    </div>
  `,
})
export class CashierBillPanelComponent {
    @Input() bill: CashierInvoice | null = null;
    /** Payments and refunds recorded on this bill, newest first. */
    @Input() payments: CashierTransactionEvent[] = [];
    @Input() paymentsState: CashierPaymentsState = 'loading';
    @Input() permissions: CashierBillPermissions = { collect: false, refund: false, discount: false, insurance: false, void: false };
    /** True inside the drawer: full-height layout with a close button. */
    @Input() embedded = false;

    @Output() collect = new EventEmitter<void>();
    @Output() refund = new EventEmitter<void>();
    @Output() discount = new EventEmitter<void>();
    @Output() insurance = new EventEmitter<void>();
    @Output() voidBill = new EventEmitter<void>();
    @Output() retryPayments = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    statusLabel = cashierStatusLabel;
    statusTone = cashierStatusTone;
    methodLabel = cashierMethodLabel;

    get collectable(): boolean { return !!this.bill && canCollectPayment(this.bill); }
    get adjustable(): boolean { return !!this.bill && canAdjustBill(this.bill); }
    get refundable(): boolean { return !!this.bill && canRefundBill(this.bill); }
    get voidable(): boolean { return !!this.bill && canVoidBill(this.bill); }

    trackEvent(_: number, e: CashierTransactionEvent): string {
        return `${e.id}:${e.type}`;
    }
}
