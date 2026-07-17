import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SurgeryDashboardTrend } from "../../../../../shared/types/surgery.types";

@Component({
  selector: 'surgery-dashboard-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && trend()" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- OR Utilization by Room -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">OR Utilization by Room</div>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.orUtilizationByRoom" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-16 shrink-0 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-primary rounded-full" [style.width.%]="pct(p.value, 100)"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-10 text-right">{{ p.value }}%</span>
          </div>
        </div>
      </div>

      <!-- Surgery Volume -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Surgery Volume</div>
        <div class="flex items-end gap-2 h-32">
          <div *ngFor="let p of trend()!.surgeryVolume" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-primary/15 rounded-t hover:bg-primary/25 transition-colors" [style.height.%]="pct(p.value, maxOf(trend()!.surgeryVolume))"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Emergency Cases -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Emergency Cases</div>
        <div class="flex items-end gap-2 h-32">
          <div *ngFor="let p of trend()!.emergencyCases" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-rose-200 rounded-t hover:bg-rose-300 transition-colors" [style.height.%]="pct(p.value, maxOf(trend()!.emergencyCases))"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Procedure Distribution -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Procedure Distribution</div>
        <div class="space-y-2">
          <div *ngFor="let p of trend()!.procedureDistribution" class="flex items-center gap-2">
            <span class="text-xs text-gray-600 w-28 shrink-0 truncate">{{ p.label }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-violet-400 rounded-full" [style.width.%]="pct(p.value, maxOf(trend()!.procedureDistribution))"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-8 text-right">{{ p.value }}</span>
          </div>
        </div>
      </div>

      <!-- Average Duration -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="text-sm font-semibold text-gray-800 mb-3">Average Duration (minutes)</div>
        <div class="flex items-end gap-2 h-32">
          <div *ngFor="let p of trend()!.averageDuration" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-emerald-200 rounded-t hover:bg-emerald-300 transition-colors" [style.height.%]="pct(p.value, maxOf(trend()!.averageDuration))"></div>
            <span class="text-[10px] text-gray-500">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Delay & Cancellation Rate -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4 flex items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="relative w-20 h-20 rounded-full shrink-0" [style.background]="donutBackground(trend()!.delayRate, 'rgb(217 119 6)')">
            <div class="absolute inset-2 bg-surface rounded-full flex items-center justify-center">
              <span class="text-xs font-bold text-gray-800">{{ trend()!.delayRate }}%</span>
            </div>
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-800">Delay Rate</div>
            <p class="text-xs text-gray-500">Share of surgeries starting late.</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative w-20 h-20 rounded-full shrink-0" [style.background]="donutBackground(trend()!.cancellationRate, 'rgb(225 29 72)')">
            <div class="absolute inset-2 bg-surface rounded-full flex items-center justify-center">
              <span class="text-xs font-bold text-gray-800">{{ trend()!.cancellationRate }}%</span>
            </div>
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-800">Cancellation Rate</div>
            <p class="text-xs text-gray-500">Share of scheduled surgeries cancelled.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SurgeryDashboardTabComponent implements OnInit {
  isLoading = signal(true);
  trend = signal<SurgeryDashboardTrend | null>(null);

  constructor(private srv: SurgeryService) { }

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

  donutBackground(rate: number, color: string): string {
    const deg = Math.min(360, (rate / 100) * 360 * 5);
    return `conic-gradient(${color} ${deg}deg, rgb(229 231 235) ${deg}deg)`;
  }
}
