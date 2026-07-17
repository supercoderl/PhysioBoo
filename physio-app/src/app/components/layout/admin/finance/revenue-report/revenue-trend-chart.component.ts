import { Component, Input } from "@angular/core";
import { Color, LegendPosition, ScaleType } from "@swimlane/ngx-charts";
import { curveCatmullRom } from "d3-shape";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RevenueTrendPoint } from "../../../../../shared/types/revenue.types";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'revenue-trend-chart',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray/60 rounded-2 p-4 h-full">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-regular">Revenue Trend</h2>
      </div>

      <div *ngIf="loading" class="h-[280px] animate-pulse bg-gray-100 rounded-1.5"></div>

      <div *ngIf="!loading && data.length === 0" class="h-[280px] flex flex-col items-center justify-center text-center gap-2">
        <boo-icon name="bar-chart-3" [size]="28" iconClass="text-gray-300"></boo-icon>
        <p class="text-sm text-secondary">No revenue data for the selected range.</p>
      </div>

      <div *ngIf="!loading && data.length > 0" class="h-[280px]">
        <ngx-charts-area-chart-stacked
          [results]="series"
          [scheme]="colorScheme"
          [curve]="curve"
          [xAxis]="true"
          [yAxis]="true"
          [legend]="true"
          [legendPosition]="LegendPosition.Below"
          [showGridLines]="true"
          [gradient]="false">
        </ngx-charts-area-chart-stacked>
      </div>
    </div>
  `,
})
export class RevenueTrendChartComponent {
    @Input() data: RevenueTrendPoint[] = [];
    @Input() loading = false;
    LegendPosition = LegendPosition;

    curve = curveCatmullRom;
    colorScheme: Color = {
        name: 'revenue-trend',
        selectable: true,
        group: ScaleType.Ordinal,
        domain: ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'],
    };

    get series() {
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
