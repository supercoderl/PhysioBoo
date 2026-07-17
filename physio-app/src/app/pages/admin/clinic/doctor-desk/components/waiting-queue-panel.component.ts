import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { QueuePatient } from "../../../../../shared/types/doctor-desk.types";

@Component({
    selector: 'waiting-queue-panel',
    standalone: true,
    imports: [SharedModule, BooButtonAdminComponent, EmptyStateComponent, StatusBadgeComponent],
    template: `
        <div class="bg-surface rounded-2 border border-borderGray/60 flex flex-col h-full">
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-borderGray/60 shrink-0">
                <h2 class="text-sm font-semibold text-regular">Waiting Queue</h2>
                <boo-status-badge [label]="patients.length + ' waiting'" tone="primary"></boo-status-badge>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto p-3 space-y-2" custom-scrollbar>
                <button
                    type="button"
                    *ngFor="let p of patients; let i = index"
                    (click)="select.emit(p)"
                    class="w-full text-left rounded-1.5 border px-3.5 py-3 transition-all duration-200 group"
                    [ngClass]="i === 0
                        ? 'border-primary/30 bg-primary/5 hover:bg-primary/8'
                        : 'border-borderGray/60 hover:border-primary/20 hover:bg-body'"
                >
                    <div class="flex items-start justify-between mb-1.5">
                        <div class="flex items-center gap-2">
                            <span class="text-lg font-bold leading-none" [ngClass]="i === 0 ? 'text-primary' : 'text-regular'">{{ p.queueNumber }}</span>
                            <boo-status-badge *ngIf="p.priority === 'urgent'" label="Urgent" tone="danger"></boo-status-badge>
                        </div>
                        <span class="text-[11px] text-secondary shrink-0">{{ waitTime(p) }}</span>
                    </div>
                    <p class="text-sm font-medium text-regular truncate">{{ p.name }}</p>
                    <p class="text-xs15 text-secondary">{{ p.age }}y · {{ p.gender }} · Arrived {{ p.arrivalTime }}</p>
                    <p class="text-xs15 text-secondary mt-1.5 line-clamp-2">{{ p.reason }}</p>

                    <boo-button-admin
                        *ngIf="i === 0"
                        background="rgb(var(--twc-primary))" textColor="#fff" padding="7px 12px"
                        buttonClass="w-full mt-2.5"
                        [icon]="{ name: 'phone-call', size: 14, color: '#fff' }"
                        (click)="call.emit(p); $event.stopPropagation()"
                    >Call Patient</boo-button-admin>
                </button>

                <boo-empty-state
                    *ngIf="patients.length === 0"
                    icon="circle-check-big"
                    title="Queue is clear"
                    description="No patients are currently waiting."
                ></boo-empty-state>
            </div>
        </div>
    `,
    styles: [`
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    `],
})
export class WaitingQueuePanelComponent {
    @Input() patients: QueuePatient[] = [];
    @Output() call = new EventEmitter<QueuePatient>();
    @Output() select = new EventEmitter<QueuePatient>();

    waitTime(p: QueuePatient): string {
        const [h, m] = p.arrivalTime.split(':').map(Number);
        const arrived = new Date();
        arrived.setHours(h, m, 0, 0);
        const minutes = Math.max(0, Math.floor((Date.now() - arrived.getTime()) / 60000));
        return minutes < 60 ? `${minutes}m wait` : `${Math.floor(minutes / 60)}h ${minutes % 60}m wait`;
    }
}
