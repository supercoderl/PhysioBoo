import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { OperationalStatus } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-dashboard-status-strip',
    standalone: true,
    imports: [SharedModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="bg-primary px-4 py-[7px] flex items-center flex-wrap gap-y-1 min-h-[40px]">
        <ng-container *ngIf="status; else loadingTpl">
            <div class="flex items-center gap-[5px] pr-2.5 border-r border-white/10 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[10px] font-bold text-white tracking-wide uppercase">{{ status.systemStatus }}</span>
            </div>
            <div class="flex items-center gap-[5px] px-2.5 border-r border-white/10 shrink-0">
                <span class="text-[9.5px] text-white/40 uppercase tracking-wide">ER</span>
                <span class="text-xs font-bold text-white tabular-nums">{{ status.erUtilizationPct }}%</span>
                <div class="w-8 h-[3px] bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-amber-500" [style.width.%]="status.erUtilizationPct"></div>
                </div>
            </div>
            <div class="flex items-center gap-[5px] px-2.5 border-r border-white/10 shrink-0">
                <span class="text-[9.5px] text-white/40 uppercase tracking-wide">ICU</span>
                <span class="text-xs font-bold tabular-nums" [ngClass]="status.icuUtilizationPct >= 90 ? 'text-red-500' : 'text-white'">{{ status.icuUtilizationPct }}%</span>
                <span *ngIf="status.icuUtilizationPct >= 90" class="text-[8.5px] font-bold bg-red-500/20 text-red-500 px-1 rounded-[3px] tracking-wide">CRIT</span>
            </div>
            <div class="flex items-center gap-[5px] px-2.5 border-r border-white/10 shrink-0">
                <span class="text-[9.5px] text-white/40 uppercase tracking-wide">OR</span>
                <span class="text-xs font-bold text-white">{{ status.orActive }}/{{ status.orTotal }}</span>
                <div class="flex gap-0.5">
                    <div *ngFor="let slot of orSlots" class="w-1.5 h-1.5 rounded-[1px]" [ngClass]="slot ? 'bg-emerald-500' : 'bg-white/10'"></div>
                </div>
            </div>
            <div class="flex items-center gap-[5px] px-2.5 border-r border-white/10 shrink-0">
                <span class="text-[9.5px] text-white/40 uppercase tracking-wide">Alerts</span>
                <span class="bg-red-500/20 text-red-500 text-[10.5px] font-bold px-1.5 rounded-[3px]">{{ status.criticalAlertCount }} Crit</span>
                <span class="bg-amber-500/15 text-amber-500 text-[10.5px] font-bold px-1.5 rounded-[3px]">{{ status.warningAlertCount }} Warn</span>
            </div>
            <div class="flex items-center gap-[5px] px-2.5 border-r border-white/10 shrink-0">
                <span class="text-[9.5px] text-white/40 uppercase tracking-wide">Staff</span>
                <span class="text-xs font-bold text-emerald-500 tabular-nums">{{ status.staffOnDuty }}/{{ status.staffTotal }}</span>
            </div>
            <div class="flex items-center gap-[5px] px-2.5 shrink-0">
                <span class="text-[9.5px] text-white/40 uppercase tracking-wide">Revenue</span>
                <span class="text-xs font-bold text-white">{{ formattedRevenue(status.revenueToday) }}</span>
                <span class="text-[9.5px] text-white/30">/ {{ formattedRevenue(status.revenueTarget) }}</span>
            </div>
            <div class="ml-auto pl-2.5 border-l border-white/10 shrink-0">
                <span class="text-[10px] text-white/40">{{ dateStr }}</span>
                <span class="ml-1.5 text-[10px] font-semibold text-white/65 bg-white/10 px-1.5 py-0.5 rounded-[3px]">{{ status.shiftLabel }}</span>
                <span class="ml-1.5 text-[10px] text-white/40 tabular-nums">{{ timeStr }}</span>
            </div>
        </ng-container>
        <ng-template #loadingTpl>
            <div class="h-3 w-full max-w-2xl bg-white/10 rounded animate-pulse"></div>
        </ng-template>
    </div>
  `
})
export class AdminDashboardStatusStripComponent implements OnInit, OnDestroy {
    @Input() status: OperationalStatus | null = null;

    timeStr = '';
    dateStr = '';
    private clock: ReturnType<typeof setInterval> | null = null;

    ngOnInit() {
        this.tick();
        this.clock = setInterval(() => this.tick(), 1000);
    }

    ngOnDestroy() {
        if (this.clock) clearInterval(this.clock);
    }

    get orSlots(): boolean[] {
        if (!this.status) return [];
        return Array.from({ length: this.status.orTotal }, (_, i) => i < this.status!.orActive);
    }

    formattedRevenue(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
    }

    private tick() {
        const t = new Date();
        this.timeStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
        this.dateStr = t.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}
