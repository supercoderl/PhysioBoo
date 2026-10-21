import { NgFor, NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { BooEmptyStateComponent, BooIconComponent } from '@physioboo/ui';
import { QueuePatient } from "../../../../../shared/types/doctor-desk.types";

/** Today's finished consultations (read-only). */
@Component({
    selector: 'completed-list',
    standalone: true,
    imports: [NgIf, NgFor, BooEmptyStateComponent, BooIconComponent],
    template: `
        <section class="bg-surface rounded-xl border border-borderGray" aria-labelledby="dd-completed-title">
            <header class="flex items-center justify-between gap-2 px-4 py-3 border-b border-rowDivider">
                <h2 id="dd-completed-title" class="m-0 text-sm font-semibold text-regular">Completed today</h2>
                <span class="text-xs text-secondary tabular-nums">{{ patients.length }}</span>
            </header>

            <ul *ngIf="patients.length; else emptyTpl" class="m-0 p-0 list-none">
                <li *ngFor="let p of patients; trackBy: trackById" class="px-4 py-2.5 border-b border-rowDivider last:border-b-0 flex items-center gap-3 min-w-0">
                    <physio-icon name="check-circle" [size]="15" class="flex-none text-emerald-600" aria-hidden="true" />
                    <span class="flex-none text-xs font-semibold text-secondary tabular-nums">{{ p.queueNumber }}</span>
                    <span class="text-sm text-regular truncate">{{ p.name || 'Unnamed patient' }}</span>
                </li>
            </ul>

            <ng-template #emptyTpl>
                <boo-empty-state icon="file-text" title="No completed consultations yet" />
            </ng-template>
        </section>
    `,
})
export class CompletedListComponent {
    @Input() patients: QueuePatient[] = [];

    trackById(_: number, p: QueuePatient): string {
        return p.appointmentId;
    }
}
