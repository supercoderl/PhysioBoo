import { Component, Input, OnChanges } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { PatientFlowSummary } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-patient-flow-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden h-full">
        <div class="flex items-center justify-between px-4 pt-[13px] pb-2.5 border-b border-gray-100">
            <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                    <boo-icon name="trending-up" [size]="13" color="#0e82fd"></boo-icon>
                </span>
                <div>
                    <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Patient Flow</h2>
                    <p class="text-[10.5px] text-gray-400 m-0">24-hour rolling window</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="flex items-center gap-1 text-[10.5px] text-gray-500"><span class="w-5 h-0.5 rounded-sm bg-blue-500"></span>Admissions</span>
                <span class="flex items-center gap-1 text-[10.5px] text-gray-500"><span class="w-5 h-0.5 rounded-sm bg-emerald-500"></span>Discharges</span>
            </div>
        </div>

        <ng-container *ngIf="flow; else skeletonTpl">
            <div class="grid grid-cols-4 border-b border-gray-100">
                <div class="px-3.5 py-2.5 border-r border-gray-100">
                    <p class="text-[9.5px] text-gray-400 m-0 uppercase tracking-wide">Admissions</p>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span class="text-[22px] font-extrabold text-gray-900 tabular-nums">{{ flow.admissionsToday }}</span>
                        <span class="text-[10.5px] font-semibold" [ngClass]="flow.admissionsTrendPct >= 0 ? 'text-emerald-500' : 'text-red-500'">
                            {{ flow.admissionsTrendPct >= 0 ? '↑' : '↓' }} {{ flow.admissionsTrendPct > 0 ? '+' : '' }}{{ flow.admissionsTrendPct }}%
                        </span>
                    </div>
                </div>
                <div class="px-3.5 py-2.5 border-r border-gray-100">
                    <p class="text-[9.5px] text-gray-400 m-0 uppercase tracking-wide">Discharges</p>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span class="text-[22px] font-extrabold text-gray-900 tabular-nums">{{ flow.dischargesToday }}</span>
                        <span class="text-[10.5px] text-gray-500 font-medium">+{{ flow.dischargesPending }} pending</span>
                    </div>
                </div>
                <div class="px-3.5 py-2.5 border-r border-gray-100">
                    <p class="text-[9.5px] text-gray-400 m-0 uppercase tracking-wide">Avg LOS</p>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span class="text-[22px] font-extrabold text-gray-900 tabular-nums">{{ flow.avgLengthOfStayDays }}</span>
                        <span class="text-[10.5px] text-gray-500">days</span>
                    </div>
                </div>
                <div class="px-3.5 py-2.5">
                    <p class="text-[9.5px] text-gray-400 m-0 uppercase tracking-wide">Bed Turnover</p>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span class="text-[22px] font-extrabold text-gray-900 tabular-nums">{{ flow.bedTurnoverRate }}</span>
                        <span class="text-[10.5px] font-semibold" [ngClass]="flow.bedTurnoverTrendPct >= 0 ? 'text-emerald-500' : 'text-amber-500'">
                            {{ flow.bedTurnoverTrendPct >= 0 ? '↑' : '↓' }} {{ flow.bedTurnoverTrendPct }}%
                        </span>
                    </div>
                </div>
            </div>

            <div class="px-4 pt-3 pb-1.5">
                <svg viewBox="0 0 500 112" class="w-full h-[112px] block overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="pf-gAdm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#0e82fd" stop-opacity=".18"></stop>
                            <stop offset="100%" stop-color="#0e82fd" stop-opacity=".01"></stop>
                        </linearGradient>
                        <linearGradient id="pf-gDis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#10b981" stop-opacity=".18"></stop>
                            <stop offset="100%" stop-color="#10b981" stop-opacity=".01"></stop>
                        </linearGradient>
                    </defs>
                    <line x1="0" y1="84" x2="500" y2="84" stroke="#f1f5f9" stroke-width="1"></line>
                    <line x1="0" y1="56" x2="500" y2="56" stroke="#f1f5f9" stroke-width="1"></line>
                    <line x1="0" y1="28" x2="500" y2="28" stroke="#f1f5f9" stroke-width="1"></line>
                    <path [attr.d]="disArea" fill="url(#pf-gDis)"></path>
                    <path [attr.d]="disLine" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path [attr.d]="admArea" fill="url(#pf-gAdm)"></path>
                    <path [attr.d]="admLine" fill="none" stroke="#0e82fd" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </div>
        </ng-container>
        <ng-template #skeletonTpl>
            <div class="p-4 flex flex-col gap-3">
                <div class="h-16 bg-gray-100 rounded animate-pulse"></div>
                <div class="h-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
        </ng-template>
    </div>
  `
})
export class AdminPatientFlowCardComponent implements OnChanges {
    @Input() flow: PatientFlowSummary | null = null;

    admLine = '';
    admArea = '';
    disLine = '';
    disArea = '';

    ngOnChanges() {
        if (!this.flow) return;
        const admissions = this.flow.hourly.map(h => h.admissions);
        const discharges = this.flow.hourly.map(h => h.discharges);
        this.admLine = this.path(admissions, 500, 108);
        this.admArea = this.area(admissions, 500, 108);
        this.disLine = this.path(discharges, 500, 108);
        this.disArea = this.area(discharges, 500, 108);
    }

    private path(data: number[], w: number, h: number): string {
        const mx = Math.max(...data) * 1.1;
        const pts = data.map((v, i) => [
            +((i / (data.length - 1)) * w).toFixed(2),
            +(h - (v / mx) * h * 0.88).toFixed(2),
        ]);
        let d = `M${pts[0]}`;
        for (let i = 1; i < pts.length; i++) {
            const dx = (pts[i][0] - pts[i - 1][0]) * 0.42;
            d += ` C${(pts[i - 1][0] + dx).toFixed(2)},${pts[i - 1][1]} ${(pts[i][0] - dx).toFixed(2)},${pts[i][1]} ${pts[i]}`;
        }
        return d;
    }

    private area(data: number[], w: number, h: number): string {
        return this.path(data, w, h) + ` L${w},${h} L0,${h} Z`;
    }
}
