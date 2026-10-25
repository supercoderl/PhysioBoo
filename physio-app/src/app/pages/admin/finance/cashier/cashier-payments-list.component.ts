import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierTransactionEvent, cashierMethodLabel } from "../../../../shared/types/cashier.types";

/** Latest payments and refunds across all bills; choosing one opens its bill. */
@Component({
    selector: 'cashier-payments-list',
    standalone: true,
    imports: [SharedModule, BooEmptyStateComponent, BooErrorStateComponent],
    host: { class: 'block' },
    template: `
    <boo-error-state *ngIf="error" appearance="panel" title="We couldn't load recent payments" description="Check your connection and try again." (retry)="retry.emit()"></boo-error-state>

    <ng-container *ngIf="!error">
      <div *ngIf="loading && !events.length" class="bg-surface rounded-2 border border-borderGray/60 divide-y divide-gray-100" aria-busy="true">
        <div *ngFor="let n of [1,2,3,4,5]" class="px-4 py-3 flex items-center justify-between gap-4 animate-pulse">
          <div class="space-y-2"><div class="h-3.5 w-32 bg-gray-100 rounded"></div><div class="h-3 w-24 bg-gray-100 rounded"></div></div>
          <div class="h-4 w-16 bg-gray-100 rounded"></div>
        </div>
      </div>

      <boo-empty-state *ngIf="!loading && !events.length" appearance="panel" icon="banknote" title="No payments recorded yet" description="Payments and refunds taken at the cashier appear here."></boo-empty-state>

      <ul *ngIf="events.length" class="list-none m-0 p-0 bg-surface rounded-2 border border-borderGray/60 divide-y divide-gray-100" aria-label="Recent payments and refunds">
        <li *ngFor="let e of events; trackBy: trackEvent">
          <button type="button" (click)="open.emit(e)" class="w-full px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-gray-50 focus-visible:bg-gray-50 outline-none">
            <span class="min-w-0 leading-tight">
              <span class="block truncate text-sm font-semibold text-regular">{{ e.invoiceNumber || 'Unknown bill' }} · {{ e.patientName || '—' }}</span>
              <span class="block truncate text-[11px] text-secondary">
                {{ e.type === 'Refund' ? 'Refund' : 'Payment' }} · {{ methodLabel(e.method) }} · {{ e.occurredAt | date:'medium' }}<ng-container *ngIf="e.performedBy"> · {{ e.performedBy }}</ng-container>
              </span>
            </span>
            <span class="text-sm font-semibold tabular-nums flex-none" [ngClass]="e.amount < 0 ? 'text-rose-700' : 'text-emerald-700'">{{ e.amount | currency:'USD':'symbol':'1.2-2' }}</span>
          </button>
        </li>
      </ul>
    </ng-container>
  `,
})
export class CashierPaymentsListComponent {
    @Input() events: CashierTransactionEvent[] = [];
    @Input() loading = false;
    @Input() error = false;

    @Output() open = new EventEmitter<CashierTransactionEvent>();
    @Output() retry = new EventEmitter<void>();

    methodLabel = cashierMethodLabel;

    trackEvent(_: number, e: CashierTransactionEvent): string {
        return `${e.id}:${e.type}`;
    }
}
