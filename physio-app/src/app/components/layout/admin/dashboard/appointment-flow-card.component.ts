import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { AppointmentFlowSummary } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-appointment-flow-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden h-full">
        <div class="flex items-center justify-between px-4 pt-[13px] pb-2.5 border-b border-gray-100">
            <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                    <boo-icon name="calendar-clock" [size]="13" color="#0e82fd"></boo-icon>
                </span>
                <div>
                    <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Appointment Flow · Today</h2>
                    <p class="text-[10.5px] text-gray-400 m-0" *ngIf="flow">{{ flow.scheduled }} scheduled · {{ flow.slotsRemaining }} slots remaining</p>
                </div>
            </div>
            <div class="flex items-center gap-2.5">
                <span class="flex items-center gap-1"><span class="w-[9px] h-[9px] bg-red-500 rounded-sm"></span><span class="text-[10.5px] text-gray-500">≥95%</span></span>
                <span class="flex items-center gap-1"><span class="w-[9px] h-[9px] bg-blue-500 rounded-sm"></span><span class="text-[10.5px] text-gray-500">70–94%</span></span>
                <span class="flex items-center gap-1"><span class="w-[9px] h-[9px] bg-emerald-500 rounded-sm"></span><span class="text-[10.5px] text-gray-500">&lt;70%</span></span>
            </div>
        </div>

        <ng-container *ngIf="flow; else skeletonTpl">
            <div class="px-4 py-3.5">
                <div class="flex gap-1.5 items-end h-20">
                    <div *ngFor="let slot of flow.hourly" class="flex-1 flex flex-col items-center gap-[3px]">
                        <div class="w-full bg-gray-100 rounded h-16 flex flex-col justify-end overflow-hidden">
                            <div class="w-full rounded-t" [style.height.px]="barHeight(slot.bookedPct)" [style.background]="barColor(slot.bookedPct)"></div>
                        </div>
                        <span class="text-[8.5px] text-gray-400 whitespace-nowrap">{{ slot.hour }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-4 border-t border-gray-100 mt-3 pt-2.5">
                    <div class="text-center">
                        <span class="block text-lg font-extrabold text-gray-900 tabular-nums">{{ flow.scheduled }}</span>
                        <span class="text-[10px] text-gray-400">Scheduled</span>
                    </div>
                    <div class="text-center border-l border-gray-100">
                        <span class="block text-lg font-extrabold text-emerald-500 tabular-nums">{{ flow.confirmed }}</span>
                        <span class="text-[10px] text-gray-400">Confirmed</span>
                    </div>
                    <div class="text-center border-l border-gray-100">
                        <span class="block text-lg font-extrabold text-amber-500 tabular-nums">{{ flow.pending }}</span>
                        <span class="text-[10px] text-gray-400">Pending</span>
                    </div>
                    <div class="text-center border-l border-gray-100">
                        <span class="block text-lg font-extrabold text-red-500 tabular-nums">{{ flow.noShows }}</span>
                        <span class="text-[10px] text-gray-400">No-shows</span>
                    </div>
                </div>
            </div>
        </ng-container>
        <ng-template #skeletonTpl>
            <div class="p-4">
                <div class="h-20 bg-gray-100 rounded animate-pulse"></div>
            </div>
        </ng-template>
    </div>
  `
})
export class AdminAppointmentFlowCardComponent {
    @Input() flow: AppointmentFlowSummary | null = null;

    barHeight(pct: number): number {
        return Math.round(pct * 0.62);
    }

    barColor(pct: number): string {
        return pct >= 95 ? '#ef4444' : pct >= 80 ? '#0e82fd' : '#10b981';
    }
}
