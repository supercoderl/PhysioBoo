import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { BillingSummary, PaymentStatus } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-billing-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="summary" class="space-y-4">
      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-surface border border-gray-200 rounded-lg px-4 py-3">
          <div class="text-xs text-secondary uppercase tracking-wider mb-1">Total charges</div>
          <div class="text-xl font-semibold text-primary">{{ money(summary.totalCharges) }}</div>
        </div>
        <div class="bg-surface border border-gray-200 rounded-lg px-4 py-3">
          <div class="text-xs text-secondary uppercase tracking-wider mb-1">Total paid</div>
          <div class="text-xl font-semibold text-emerald-600">{{ money(summary.totalPayments) }}</div>
        </div>
        <div class="bg-surface border border-gray-200 rounded-lg px-4 py-3">
          <div class="text-xs text-secondary uppercase tracking-wider mb-1">Insurance covered</div>
          <div class="text-xl font-semibold text-blue-600">{{ money(summary.insurancePaid) }}</div>
        </div>
        <div class="bg-surface border border-gray-200 rounded-lg px-4 py-3">
          <div class="text-xs text-secondary uppercase tracking-wider mb-1">Outstanding</div>
          <div class="text-xl font-semibold" [ngClass]="summary.outstandingBalance > 0 ? 'text-red-600' : 'text-primary'">{{ money(summary.outstandingBalance) }}</div>
        </div>
      </div>

      <!-- Charges -->
      <section class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <header class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-primary m-0">Charges</h3>
          <span class="text-xs text-secondary">{{ summary.bills.length }} bills</span>
        </header>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs text-secondary">
              <tr>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Bill #</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Date</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider hidden md:table-cell">Type</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider text-right">Total</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider text-right hidden lg:table-cell">Insurance</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider text-right">Outstanding</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let b of summary.bills" class="hover:bg-gray-50/60">
                <td class="px-5 py-2.5 font-mono text-xs">{{ b.billNumber }}</td>
                <td class="px-5 py-2.5 text-secondary">{{ b.billDate | date:'mediumDate' }}</td>
                <td class="px-5 py-2.5 text-primary hidden md:table-cell">{{ b.type }}</td>
                <td class="px-5 py-2.5 text-right text-primary font-medium">{{ moneyOf(b.totalAmount, b.currency) }}</td>
                <td class="px-5 py-2.5 text-right text-blue-600 hidden lg:table-cell">{{ moneyOf(b.insurancePaidAmount, b.currency) }}</td>
                <td class="px-5 py-2.5 text-right" [ngClass]="b.outstandingAmount > 0 ? 'text-red-600 font-medium' : 'text-secondary'">{{ moneyOf(b.outstandingAmount, b.currency) }}</td>
                <td class="px-5 py-2.5">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(b.paymentStatus)">
                    {{ b.paymentStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Payments -->
      <section class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <header class="px-5 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-primary m-0">Recent payments</h3>
        </header>
        <ul class="divide-y divide-gray-100 m-0 p-0 list-none">
          <li *ngFor="let p of summary.recentPayments" class="px-5 py-3 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <boo-icon name="check" iconClass="w-4 h-4 text-emerald-600"></boo-icon>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm text-primary font-medium">{{ money(p.amount) }} via {{ p.method }}</div>
              <div class="text-xs text-secondary">{{ p.paymentDate | date:'mediumDate' }} · {{ p.billNumber }}<span *ngIf="p.transactionId"> · {{ p.transactionId }}</span></div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(p.status)">{{ p.status }}</span>
          </li>
          <li *ngIf="!summary.recentPayments.length" class="px-5 py-8 text-center text-xs text-secondary">No payments recorded.</li>
        </ul>
      </section>
    </div>

    <div *ngIf="!summary" class="bg-surface border border-gray-200 rounded-lg py-16 text-center text-sm text-secondary">
      No billing data.
    </div>
    `,
})
export class BillingTabComponent {
  @Input() summary: BillingSummary | null = null;

  money(amount: number): string { return this.moneyOf(amount, this.summary?.currency ?? 'VND'); }
  moneyOf(amount: number, currency: string): string {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount); }
    catch { return `${amount.toLocaleString()} ${currency}`; }
  }
  statusClass(s: PaymentStatus): string {
    switch (s) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700';
      case 'Partial': return 'bg-amber-50 text-amber-700';
      case 'Pending': return 'bg-blue-50 text-blue-700';
      case 'Overdue': return 'bg-red-50 text-red-700';
      case 'Cancelled':
      case 'Refunded':
      case 'Waived': return 'bg-gray-100 text-gray-600';
    }
  }
}
