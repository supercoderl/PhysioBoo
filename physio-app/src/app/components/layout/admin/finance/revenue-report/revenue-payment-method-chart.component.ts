import { Component, Input } from "@angular/core";
import { Color, ScaleType } from "@swimlane/ngx-charts";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PaymentMethodBreakdown } from "../../../../../shared/types/revenue.types";

@Component({
    selector: 'revenue-payment-method-chart',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray/60 rounded-2 p-4 h-full">
      <h2 class="text-sm font-semibold text-regular mb-3">Payment Methods</h2>

      <div *ngIf="loading" class="h-[280px] animate-pulse bg-gray-100 rounded-1.5"></div>

      <div *ngIf="!loading && data.length === 0" class="h-[280px] flex flex-col items-center justify-center text-center gap-2">
        <boo-icon name="pie-chart" [size]="28" iconClass="text-gray-300"></boo-icon>
        <p class="text-sm text-secondary">No payments recorded for the selected range.</p>
      </div>

      <div *ngIf="!loading && data.length > 0" class="flex flex-col sm:flex-row items-center gap-4">
        <div class="h-[220px] w-[220px] shrink-0">
          <ngx-charts-pie-chart
            [results]="series"
            [scheme]="colorScheme"
            [labels]="false"
            [legend]="false"
            [doughnut]="true"
            [arcWidth]="0.4">
          </ngx-charts-pie-chart>
        </div>

        <ul class="flex-1 w-full space-y-2">
          <li *ngFor="let item of data; let i = index" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="colorScheme.domain[i % colorScheme.domain.length]"></span>
              <span class="text-regular truncate">{{ item.method }}</span>
            </span>
            <span class="text-right shrink-0">
              <span class="font-semibold text-regular">{{ item.percentage.toFixed(1) }}%</span>
              <span class="text-secondary ml-1">({{ item.count }})</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class RevenuePaymentMethodChartComponent {
    @Input() data: PaymentMethodBreakdown[] = [];
    @Input() loading = false;

    colorScheme: Color = {
        name: 'payment-methods',
        selectable: true,
        group: ScaleType.Ordinal,
        domain: ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'],
    };

    get series() {
        return this.data.map(item => ({ name: item.method, value: item.amount }));
    }
}
