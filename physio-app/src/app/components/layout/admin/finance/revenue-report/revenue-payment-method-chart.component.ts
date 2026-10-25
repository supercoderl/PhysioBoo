import { Component, Input, OnChanges } from "@angular/core";
import { Color, ScaleType } from "@swimlane/ngx-charts";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PaymentMethodBreakdown } from "../../../../../shared/types/revenue.types";
import { methodColor } from "./revenue-chart-colors";

/** Collected revenue by payment method. The legend lists every figure as text, so the doughnut is not the only carrier. */
@Component({
    selector: 'revenue-payment-method-chart',
    standalone: true,
    imports: [SharedModule],
    template: `
    <div class="bg-surface border border-borderGray/60 rounded-2 p-4 h-full" [attr.aria-busy]="loading">
      <h3 class="text-sm font-semibold text-regular mb-0.5">Payment methods</h3>
      <p class="text-xs text-secondary mb-3">Share of collected revenue</p>

      <div *ngIf="loading" class="h-[280px] animate-pulse bg-gray-100 rounded-1.5"></div>

      <div *ngIf="!loading && data.length === 0" class="h-[280px] flex flex-col items-center justify-center text-center gap-2">
        <physio-icon name="pie-chart" [size]="28" class="text-gray-300"></physio-icon>
        <p class="text-sm text-secondary mb-0">No payments were collected in this period.</p>
      </div>

      <div *ngIf="!loading && data.length > 0" class="flex flex-col items-center gap-4">
        <div class="h-[180px] w-[180px] shrink-0" aria-hidden="true">
          <ngx-charts-pie-chart [results]="series" [scheme]="colorScheme" [labels]="false" [legend]="false" [doughnut]="true" [arcWidth]="0.4">
          </ngx-charts-pie-chart>
        </div>

        <ul class="w-full space-y-2 list-none p-0 mb-0">
          <li *ngFor="let item of data" class="flex items-center justify-between gap-3 text-sm">
            <span class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="color(item.method)"></span>
              <span class="text-regular truncate">{{ item.method }}</span>
            </span>
            <span class="text-right shrink-0 tabular-nums">
              <span class="font-semibold text-regular">{{ item.amount | currency }}</span>
              <span class="text-secondary ml-1.5 text-xs">{{ item.percentage.toFixed(1) }}% · {{ item.count }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class RevenuePaymentMethodChartComponent implements OnChanges {
    @Input() data: PaymentMethodBreakdown[] = [];
    @Input() loading = false;

    colorScheme: Color = { name: 'payment-methods', selectable: true, group: ScaleType.Ordinal, domain: [] };
    series: { name: string; value: number }[] = [];

    color = methodColor;

    /** Rebuilt only when the data changes; a fresh array on every check would make ngx-charts redraw constantly. */
    ngOnChanges(): void {
        this.series = this.data.map(item => ({ name: item.method, value: item.amount }));
        this.colorScheme = { ...this.colorScheme, domain: this.data.map(item => methodColor(item.method)) };
    }
}
