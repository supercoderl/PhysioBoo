import { Component, Input, OnChanges, OnInit, SimpleChanges, signal } from "@angular/core";
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { curveCatmullRom } from 'd3-shape';
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockInsight } from "../../../../shared/types/inventory-management.types";

@Component({
    selector: 'inventory-intelligence-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60">
        <h2 class="text-sm font-semibold text-regular">Stock Intelligence</h2>
        <p class="text-[11px] text-secondary" *ngIf="medicineName">Scoped to {{ medicineName }}</p>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div *ngIf="loading()" class="flex items-center justify-center py-16">
          <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
        </div>

        <boo-empty-state *ngIf="!loading() && !insights().length" icon="info" title="No insights right now"></boo-empty-state>

        <div *ngFor="let i of insights()" class="rounded-1.5 border p-3" [ngClass]="toneBorderClass(i.tone)">
          <div class="flex items-start gap-2.5">
            <span class="w-7 h-7 rounded-1.5 flex items-center justify-center shrink-0" [ngClass]="toneBgClass(i.tone)">
              <boo-icon [name]="i.icon" [size]="14" [iconClass]="toneIconClass(i.tone)"></boo-icon>
            </span>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-regular leading-tight">{{ i.message }}</p>
              <p class="text-[11px] text-secondary mt-0.5" *ngIf="i.detail">{{ i.detail }}</p>
            </div>
          </div>
          <div *ngIf="i.trend && i.trend.length" class="h-[60px] mt-2">
            <ngx-charts-line-chart
              [results]="toSeries(i)"
              [scheme]="colorScheme(i.tone)"
              [curve]="curve"
              [xAxis]="false"
              [yAxis]="false"
              [legend]="false"
              [showGridLines]="false"
              [autoScale]="true"
              [tooltipDisabled]="false"
              [animations]="true">
            </ngx-charts-line-chart>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InventoryIntelligencePanelComponent implements OnInit, OnChanges {
    @Input() medicineId: string | null = null;
    @Input() medicineName: string | null = null;

    loading = signal(true);
    insights = signal<StockInsight[]>([]);
    curve = curveCatmullRom;

    constructor(private srv: InventoryManagementService) { }

    ngOnInit(): void {
        this.load();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['medicineId']) this.load();
    }

    private load(): void {
        this.loading.set(true);
        this.srv.getInsights(this.medicineId ?? undefined).subscribe({
            next: res => { if (res.success) this.insights.set(res.data); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    toSeries(insight: StockInsight): any[] {
        return [{
            name: insight.message,
            series: (insight.trend ?? []).map((v, idx) => ({ name: `${idx + 1}`, value: v })),
        }];
    }

    colorScheme(tone: StockInsight['tone']): Color {
        const domain: Record<StockInsight['tone'], string> = {
            primary: '#4f46e5', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', neutral: '#9ca3af',
        };
        return { name: 'custom', selectable: true, group: ScaleType.Ordinal, domain: [domain[tone]] };
    }

    toneBorderClass(tone: StockInsight['tone']): string {
        switch (tone) {
            case 'primary': return 'border-primary/30 bg-primary/5';
            case 'success': return 'border-emerald-200 bg-emerald-50/40';
            case 'warning': return 'border-amber-200 bg-amber-50/40';
            case 'danger': return 'border-rose-200 bg-rose-50/40';
            default: return 'border-borderGray/60';
        }
    }

    toneBgClass(tone: StockInsight['tone']): string {
        switch (tone) {
            case 'primary': return 'bg-primary/10';
            case 'success': return 'bg-emerald-100';
            case 'warning': return 'bg-amber-100';
            case 'danger': return 'bg-rose-100';
            default: return 'bg-gray-100';
        }
    }

    toneIconClass(tone: StockInsight['tone']): string {
        switch (tone) {
            case 'primary': return 'text-primary';
            case 'success': return 'text-emerald-600';
            case 'warning': return 'text-amber-600';
            case 'danger': return 'text-rose-600';
            default: return 'text-gray-500';
        }
    }
}
