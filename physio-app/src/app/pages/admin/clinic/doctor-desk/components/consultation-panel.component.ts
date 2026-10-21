import { NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { QueuePatient } from "../../../../../shared/types/doctor-desk.types";

/** A visit the doctor has started: who the patient is, why they came, latest vitals and allergies. */
@Component({
    selector: 'consultation-panel',
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent],
    template: `
        <article class="bg-surface rounded-xl border border-borderGray" [attr.aria-labelledby]="'dd-visit-' + patient.appointmentId">
            <header class="flex items-start justify-between gap-3 px-5 py-4 border-b border-rowDivider">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="flex-none text-xl font-bold text-primary tabular-nums leading-none">{{ patient.queueNumber }}</span>
                    <div class="min-w-0">
                        <h3 [id]="'dd-visit-' + patient.appointmentId" class="m-0 text-base font-semibold text-regular truncate">{{ patient.name || 'Unnamed patient' }}</h3>
                        <p class="m-0 text-xs text-secondary">{{ patient.age }} y · {{ patient.gender }} · Booked {{ patient.appointmentTime }}</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-1.5">
                    <boo-status-badge *ngIf="patient.priority === 'urgent'" label="Urgent" tone="danger" />
                    <boo-status-badge label="In consultation" tone="primary" [dotted]="true" />
                </div>
            </header>

            <div class="p-5 flex flex-col gap-4">
                <div class="rounded-lg bg-body px-4 py-3">
                    <h4 class="m-0 mb-1 text-xs font-medium text-secondary">Chief complaint</h4>
                    <p class="m-0 text-sm text-regular whitespace-pre-line">{{ patient.reason || 'Not recorded' }}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="rounded-lg border border-borderGray px-4 py-3">
                        <h4 class="m-0 mb-2 text-xs font-medium text-secondary">Latest vital signs</h4>
                        <dl *ngIf="patient.vitals; else noVitals" class="m-0 grid grid-cols-2 gap-y-1.5 text-xs">
                            <dt class="text-secondary">Blood pressure</dt><dd class="m-0 font-medium text-regular">{{ patient.vitals.bloodPressure || '—' }}</dd>
                            <dt class="text-secondary">Heart rate</dt><dd class="m-0 font-medium text-regular">{{ patient.vitals.heartRate ?? '—' }}<ng-container *ngIf="patient.vitals.heartRate !== null"> bpm</ng-container></dd>
                            <dt class="text-secondary">Temperature</dt><dd class="m-0 font-medium text-regular">{{ patient.vitals.temperature ?? '—' }}<ng-container *ngIf="patient.vitals.temperature !== null"> °C</ng-container></dd>
                        </dl>
                        <ng-template #noVitals><p class="m-0 text-xs text-secondary">No vitals recorded.</p></ng-template>
                    </div>

                    <div class="rounded-lg border border-borderGray px-4 py-3">
                        <h4 class="m-0 mb-2 text-xs font-medium text-secondary">Allergies</h4>
                        <div *ngIf="patient.allergies.length; else noAllergy" class="flex flex-wrap gap-1.5">
                            <boo-status-badge *ngFor="let a of patient.allergies" [label]="a" tone="warning" />
                        </div>
                        <ng-template #noAllergy><p class="m-0 text-xs text-secondary">No known allergies on file.</p></ng-template>
                    </div>
                </div>
            </div>

            <footer *ngIf="canComplete || recordLink" class="px-5 py-3 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                <a *ngIf="recordLink" boo-button variant="secondary" size="sm" [routerLink]="recordLink" [queryParams]="{ patientId: patient.patientId }">
                    <physio-icon name="file-text" [size]="15" aria-hidden="true" />Medical record
                </a>
                <button *ngIf="canComplete" type="button" boo-button variant="primary" size="sm" (click)="complete.emit(patient)">
                    <physio-icon name="check-circle" [size]="15" aria-hidden="true" />Complete consultation
                </button>
            </footer>
        </article>
    `,
})
export class ConsultationPanelComponent {
    @Input({ required: true }) patient!: QueuePatient;
    @Input() canComplete = false;
    /** Route to the patient's medical record; null when the user may not open it. */
    @Input() recordLink: string | null = null;
    @Output() complete = new EventEmitter<QueuePatient>();
}
