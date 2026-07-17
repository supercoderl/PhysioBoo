import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { OperationTheatre } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-active-operations-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden h-full">
        <div class="px-3.5 pt-[13px] pb-2.5 border-b border-gray-100 flex items-center gap-2">
            <span class="w-7 h-7 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
                <boo-icon name="scissors" [size]="13" color="#8b5cf6"></boo-icon>
            </span>
            <div>
                <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Active Operations</h2>
                <p class="text-[10.5px] text-gray-400 m-0">{{ activeCount }} of {{ ops?.length || 0 }} ORs active now</p>
            </div>
        </div>
        <div class="px-3.5 py-3 flex flex-col gap-2">
            <div *ngIf="!ops?.length" class="text-[11px] text-gray-400 py-2">No active operations</div>
            <div *ngFor="let op of ops" class="p-2.5 bg-gray-50 rounded-md border border-gray-100">
                <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9.5px] font-extrabold text-white bg-violet-600 px-1.5 py-0.5 rounded-[3px]">{{ op.room }}</span>
                        <span class="text-xs font-semibold text-gray-900">{{ op.procedure }}</span>
                    </div>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wide shrink-0" [ngClass]="statusClass(op.status)">{{ op.status }}</span>
                </div>
                <div class="flex items-center justify-between mb-[7px]">
                    <span class="text-[11px] text-gray-500">{{ op.surgeon }}</span>
                    <span class="text-[10.5px] text-gray-500 tabular-nums">{{ op.startedAt }} start · {{ op.etaMinutes }} min ETA</span>
                </div>
                <div class="h-[3px] bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-[width] duration-300" [style.width.%]="op.progressPct" [style.background]="progressColor(op.status)"></div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class AdminActiveOperationsCardComponent {
    @Input() ops: OperationTheatre[] | null = null;

    get activeCount(): number {
        return (this.ops ?? []).filter(o => o.status !== 'scheduled').length;
    }

    statusClass(status: OperationTheatre['status']): string {
        switch (status) {
            case 'ongoing': return 'bg-emerald-500/10 text-emerald-600';
            case 'closing': return 'bg-violet-500/10 text-violet-600';
            default: return 'bg-blue-500/10 text-blue-600';
        }
    }

    progressColor(status: OperationTheatre['status']): string {
        switch (status) {
            case 'ongoing': return '#10b981';
            case 'closing': return '#8b5cf6';
            default: return '#0e82fd';
        }
    }
}
