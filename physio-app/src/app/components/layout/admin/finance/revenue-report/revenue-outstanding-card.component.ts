import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { OutstandingAgingSummary, OutstandingInvoice } from "../../../../../shared/types/revenue.types";

@Component({
    selector: 'revenue-outstanding-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 p-4 h-full">
      <h2 class="text-sm font-semibold text-regular mb-3">Outstanding Revenue (Aging)</h2>

      <div *ngIf="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div *ngFor="let i of [1,2,3,4]" class="h-16 animate-pulse bg-gray-100 rounded-1.5"></div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div *ngFor="let bucket of aging" class="rounded-1.5 border border-gray-100 px-3 py-2.5" [ngClass]="bucketTone(bucket.bucket)">
          <p class="text-[11px] font-medium uppercase tracking-wide text-secondary">{{ bucket.bucket }} days</p>
          <p class="text-lg font-bold text-regular mt-0.5">{{ bucket.amount | currency }}</p>
          <p class="text-xs text-secondary">{{ bucket.count }} bills</p>
        </div>
      </div>

      <div *ngIf="!loading && (invoices?.length ?? 0) === 0" class="h-[100px] flex flex-col items-center justify-center text-center gap-2">
        <boo-icon name="file-clock" [size]="24" iconClass="text-gray-300"></boo-icon>
        <p class="text-sm text-secondary">No outstanding invoices in range.</p>
      </div>

      <div *ngIf="!loading && (invoices?.length ?? 0) > 0" class="divide-y divide-gray-100">
        <div *ngFor="let inv of invoices" class="flex items-center justify-between py-2 text-sm">
          <div class="min-w-0">
            <p class="font-medium text-regular truncate">{{ inv.patientName }}</p>
            <p class="text-xs text-secondary truncate">{{ inv.billNo }} · {{ inv.department }}</p>
          </div>
          <div class="text-right shrink-0 ml-3">
            <p class="font-semibold text-regular">{{ inv.amountDue | currency }}</p>
            <p class="text-xs text-secondary">{{ inv.daysOverdue }}d overdue</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RevenueOutstandingCardComponent {
    @Input() aging: OutstandingAgingSummary[] = [];
    @Input() invoices: OutstandingInvoice[] | null = null;
    @Input() loading = false;

    bucketTone(bucket: OutstandingAgingSummary['bucket']): string {
        switch (bucket) {
            case '0-30': return 'bg-emerald-50/60';
            case '31-60': return 'bg-amber-50/60';
            case '61-90': return 'bg-orange-50/60';
            case '90+': return 'bg-rose-50/60';
        }
    }
}
