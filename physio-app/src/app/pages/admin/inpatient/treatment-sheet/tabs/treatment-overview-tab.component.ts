import { Component, Input, OnChanges, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ClinicalAlert, TreatmentOrder, TreatmentTimelineEntry } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-overview-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-primary mb-3">Recent Activity</h3>
        <div *ngIf="!recent().length"><boo-empty-state icon="history" title="No recent activity"></boo-empty-state></div>
        <ol class="space-y-3" *ngIf="recent().length">
          <li *ngFor="let e of recent()" class="flex gap-3">
            <div class="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"></div>
            <div class="min-w-0">
              <div class="text-sm text-gray-800">{{ e.title }}</div>
              <div class="text-xs text-secondary">{{ e.occurredAt | date:'short' }} · {{ e.actorName }}</div>
            </div>
          </li>
        </ol>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-primary mb-3">Open Orders by Type</h3>
        <div *ngIf="!openOrderCounts().length"><boo-empty-state icon="clipboard-list" title="No open orders"></boo-empty-state></div>
        <ul class="space-y-2" *ngIf="openOrderCounts().length">
          <li *ngFor="let o of openOrderCounts()" class="flex items-center justify-between text-sm">
            <span class="text-gray-700">{{ o.type }}</span>
            <span class="font-semibold text-gray-800">{{ o.count }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4 lg:col-span-2">
        <h3 class="text-sm font-semibold text-primary mb-3">Active Alerts</h3>
        <div *ngIf="!alerts().length"><boo-empty-state icon="shield-check" title="No active clinical alerts"></boo-empty-state></div>
        <ul class="space-y-2" *ngIf="alerts().length">
          <li *ngFor="let a of alerts()" class="text-sm text-gray-700 flex items-center gap-2">
            <boo-icon name="alert-triangle" [size]="14" iconClass="text-amber-500"></boo-icon>
            {{ a.message }}
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class TreatmentOverviewTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  recent = signal<TreatmentTimelineEntry[]>([]);
  alerts = signal<ClinicalAlert[]>([]);
  orders = signal<TreatmentOrder[]>([]);

  constructor(private srv: TreatmentSheetService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    forkJoin({
      timeline: this.srv.getTimeline(this.patientId, { range: 'Last24Hours' }),
      alerts: this.srv.getAlerts(this.patientId),
      orders: this.srv.getOrders(this.patientId),
    }).subscribe({
      next: ({ timeline, alerts, orders }) => {
        if (timeline.success) this.recent.set(timeline.data.slice(0, 8));
        if (alerts.success) this.alerts.set(alerts.data.filter(a => !a.acknowledged));
        if (orders.success) this.orders.set(orders.data.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openOrderCounts(): { type: string; count: number }[] {
    const open = this.orders().filter(o => o.status === 'Active' || o.status === 'Pending');
    const map = new Map<string, number>();
    for (const o of open) map.set(o.orderType, (map.get(o.orderType) ?? 0) + 1);
    return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
  }
}
