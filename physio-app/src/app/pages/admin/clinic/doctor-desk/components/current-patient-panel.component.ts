import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { QueuePatient } from "../../../../../shared/types/doctor-desk.types";

export type CurrentPatientAction = 'complete' | 'transfer' | 'record' | 'print';

@Component({
    selector: 'current-patient-panel',
    standalone: true,
    imports: [SharedModule, BooButtonAdminComponent, EmptyStateComponent, StatusBadgeComponent],
    template: `
        <div class="bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-borderGray/60">
                <h2 class="text-sm font-semibold text-regular">Current Patient</h2>
                <boo-status-badge *ngIf="patient" label="In Consultation" tone="primary" [dotted]="true"></boo-status-badge>
            </div>

            <ng-container *ngIf="patient as p">
                <div class="p-5 space-y-4">
                    <!-- Identity row -->
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="text-2xl font-bold text-primary leading-none shrink-0">{{ p.queueNumber }}</span>
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <h3 class="text-base font-semibold text-regular truncate">{{ p.name }}</h3>
                                    <boo-status-badge *ngIf="p.priority === 'urgent'" label="Urgent" tone="danger"></boo-status-badge>
                                </div>
                                <p class="text-xs15 text-secondary">{{ p.age }} yrs · {{ p.gender }} · Appt {{ p.appointmentTime }}</p>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-[11px] text-secondary leading-none mb-1">In consultation</p>
                            <p class="text-sm font-semibold text-regular tabular-nums">{{ elapsed() }}</p>
                        </div>
                    </div>

                    <!-- Chief complaint -->
                    <div class="rounded-1.5 bg-body px-4 py-3">
                        <p class="text-[11px] font-medium text-secondary mb-1">Chief Complaint</p>
                        <p class="text-sm text-regular">{{ p.reason }}</p>
                    </div>

                    <!-- Vitals + allergies -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-1.5 border border-borderGray/60 px-4 py-3" *ngIf="p.vitals">
                            <p class="text-[11px] font-medium text-secondary mb-2">Vital Signs</p>
                            <div class="grid grid-cols-2 gap-y-1.5 text-xs15">
                                <span class="text-secondary">BP</span><span class="text-regular font-medium">{{ p.vitals.bloodPressure || '—' }}</span>
                                <span class="text-secondary">Heart rate</span><span class="text-regular font-medium">{{ p.vitals.heartRate ? p.vitals.heartRate + ' bpm' : '—' }}</span>
                                <span class="text-secondary">Temp</span><span class="text-regular font-medium">{{ p.vitals.temperature ? p.vitals.temperature + '°C' : '—' }}</span>
                                <span class="text-secondary">SpO2</span><span class="text-regular font-medium">{{ p.vitals.spo2 ? p.vitals.spo2 + '%' : '—' }}</span>
                            </div>
                        </div>
                        <div class="rounded-1.5 border border-borderGray/60 px-4 py-3">
                            <p class="text-[11px] font-medium text-secondary mb-2">Allergies</p>
                            <div class="flex flex-wrap gap-1.5" *ngIf="p.allergies.length; else noAllergy">
                                <boo-status-badge *ngFor="let a of p.allergies" [label]="a" tone="warning"></boo-status-badge>
                            </div>
                            <ng-template #noAllergy>
                                <p class="text-xs15 text-secondary">No known allergies</p>
                            </ng-template>
                        </div>
                    </div>

                    <!-- Quick actions -->
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                        <boo-button-admin
                            background="rgb(var(--twc-primary))" textColor="#fff" padding="9px 16px"
                            [icon]="{ name: 'circle-check-big', size: 15, color: '#fff' }"
                            (click)="action.emit('complete')"
                        >Complete Consultation</boo-button-admin>
                        <boo-button-admin
                            background="transparent" textColor="#374151"
                            [border]="{ width: 1, color: 'rgb(var(--twc-border))' }" padding="9px 14px"
                            [icon]="{ name: 'redo-2', size: 15, color: '#374151' }"
                            (click)="action.emit('transfer')"
                        >Transfer</boo-button-admin>
                        <boo-button-admin
                            background="transparent" textColor="#374151"
                            [border]="{ width: 1, color: 'rgb(var(--twc-border))' }" padding="9px 14px"
                            [icon]="{ name: 'file-text', size: 15, color: '#374151' }"
                            (click)="action.emit('record')"
                        >Medical Record</boo-button-admin>
                        <boo-button-admin
                            background="transparent" textColor="#374151"
                            [border]="{ width: 1, color: 'rgb(var(--twc-border))' }" padding="9px 14px"
                            [icon]="{ name: 'printer', size: 15, color: '#374151' }"
                            (click)="action.emit('print')"
                        >Print Prescription</boo-button-admin>
                    </div>
                </div>
            </ng-container>

            <boo-empty-state
                *ngIf="!patient"
                icon="user-round"
                title="No patient in consultation"
                description="Call the next patient from the waiting queue to begin a consultation."
            >
                <boo-button-admin
                    background="rgb(var(--twc-primary))" textColor="#fff" padding="10px 20px"
                    [icon]="{ name: 'phone-call', size: 15, color: '#fff' }"
                    (click)="callNext.emit()"
                >Call Next Patient</boo-button-admin>
            </boo-empty-state>
        </div>
    `,
})
export class CurrentPatientPanelComponent implements OnInit, OnDestroy {
    @Input() patient: QueuePatient | null = null;
    @Output() action = new EventEmitter<CurrentPatientAction>();
    @Output() callNext = new EventEmitter<void>();

    elapsed = signal('00:00');
    private timer?: ReturnType<typeof setInterval>;

    ngOnInit(): void {
        this.computeElapsed();
        this.timer = setInterval(() => this.computeElapsed(), 1000);
    }

    ngOnDestroy(): void {
        if (this.timer) clearInterval(this.timer);
    }

    private computeElapsed(): void {
        if (!this.patient?.consultationStartedAt) {
            this.elapsed.set('00:00');
            return;
        }
        const startedAt = new Date(this.patient.consultationStartedAt).getTime();
        const diffSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        const minutes = Math.floor(diffSeconds / 60).toString().padStart(2, '0');
        const seconds = (diffSeconds % 60).toString().padStart(2, '0');
        this.elapsed.set(`${minutes}:${seconds}`);
    }
}
