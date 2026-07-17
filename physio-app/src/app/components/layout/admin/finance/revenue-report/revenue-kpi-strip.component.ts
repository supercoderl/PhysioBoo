import { Component, Input } from "@angular/core";
import { AdminAnalyticCardComponent } from "../../dashboard/analytic-card.component";
import { StatCardComponent } from "../../../../ui/stat-card.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { AnalyticItem } from "../../../../../shared/types/dashboard.types";
import { RevenueSummary } from "../../../../../shared/types/revenue.types";

@Component({
    selector: 'revenue-kpi-strip',
    standalone: true,
    imports: [SharedModule, AdminAnalyticCardComponent, StatCardComponent],
    template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <admin-analytic-card title="Total Revenue" [analyticItem]="headlineItem"></admin-analytic-card>

      <div class="grid grid-cols-2 gap-3">
        <boo-stat-card label="Net Revenue" [value]="format(summary?.netRevenue)" icon="wallet" tone="primary"></boo-stat-card>
        <boo-stat-card label="Avg. Bill Value" [value]="format(summary?.averageBillValue)" icon="receipt" tone="neutral"></boo-stat-card>
        <boo-stat-card label="Transactions" [value]="summary?.totalTransactions ?? '—'" icon="list-checks" tone="neutral"></boo-stat-card>
        <boo-stat-card label="Insurance Revenue" [value]="format(summary?.insuranceRevenue)" icon="shield-check" tone="primary"></boo-stat-card>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <boo-stat-card label="Outstanding" [value]="format(summary?.outstandingRevenue)" icon="hourglass" tone="warning"></boo-stat-card>
        <boo-stat-card [label]="'Outstanding Bills'" [value]="summary?.outstandingCount ?? '—'" icon="file-clock" tone="warning"></boo-stat-card>
        <boo-stat-card label="Refunds" [value]="format(summary?.totalRefunds)" icon="undo-2" tone="danger"></boo-stat-card>
        <boo-stat-card label="Discounts" [value]="format(summary?.totalDiscounts)" icon="badge-percent" tone="danger"></boo-stat-card>
      </div>
    </div>
  `,
})
export class RevenueKpiStripComponent {
    @Input() summary: RevenueSummary | null = null;

    get headlineItem(): AnalyticItem {
        return {
            icon: 'trending-up',
            color: '#2563EB',
            current: this.summary?.totalRevenue ?? 0,
            percent: this.formatGrowth(this.summary?.totalRevenueGrowthPct),
            trend: this.summary?.revenueTrend ?? [],
        };
    }

    format(value?: number | null): string {
        if (value === undefined || value === null) return '—';
        return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    }

    formatGrowth(value?: number | null): string {
        if (value === undefined || value === null) return '—';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    }
}
