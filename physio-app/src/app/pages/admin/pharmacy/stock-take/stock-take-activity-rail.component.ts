import { Component, Input, OnInit } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTakeActivity, StockTakeActivityType, StockTakeKpis } from "../../../../shared/types/stock-take.types";

const ACTIVITY_ICON: Record<StockTakeActivityType, string> = {
    Created: 'plus-circle',
    Assigned: 'user-plus',
    Started: 'play',
    ItemCounted: 'clipboard-list',
    Completed: 'circle-check',
    Approved: 'circle-check-big',
    Rejected: 'circle-x',
    Cancelled: 'ban',
};

@Component({
    selector: 'stock-take-activity-rail',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div class="sticky top-4 space-y-3">
      <div class="bg-surface border border-borderGray/60 rounded-2 p-3.5">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Difference Summary</h3>
        <div class="grid grid-cols-2 gap-2.5">
          <div class="rounded-1.5 bg-emerald-50 p-2.5">
            <p class="text-[11px] text-emerald-700 font-medium">Positive Sessions</p>
            <p class="text-lg font-bold text-emerald-700">{{ kpis?.discrepancySessions ?? 0 }}</p>
          </div>
          <div class="rounded-1.5 bg-rose-50 p-2.5">
            <p class="text-[11px] text-rose-700 font-medium">Discrepancy Sessions</p>
            <p class="text-lg font-bold text-rose-700">{{ kpis?.discrepancySessions ?? 0 }}</p>
          </div>
          <div class="col-span-2 rounded-1.5 bg-gray-50 p-2.5 flex items-center justify-between">
            <span class="text-[11px] text-secondary font-medium">Total Variance Value</span>
            <span class="text-sm font-bold" [ngClass]="(kpis?.totalDifferenceValue ?? 0) < 0 ? 'text-rose-600' : 'text-emerald-600'">
              {{ (kpis?.totalDifferenceValue ?? 0) > 0 ? '+' : '' }}{{ '$' + (kpis?.totalDifferenceValue ?? 0).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-borderGray/60 rounded-2 p-3.5">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Recent Activities</h3>

        <boo-empty-state *ngIf="!loading && !activities.length" icon="inbox" title="No recent activity"></boo-empty-state>

        <div *ngIf="loading" class="flex items-center justify-center py-6">
          <boo-icon name="loader-circle" iconClass="w-5 h-5 text-primary animate-spin"></boo-icon>
        </div>

        <ol class="space-y-3.5" *ngIf="!loading && activities.length">
          <li *ngFor="let a of activities" class="flex gap-2.5">
            <div class="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
              <boo-icon [name]="icon(a.type)" [size]="13" iconClass="text-primary"></boo-icon>
            </div>
            <div class="min-w-0">
              <p class="text-xs text-regular leading-snug">
                <span class="font-semibold">{{ a.actor }}</span> · {{ a.message }}
              </p>
              <p class="text-[11px] text-secondary mt-0.5">{{ a.stockTakeCode }} · {{ a.occurredAt | date:'short' }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  `,
})
export class StockTakeActivityRailComponent implements OnInit {
    @Input() kpis: StockTakeKpis | null = null;

    activities: StockTakeActivity[] = [];
    loading = true;

    constructor(private srv: StockTakeService) { }

    ngOnInit(): void {
        this.srv.getRecentActivities(8).subscribe({
            next: res => { if (res.success) this.activities = res.data; this.loading = false; },
            error: () => this.loading = false,
        });
    }

    icon(type: StockTakeActivityType): string {
        return ACTIVITY_ICON[type] ?? 'circle';
    }
}
