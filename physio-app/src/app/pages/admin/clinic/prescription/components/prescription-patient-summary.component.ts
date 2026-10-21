import { DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Prescription } from '../../../../../shared/types/prescription-rx.types';

/** Who the prescription is for and who wrote it, plus its issue/cancel details. */
@Component({
    selector: 'rx-patient-summary',
    standalone: true,
    imports: [NgIf, DatePipe],
    template: `
        <section class="bg-surface border border-borderGray rounded-xl px-5 py-4" aria-label="Prescription summary">
            <dl class="m-0 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div class="min-w-0">
                    <dt class="text-xs text-secondary">Patient</dt>
                    <dd class="m-0 font-medium text-regular truncate">{{ prescription.patientName || 'Unnamed patient' }}</dd>
                </div>
                <div class="min-w-0">
                    <dt class="text-xs text-secondary">Prescribed by</dt>
                    <dd class="m-0 font-medium text-regular truncate">{{ prescription.doctorName || 'Unknown doctor' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-secondary">Prescription date</dt>
                    <dd class="m-0 text-regular">{{ prescription.prescriptionDate | date: 'mediumDate' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-secondary">Valid until</dt>
                    <dd class="m-0 text-regular">{{ prescription.validUntil ? (prescription.validUntil | date: 'mediumDate') : 'Not set' }}</dd>
                </div>
                <div *ngIf="prescription.issuedAt">
                    <dt class="text-xs text-secondary">Issued</dt>
                    <dd class="m-0 text-regular">{{ prescription.issuedAt | date: 'medium' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-secondary">Refills</dt>
                    <dd class="m-0 text-regular tabular-nums">{{ prescription.refillCount }} of {{ prescription.maxRefills }}</dd>
                </div>
                <div *ngIf="prescription.cancelledAt" class="col-span-2">
                    <dt class="text-xs text-secondary">Cancelled {{ prescription.cancelledAt | date: 'medium' }}</dt>
                    <dd class="m-0 text-regular">{{ prescription.reasonCancel || 'No reason recorded' }}</dd>
                </div>
            </dl>
        </section>
    `,
})
export class PrescriptionPatientSummaryComponent {
    @Input({ required: true }) prescription!: Prescription;
}
