import { Component, Input, OnChanges } from "@angular/core";
import { Color, LegendPosition, ScaleType } from "@swimlane/ngx-charts";
import { curveMonotoneX } from "d3-shape";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RevenueGranularity } from "../../../../../shared/types/filter.types";
import { RevenueTrendPoint } from "../../../../../shared/types/revenue.types";
import { PAYMENT_METHOD_COLORS } from "./revenue-chart-colors";

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** Collected revenue per bucket, stacked by payment method. Colours match the payment-method split beside it. */
@Component({
    selector: 'revenue-trend-chart',
    standalone: true,
    imports: [SharedModule],
    template: `
    <div class="bg-surface border border-borderGray/60 rounded-2 p-4 h-full" [attr.aria-busy]="loading">
      <h3 class="text-sm font-semibold text-regular mb-0.5">Collected per {{ unit }}</h3>
      <p class="text-xs text-secondary mb-3">Paid payments by payment date, stacked by method</p>

      <div *ngIf="loading" class="h-[280px] animate-pulse bg-gray-100 rounded-1.5"></div>

      <div *ngIf="!loading && !hasRevenue" class="h-[280px] flex flex-col items-center justify-center text-center gap-2">
        <physio-icon name="bar-chart-3" [size]="28" class="text-gray-300"></physio-icon>
        <p class="text-sm text-secondary mb-0">No payments were collected in this period.</p>
      </div>

      <ng-container *ngIf="!loading && hasRevenue">
        <p class="sr-only">{{ summaryText }}</p>
        <div class="h-[280px]" aria-hidden="true">
          <ngx-charts-area-chart-stacked
            [results]="series"
            [scheme]="colorScheme"
            [curve]="curve"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="true"
            [legendPosition]="LegendPosition.Below"
            [showGridLines]="true"
            [yAxisTickFormatting]="formatTick"
            [gradient]="false">
          </ngx-charts-area-chart-stacked>
        </div>
      </ng-container>
    </div>
  `,
})
export class RevenueTrendChartComponent implements OnChanges {
    @Input() data: RevenueTrendPoint[] = [];
    @Input() loading = false;
    @Input() granularity: RevenueGranularity = 'day';

    LegendPosition = LegendPosition;
    curve = curveMonotoneX;
    colorScheme: Color = {
        name: 'revenue-trend',
        selectable: true,
        group: ScaleType.Ordinal,
        domain: [PAYMENT_METHOD_COLORS['Cash'], PAYMENT_METHOD_COLORS['Card'], PAYMENT_METHOD_COLORS['Insurance'], PAYMENT_METHOD_COLORS['UPI'], PAYMENT_METHOD_COLORS['Other']],
    };

    readonly formatTick = (value: number) => `$${COMPACT.format(value)}`;

    get unit(): string {
        return this.granularity === 'week' ? 'week' : this.granularity === 'month' ? 'month' : 'day';
    }

    /** The backend returns an empty bucket per interval, so "no data" means every bucket is zero. */
    get hasRevenue(): boolean {
        return this.data.some(point => point.total > 0);
    }

    get summaryText(): string {
        const total = this.data.reduce((sum, point) => sum + point.total, 0);
        const peak = this.data.reduce((best, point) => (point.total > best.total ? point : best), this.data[0]);
        return `Collected revenue per ${this.unit}: ${MONEY.format(total)} across ${this.data.length} intervals, highest in ${peak.label} at ${MONEY.format(peak.total)}.`;
    }

    /** Rebuilt only when the inputs change; a fresh array on every check would make ngx-charts redraw constantly. */
    series: { name: string; series: { name: string; value: number }[] }[] = [];

    ngOnChanges(): void {
        this.series = this.buildSeries();
    }

    private buildSeries() {
        const seriesDefs: { key: keyof RevenueTrendPoint; name: string }[] = [
            { key: 'cashPayments', name: 'Cash' },
            { key: 'cardPayments', name: 'Card' },
            { key: 'insurancePayments', name: 'Insurance' },
            { key: 'upiPayments', name: 'UPI' },
            { key: 'otherPayments', name: 'Other' },
        ];

        return seriesDefs.map(def => ({
            name: def.name,
            series: this.data.map(point => ({
                name: point.label,
                value: point[def.key] as number,
            })),
        }));
    }
}
