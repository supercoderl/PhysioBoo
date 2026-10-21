import { NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { QueuePatient } from "../../../../../shared/types/doctor-desk.types";

/** Checked-in patients waiting for the doctor, in the order they should be seen. */
@Component({
    selector: 'waiting-queue-panel',
    standalone: true,
    imports: [NgIf, NgFor, BooButtonComponent, BooEmptyStateComponent, BooIconComponent, BooStatusBadgeComponent],
    template: `
        <section class="bg-surface rounded-xl border border-borderGray" aria-labelledby="dd-waiting-title">
            <header class="flex items-center justify-between gap-2 px-4 py-3 border-b border-rowDivider">
                <h2 id="dd-waiting-title" class="m-0 text-sm font-semibold text-regular">Waiting</h2>
                <boo-status-badge [label]="patients.length + ' waiting'" tone="primary" />
            </header>

            <p *ngIf="patients.length && callBlockedReason" class="m-0 px-4 py-2 text-xs text-secondary border-b border-rowDivider" role="status">
                {{ callBlockedReason }}
            </p>

            <ul *ngIf="patients.length; else emptyTpl" class="m-0 p-0 list-none">
                <li
                    *ngFor="let p of patients; let i = index; trackBy: trackById"
                    class="px-4 py-3 border-b border-rowDivider last:border-b-0 flex items-start justify-between gap-3"
                >
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-sm font-bold tabular-nums" [class.text-primary]="i === 0" [class.text-regular]="i !== 0">{{ p.queueNumber }}</span>
                            <boo-status-badge *ngIf="p.priority === 'urgent'" label="Urgent" tone="danger" />
                            <boo-status-badge *ngIf="i === 0" label="Next" tone="primary" />
                        </div>
                        <p class="m-0 mt-0.5 text-sm font-medium text-regular truncate">{{ p.name || 'Unnamed patient' }}</p>
                        <p class="m-0 text-xs text-secondary">
                            {{ p.age }} y · {{ p.gender }}<ng-container *ngIf="p.arrivalTime"> · Arrived {{ p.arrivalTime }} ({{ waited(p) }})</ng-container>
                        </p>
                        <p *ngIf="p.reason" class="m-0 mt-1 text-xs text-secondary line-clamp-2">{{ p.reason }}</p>
                    </div>
                    <button
                        *ngIf="canCall"
                        type="button"
                        boo-button
                        [variant]="i === 0 ? 'primary' : 'secondary'"
                        size="sm"
                        class="flex-none"
                        [loading]="busyAppointmentId === p.appointmentId"
                        [disabled]="!!callBlockedReason || !!busyAppointmentId"
                        [attr.aria-label]="'Call ' + (p.name || 'patient') + ', ' + p.queueNumber"
                        (click)="call.emit(p)"
                    >
                        <physio-icon *ngIf="busyAppointmentId !== p.appointmentId" name="phone-call" [size]="15" aria-hidden="true" />Call
                    </button>
                </li>
            </ul>

            <ng-template #emptyTpl>
                <boo-empty-state icon="check-circle" title="Nobody is waiting" description="Patients appear here once reception checks them in." />
            </ng-template>
        </section>
    `,
})
export class WaitingQueuePanelComponent {
    @Input() patients: QueuePatient[] = [];
    @Input() canCall = false;
    /** Appointment being started; its Call button shows a spinner and all others are disabled. */
    @Input() busyAppointmentId: string | null = null;
    /** Why Call is unavailable right now (e.g. a consultation is still open); null when it is available. */
    @Input() callBlockedReason: string | null = null;
    @Output() call = new EventEmitter<QueuePatient>();

    trackById(_: number, p: QueuePatient): string {
        return p.appointmentId;
    }

    waited(p: QueuePatient): string {
        const [h, m] = p.arrivalTime.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return '';
        const arrived = new Date();
        arrived.setHours(h, m, 0, 0);
        const minutes = Math.max(0, Math.floor((Date.now() - arrived.getTime()) / 60000));
        return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
    }
}
