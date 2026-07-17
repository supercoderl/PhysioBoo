import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { DashboardEvent, DashboardEventCategory } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-recent-events-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden flex-1 flex flex-col">
        <div class="px-3.5 pt-2.5 pb-2 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-[7px]">
                <boo-icon name="activity" [size]="13" color="#64748b"></boo-icon>
                <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Recent Events</h2>
            </div>
        </div>
        <div class="px-3.5 pt-1.5 pb-2.5 flex-1 overflow-y-auto">
            <div *ngIf="!events?.length" class="text-[11px] text-gray-400 py-2">No recent events</div>
            <div *ngFor="let ev of events" class="flex gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                <div class="w-[7px] h-[7px] rounded-full shrink-0 mt-[3px]" [style.background]="dotColor(ev.category)"></div>
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] text-gray-700 m-0 leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis">{{ ev.text }}</p>
                    <span class="text-[9.5px] text-gray-400 tabular-nums">{{ ev.occurredAt }}</span>
                </div>
            </div>
        </div>
    </div>
  `
})
export class AdminRecentEventsCardComponent {
    @Input() events: DashboardEvent[] | null = null;

    dotColor(category: DashboardEventCategory): string {
        switch (category) {
            case 'admission': return '#0e82fd';
            case 'discharge': return '#10b981';
            case 'billing': return '#f59e0b';
            case 'surgery': return '#8b5cf6';
            case 'lab': return '#0e82fd';
            case 'pharmacy': return '#f59e0b';
            default: return '#94a3b8';
        }
    }
}
