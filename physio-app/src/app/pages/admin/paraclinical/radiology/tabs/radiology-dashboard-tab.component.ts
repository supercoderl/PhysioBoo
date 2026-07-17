import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RadiologyDashboardTrend, RadiologyDashboardTrendPoint } from "../../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-dashboard-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && trend()" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Imaging Volume (last 7 days)</h3>
        <div class="flex items-end gap-2 h-28">
          <div *ngFor="let p of trend()!.imagingVolume" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-primary/70 rounded-t" [style.height.%]="barHeight(p, trend()!.imagingVolume)"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Turnaround Time (hrs)</h3>
        <div class="flex items-end gap-2 h-28">
          <div *ngFor="let p of trend()!.turnaroundTime" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-amber-500/70 rounded-t" [style.height.%]="barHeight(p, trend()!.turnaroundTime)"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Modality Utilization</h3>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.modalityUtilization" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-28 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
              <div class="h-full bg-primary/70" [style.width.%]="barHeight(p, trend()!.modalityUtilization)"></div>
            </div>
            <span class="text-xs text-gray-500 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Pending Reports by Status</h3>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.pendingReportsByStatus" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-32 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
              <div class="h-full bg-amber-500/70" [style.width.%]="barHeight(p, trend()!.pendingReportsByStatus)"></div>
            </div>
            <span class="text-xs text-gray-500 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
        <h3 class="text-sm font-semibold text-gray-800 mb-3 self-start">Critical Finding Rate</h3>
        <div class="w-28 h-28 rounded-full" [style.background]="donutStyle(trend()!.criticalFindingRate)">
          <div class="w-full h-full flex items-center justify-center">
            <span class="text-lg font-bold text-gray-800">{{ trend()!.criticalFindingRate }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Radiologist Workload</h3>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.radiologistWorkload" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-28 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
              <div class="h-full bg-emerald-500/70" [style.width.%]="barHeight(p, trend()!.radiologistWorkload)"></div>
            </div>
            <span class="text-xs text-gray-500 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface border border-gray-200 rounded-lg p-4 lg:col-span-2">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Equipment Utilization (%)</h3>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.equipmentUtilization" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-36 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
              <div class="h-full bg-primary/70" [style.width.%]="p.value"></div>
            </div>
            <span class="text-xs text-gray-500 w-10 text-right">{{ p.value }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RadiologyDashboardTabComponent implements OnInit {
  isLoading = signal(true);
  trend = signal<RadiologyDashboardTrend | null>(null);

  constructor(private srv: RadiologyService) { }

  ngOnInit(): void {
    this.srv.getTrends().subscribe({
      next: (res) => { if (res.success) this.trend.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  barHeight(point: RadiologyDashboardTrendPoint, series: RadiologyDashboardTrendPoint[]): number {
    const max = Math.max(...series.map(p => p.value), 1);
    return Math.max(4, Math.round((point.value / max) * 100));
  }

  donutStyle(rate: number): string {
    const pct = Math.min(100, Math.max(0, rate * 10));
    return `conic-gradient(#e11d48 ${pct}%, #e5e7eb ${pct}% 100%)`;
  }
}
