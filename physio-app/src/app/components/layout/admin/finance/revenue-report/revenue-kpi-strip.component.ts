import { Component, Input } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RevenueSummary } from "../../../../../shared/types/revenue.types";

interface Metric {
    label: string;
    value: string;
    hint: string;
    tone?: 'warning' | 'danger';
}

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const COUNT = new Intl.NumberFormat('en-US');

/**
 * Summary of the period: a headline (collected, less refunds, equals net) and two groups of supporting figures.
 * Every number is a field of the summary response; nothing is derived here.
 */
@Component({
    selector: 'revenue-kpi-strip',
    standalone: true,
    imports: [SharedModule, BooStatusBadgeComponent],
    template: `
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4" [attr.aria-busy]="loading">
      <div class="xl:col-span-5 bg-surface border border-borderGray/60 rounded-2 p-5 flex flex-col">
        <h3 class="text-sm font-semibold text-regular mb-3">Collected revenue</h3>

        <ng-container *ngIf="loading; else headline">
          <div class="h-10 w-48 animate-pulse bg-gray-100 rounded-1.5 mb-3"></div>
          <div class="h-4 w-32 animate-pulse bg-gray-100 rounded-1.5 mb-5"></div>
          <div class="space-y-2.5"><div class="h-5 animate-pulse bg-gray-100 rounded-1.5" *ngFor="let i of [1, 2]"></div></div>
        </ng-container>

        <ng-template #headline>
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-[34px] leading-none font-bold text-regular tabular-nums">{{ money(summary?.totalRevenue) }}</span>
            <boo-status-badge *ngIf="summary" [label]="growthLabel" [tone]="growthTone"></boo-status-badge>
          </div>
          <p class="text-xs text-secondary mt-2 mb-5">Paid payments received in the period · growth {{ comparisonLabel }}</p>

          <dl class="mt-auto mb-0 text-sm">
            <div class="flex items-center justify-between py-2 border-t border-borderGray/50">
              <dt class="text-secondary">Refunds issued <span class="text-xs">({{ count(summary?.refundCount) }})</span></dt>
              <dd class="mb-0 font-semibold tabular-nums text-rose-600">{{ summary ? '−' + money(summary.totalRefunds) : '—' }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-t border-borderGray/50">
              <dt class="font-semibold text-regular">Net collected</dt>
              <dd class="mb-0 font-bold tabular-nums text-regular">{{ money(summary?.netRevenue) }}</dd>
            </div>
          </dl>
        </ng-template>
      </div>

      <div class="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section *ngFor="let group of groups" class="bg-surface border border-borderGray/60 rounded-2 p-5" [attr.aria-label]="group.title">
          <h3 class="text-sm font-semibold text-regular mb-3">{{ group.title }}</h3>
          <dl class="mb-0 space-y-3.5">
            <div *ngFor="let m of group.metrics">
              <dt class="text-xs font-medium text-secondary">{{ m.label }}</dt>
              <dd class="mb-0 mt-0.5">
                <div *ngIf="loading" class="h-6 w-28 animate-pulse bg-gray-100 rounded-1.5"></div>
                <span *ngIf="!loading" class="text-lg font-semibold tabular-nums"
                  [ngClass]="m.tone === 'warning' ? 'text-amber-700' : m.tone === 'danger' ? 'text-rose-600' : 'text-regular'">{{ m.value }}</span>
                <span *ngIf="!loading" class="block text-xs text-secondary">{{ m.hint }}</span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>

    <details class="mt-3 text-xs text-secondary">
      <summary class="cursor-pointer inline-flex items-center gap-1.5 font-medium text-secondary hover:text-regular min-h-8">
        <physio-icon name="info" [size]="14"></physio-icon>How these figures are calculated
      </summary>
      <ul class="mt-2 mb-0 pl-5 space-y-1 list-disc">
        <li><strong>Collected revenue</strong>: paid payments by payment date. <strong>Refunds</strong>: by refund date. <strong>Net</strong> = collected − refunds.</li>
        <li><strong>Payments</strong> counts payments; the bill register below lists <em>bills</em> by bill date, so the two counts differ by design.</li>
        <li><strong>Average bill, Discounts and Outstanding</strong> cover bills dated in the period. <strong>Outstanding</strong> excludes cancelled and waived bills.</li>
        <li>The aging card under Receivables counts balances on bills dated up to the end date, aged as of today, so it can exceed Outstanding here.</li>
        <li>Amounts are summed as reported, without currency conversion, and shown in USD.</li>
      </ul>
    </details>
  `,
})
export class RevenueKpiStripComponent {
    @Input() summary: RevenueSummary | null = null;
    @Input() loading = false;
    /** Length of the selected period, to name what growth is measured against. */
    @Input() periodDays: number | null = null;

    get comparisonLabel(): string {
        return this.periodDays ? `vs the previous ${this.periodDays} ${this.periodDays === 1 ? 'day' : 'days'}` : 'vs the previous period';
    }

    get growthLabel(): string {
        const pct = this.summary?.totalRevenueGrowthPct ?? 0;
        return `${pct > 0 ? '▲ +' : pct < 0 ? '▼ ' : ''}${pct.toFixed(1)}%`;
    }

    get growthTone(): 'success' | 'danger' | 'neutral' {
        const pct = this.summary?.totalRevenueGrowthPct ?? 0;
        return pct > 0 ? 'success' : pct < 0 ? 'danger' : 'neutral';
    }

    get groups(): { title: string; metrics: Metric[] }[] {
        const s = this.summary;
        return [
            {
                title: 'Collections',
                metrics: [
                    { label: 'Payments received', value: this.count(s?.totalTransactions), hint: 'Paid payments in the period' },
                    { label: 'Patients', value: this.count(s?.totalPatients), hint: 'With a payment or a bill in the period' },
                    { label: 'Paid by insurance', value: this.money(s?.insuranceRevenue), hint: 'Insurance payments, part of collected revenue' },
                ],
            },
            {
                title: 'Billing and receivables',
                metrics: [
                    { label: 'Average bill', value: this.money(s?.averageBillValue), hint: 'Mean bill total, bills dated in the period' },
                    { label: 'Discounts given', value: this.money(s?.totalDiscounts), hint: `${this.count(s?.discountCount)} discounted bills` },
                    {
                        label: 'Outstanding balance',
                        value: this.money(s?.outstandingRevenue),
                        hint: `${this.count(s?.outstandingCount)} unpaid bills dated in the period`,
                        tone: s && s.outstandingRevenue > 0 ? 'warning' : undefined,
                    },
                ],
            },
        ];
    }

    money(value?: number | null): string {
        return value === undefined || value === null ? '—' : MONEY.format(value);
    }

    count(value?: number | null): string {
        return value === undefined || value === null ? '—' : COUNT.format(value);
    }
}
