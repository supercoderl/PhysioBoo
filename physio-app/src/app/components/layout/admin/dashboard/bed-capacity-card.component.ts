import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { WardOccupancy } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-bed-capacity-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden h-full">
        <div class="flex items-center justify-between px-4 pt-[13px] pb-2.5 border-b border-gray-100">
            <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                    <boo-icon name="bed-single" [size]="13" color="#0e82fd"></boo-icon>
                </span>
                <div>
                    <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Bed Capacity</h2>
                    <p class="text-[10.5px] text-gray-400 m-0">{{ occupied }} / {{ total }} beds occupied · {{ occupancyPct }}%</p>
                </div>
            </div>
            <div class="flex gap-2 shrink-0">
                <span class="flex items-center gap-1"><span class="w-[7px] h-[7px] bg-red-500 rounded-[1.5px]"></span><span class="text-[9.5px] text-gray-500">≥90%</span></span>
                <span class="flex items-center gap-1"><span class="w-[7px] h-[7px] bg-amber-500 rounded-[1.5px]"></span><span class="text-[9.5px] text-gray-500">70–89%</span></span>
                <span class="flex items-center gap-1"><span class="w-[7px] h-[7px] bg-emerald-500 rounded-[1.5px]"></span><span class="text-[9.5px] text-gray-500">&lt;70%</span></span>
            </div>
        </div>
        <div class="px-4 py-3.5 flex flex-col gap-2">
            <div *ngIf="!wards?.length" class="text-[11px] text-gray-400 py-2">No ward data</div>
            <div *ngFor="let ward of wards" class="flex items-center gap-2">
                <span class="text-[11px] text-gray-700 font-medium w-[82px] shrink-0">{{ ward.name }}</span>
                <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div class="h-full rounded transition-[width] duration-500" [style.width.%]="pct(ward)" [style.background]="colorFor(pct(ward))"></div>
                </div>
                <span class="text-[10.5px] font-bold w-7 text-right" [style.color]="colorFor(pct(ward))">{{ pct(ward) }}%</span>
                <span class="text-[10px] text-gray-400 w-9 text-right tabular-nums">{{ ward.occupied }}/{{ ward.total }}</span>
            </div>
        </div>
    </div>
  `
})
export class AdminBedCapacityCardComponent {
    @Input() wards: WardOccupancy[] | null = null;

    get occupied(): number {
        return (this.wards ?? []).reduce((sum, w) => sum + w.occupied, 0);
    }

    get total(): number {
        return (this.wards ?? []).reduce((sum, w) => sum + w.total, 0);
    }

    get occupancyPct(): number {
        return this.total ? Math.round((this.occupied / this.total) * 100) : 0;
    }

    pct(ward: WardOccupancy): number {
        return ward.total ? Math.round((ward.occupied / ward.total) * 100) : 0;
    }

    colorFor(pct: number): string {
        return pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
    }
}
