import { Component, Input, OnChanges } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { StaffDutySummary } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-staff-duty-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg p-3.5">
        <div class="flex items-center gap-2 mb-2.5">
            <span class="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                <boo-icon name="user-check" [size]="13" color="#10b981"></boo-icon>
            </span>
            <div>
                <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Staff on Duty</h2>
                <p class="text-[10.5px] text-gray-400 m-0">{{ staff?.shiftLabel }}</p>
            </div>
        </div>

        <div class="flex items-center gap-3.5" *ngIf="staff">
            <svg viewBox="0 0 100 100" class="w-[88px] h-[88px] shrink-0">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" stroke-width="9"></circle>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" stroke-width="9" [attr.stroke-dasharray]="staffDash" stroke-linecap="round" transform="rotate(-90 50 50)"></circle>
                <text x="50" y="46" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a">{{ staff.onDutyPct }}%</text>
                <text x="50" y="58" text-anchor="middle" font-size="7" fill="#94a3b8" letter-spacing="0.5">ON DUTY</text>
            </svg>
            <div class="flex-1 flex flex-col gap-[7px]">
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-[5px]"><span class="w-[7px] h-[7px] bg-emerald-500 rounded-sm"></span><span class="text-[11px] text-gray-700">Doctors</span></span>
                    <span class="text-xs font-bold text-gray-900 tabular-nums">{{ staff.doctors.onDuty }}/{{ staff.doctors.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-[5px]"><span class="w-[7px] h-[7px] bg-blue-500 rounded-sm"></span><span class="text-[11px] text-gray-700">Nurses</span></span>
                    <span class="text-xs font-bold text-gray-900 tabular-nums">{{ staff.nurses.onDuty }}/{{ staff.nurses.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-[5px]"><span class="w-[7px] h-[7px] bg-violet-500 rounded-sm"></span><span class="text-[11px] text-gray-700">Technicians</span></span>
                    <span class="text-xs font-bold text-gray-900 tabular-nums">{{ staff.technicians.onDuty }}/{{ staff.technicians.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-[5px]"><span class="w-[7px] h-[7px] bg-amber-500 rounded-sm"></span><span class="text-[11px] text-gray-700">Admin</span></span>
                    <span class="text-xs font-bold text-gray-900 tabular-nums">{{ staff.admin.onDuty }}/{{ staff.admin.total }}</span>
                </div>
            </div>
        </div>
        <div *ngIf="!staff" class="h-[88px] bg-gray-100 rounded animate-pulse"></div>
    </div>
  `
})
export class AdminStaffDutyCardComponent implements OnChanges {
    @Input() staff: StaffDutySummary | null = null;

    staffDash = '';

    ngOnChanges() {
        if (!this.staff) return;
        const circumference = 2 * Math.PI * 38;
        this.staffDash = `${(this.staff.onDutyPct / 100 * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
    }
}
