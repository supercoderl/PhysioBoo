import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { QueuePatient } from "../../../../../shared/types/doctor-desk.types";

@Component({
    selector: 'completed-list',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
        <div class="bg-surface rounded-2 border border-borderGray/60">
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-borderGray/60">
                <h2 class="text-sm font-semibold text-regular">Today's Completed</h2>
                <span class="text-xs15 text-secondary">{{ patients.length }} consultations</span>
            </div>

            <div class="p-2 max-h-64 overflow-y-auto" custom-scrollbar>
                <div
                    *ngFor="let p of patients"
                    class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-1.5 hover:bg-body transition-colors"
                >
                    <div class="flex items-center gap-3 min-w-0">
                        <boo-icon name="circle-check-big" [size]="15" iconClass="text-emerald-500 shrink-0"></boo-icon>
                        <span class="text-xs15 font-semibold text-secondary shrink-0">{{ p.queueNumber }}</span>
                        <span class="text-sm text-regular truncate">{{ p.name }}</span>
                    </div>
                    <span class="text-xs15 text-secondary shrink-0">{{ p.arrivalTime }}</span>
                </div>

                <boo-empty-state
                    *ngIf="patients.length === 0"
                    icon="file-text"
                    title="No completed consultations yet"
                ></boo-empty-state>
            </div>
        </div>
    `,
})
export class CompletedListComponent {
    @Input() patients: QueuePatient[] = [];
}
