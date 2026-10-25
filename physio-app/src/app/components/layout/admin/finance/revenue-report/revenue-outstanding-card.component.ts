import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { OutstandingAgingSummary, OutstandingInvoice } from "../../../../../shared/types/revenue.types";

/**
 * Unpaid balances on bills dated up to the report's end date, aged as of today from the due date (or bill date).
 * This is a snapshot of what is owed now, which is why it can differ from the "Outstanding" figure in the summary.
 */
@Component({
    selector: 'revenue-outstanding-card',
    standalone: true,
    imports: [SharedModule],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 p-4 h-full" [attr.aria-busy]="loading">
      <h3 class="text-sm font-semibold text-regular mb-0.5">Outstanding balances by age</h3>
      <p class="text-xs text-secondary mb-3">Bills dated up to the end date, aged as of today</p>

      <div *ngIf="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div *ngFor="let i of [1,2,3,4]" class="h-20 animate-pulse bg-gray-100 rounded-1.5"></div>
      </div>

      <div *ngIf="!loading && !hasOutstanding" class="h-[160px] flex flex-col items-center justify-center text-center gap-2">
        <physio-icon name="file-clock" [size]="26" class="text-gray-300"></physio-icon>
        <p class="text-sm text-secondary mb-0">No outstanding balances for this scope.</p>
      </div>

      <ng-container *ngIf="!loading && hasOutstanding">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div *ngFor="let bucket of aging" class="rounded-1.5 border border-gray-100 px-3 py-2.5" [ngClass]="bucketTone(bucket.bucket)">
            <p class="text-[11px] font-medium uppercase tracking-wide text-secondary mb-0">{{ bucket.bucket }} days</p>
            <p class="text-lg font-bold text-regular mt-0.5 mb-0 tabular-nums">{{ bucket.amount | currency }}</p>
            <p class="text-xs text-secondary mb-0">{{ bucket.count }} {{ bucket.count === 1 ? 'bill' : 'bills' }}</p>
          </div>
        </div>

        <p class="text-xs font-semibold uppercase tracking-wide text-secondary mb-1">Oldest unpaid bills</p>
        <ul class="divide-y divide-gray-100 list-none p-0 mb-0">
          <li *ngFor="let inv of invoices" class="flex items-center justify-between gap-3 py-2 text-sm">
            <div class="min-w-0">
              <p class="font-medium text-regular truncate mb-0">{{ inv.patientName }}</p>
              <p class="text-xs text-secondary truncate mb-0">{{ inv.billNo }} · {{ inv.department }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-semibold text-regular mb-0 tabular-nums">{{ inv.amountDue | currency }}</p>
              <p class="text-xs text-secondary mb-0">{{ inv.daysOverdue }} {{ inv.daysOverdue === 1 ? 'day' : 'days' }} overdue</p>
            </div>
          </li>
        </ul>
        <p *ngIf="invoiceTotal > (invoices?.length ?? 0)" class="text-xs text-secondary mt-2 mb-0">Showing the oldest {{ invoices?.length }} of {{ invoiceTotal }} unpaid bills.</p>
      </ng-container>
    </div>
  `,
})
export class RevenueOutstandingCardComponent {
    @Input() aging: OutstandingAgingSummary[] = [];
    @Input() invoices: OutstandingInvoice[] | null = null;
    /** Total unpaid bills matching the filter, from the paged search. */
    @Input() invoiceTotal = 0;
    @Input() loading = false;

    get hasOutstanding(): boolean {
        return this.aging.some(bucket => bucket.amount > 0 || bucket.count > 0);
    }

    bucketTone(bucket: OutstandingAgingSummary['bucket']): string {
        switch (bucket) {
            case '0-30': return 'bg-emerald-50/60';
            case '31-60': return 'bg-amber-50/60';
            case '61-90': return 'bg-orange-50/60';
            case '90+': return 'bg-rose-50/60';
        }
    }
}
