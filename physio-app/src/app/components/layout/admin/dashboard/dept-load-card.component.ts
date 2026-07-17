import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { DepartmentLoad } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-dept-load-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden h-full">
        <div class="flex items-center justify-between px-3.5 pt-[13px] pb-2.5 border-b border-gray-100">
            <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                    <boo-icon name="gauge" [size]="13" color="#f59e0b"></boo-icon>
                </span>
                <div>
                    <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Dept Load</h2>
                    <p class="text-[10.5px] text-gray-400 m-0">Capacity utilization</p>
                </div>
            </div>
        </div>
        <div class="px-3.5 py-3.5 flex flex-col gap-2.5">
            <div *ngIf="!depts?.length" class="text-[11px] text-gray-400 py-2">No department data</div>
            <div *ngFor="let dept of depts" class="flex flex-col gap-[3px]">
                <div class="flex items-center justify-between">
                    <span class="text-[11.5px] font-medium text-gray-700">{{ dept.name }}</span>
                    <div class="flex items-center gap-[5px]">
                        <span class="text-[11px] font-bold w-7 text-right" [style.color]="colorFor(dept.utilizationPct)">{{ dept.utilizationPct }}%</span>
                        <span *ngIf="dept.isCritical" class="text-[8.5px] font-bold bg-red-500/10 text-red-500 px-1 rounded-[2px] tracking-wide">CRIT</span>
                    </div>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-[width] duration-700" [style.width.%]="dept.utilizationPct" [style.background]="colorFor(dept.utilizationPct)"></div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class AdminDeptLoadCardComponent {
    @Input() depts: DepartmentLoad[] | null = null;

    colorFor(pct: number): string {
        return pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
    }
}
