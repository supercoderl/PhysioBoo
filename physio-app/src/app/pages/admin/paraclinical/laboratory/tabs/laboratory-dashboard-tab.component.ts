import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabDashboardTrend } from "../../../../../shared/types/laboratory.types";

@Component({
  selector: 'laboratory-dashboard-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && trend()" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Daily Orders -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Daily Orders</div>
        <div class="flex items-end gap-2 h-32">
          <div *ngFor="let p of trend()!.dailyOrders" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-primary/15 rounded-t hover:bg-primary/25 transition-colors" [style.height.%]="pct(p.value, maxOf(trend()!.dailyOrders))"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Turnaround Time -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Turnaround Time (hours)</div>
        <div class="flex items-end gap-2 h-32">
          <div *ngFor="let p of trend()!.turnaroundTime" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-emerald-200 rounded-t hover:bg-emerald-300 transition-colors" [style.height.%]="pct(p.value, maxOf(trend()!.turnaroundTime))"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Pending Samples by Stage -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Pending Samples by Stage</div>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.pendingSamplesByStage" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-32 shrink-0 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-amber-400 rounded-full" [style.width.%]="pct(p.value, maxOf(trend()!.pendingSamplesByStage))"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>

      <!-- Test Categories -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Test Categories</div>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.testCategories" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-32 shrink-0 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-primary rounded-full" [style.width.%]="pct(p.value, maxOf(trend()!.testCategories))"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>

      <!-- Critical Result Rate -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div class="relative w-24 h-24 rounded-full shrink-0" [style.background]="donutBackground()">
          <div class="absolute inset-2 bg-surface rounded-full flex items-center justify-center">
            <span class="text-sm font-bold text-gray-800">{{ trend()!.criticalResultRate }}%</span>
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold text-gray-800">Critical Result Rate</div>
          <p class="text-xs text-gray-500 mt-1">Share of completed tests flagged as critical or panic value over the selected period.</p>
        </div>
      </div>

      <!-- Technician Workload -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Technician Workload</div>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.technicianWorkload" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-32 shrink-0 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-violet-400 rounded-full" [style.width.%]="pct(p.value, maxOf(trend()!.technicianWorkload))"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LaboratoryDashboardTabComponent implements OnInit {
  isLoading = signal(true);
  trend = signal<LabDashboardTrend | null>(null);

  constructor(private srv: LaboratoryService) { }

  ngOnInit(): void {
    this.srv.getTrends().subscribe({
      next: (res) => { if (res.success) this.trend.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  maxOf(points: { value: number }[]): number {
    return Math.max(1, ...points.map(p => p.value));
  }

  pct(value: number, max: number): number {
    return Math.max(4, Math.round((value / max) * 100));
  }

  donutBackground(): string {
    const rate = this.trend()?.criticalResultRate ?? 0;
    const deg = Math.min(360, (rate / 100) * 360 * 5);
    return `conic-gradient(rgb(225 29 72) ${deg}deg, rgb(229 231 235) ${deg}deg)`;
  }
}
