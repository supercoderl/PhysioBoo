import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BooButtonComponent, BooEmptyStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { PatientPrescriptionRow, PrescriptionStatus, normalizePrescriptionStatus } from '../../../../../shared/types/prescription-rx.types';
import { STATUS_LABELS, statusTone } from '../prescription-rx.util';

/** A patient's prescriptions, newest first as the server returns them. Opening one is reported to the page. */
@Component({
    selector: 'rx-patient-list',
    standalone: true,
    imports: [NgIf, NgFor, DatePipe, BooButtonComponent, BooEmptyStateComponent, BooStatusBadgeComponent],
    template: `
        <section class="bg-surface border border-borderGray rounded-xl" aria-labelledby="rx-list-title">
            <header class="px-5 py-3 border-b border-rowDivider">
                <h2 id="rx-list-title" class="m-0 text-sm font-semibold text-regular">
                    Prescriptions <span class="text-secondary font-normal">({{ rows.length }})</span>
                </h2>
            </header>

            <boo-empty-state
                *ngIf="!rows.length"
                appearance="panel"
                icon="file-text"
                title="No prescriptions for this patient"
                description="Nothing has been prescribed to this patient yet."
                [headingLevel]="3"
            />

            <div *ngIf="rows.length" class="overflow-x-auto">
                <table class="w-full text-sm">
                    <caption class="sr-only">Prescriptions of this patient</caption>
                    <thead class="bg-gray-50 text-left text-xs text-secondary">
                        <tr>
                            <th scope="col" class="px-5 py-2 font-semibold">Prescription</th>
                            <th scope="col" class="px-3 py-2 font-semibold">Date</th>
                            <th scope="col" class="px-3 py-2 font-semibold">Doctor</th>
                            <th scope="col" class="px-3 py-2 font-semibold">Diagnosis</th>
                            <th scope="col" class="px-3 py-2 font-semibold">Medications</th>
                            <th scope="col" class="px-3 py-2 font-semibold">Status</th>
                            <th scope="col" class="px-5 py-2 font-semibold text-right"><span class="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let row of rows; trackBy: trackRow" class="align-top border-t border-rowDivider">
                            <td class="px-5 py-3 font-medium text-regular whitespace-nowrap">{{ row.prescriptionNumber }}</td>
                            <td class="px-3 py-3 whitespace-nowrap">{{ row.prescriptionDate | date: 'mediumDate' }}</td>
                            <td class="px-3 py-3">{{ row.doctorName || 'Unknown doctor' }}</td>
                            <td class="px-3 py-3 text-secondary">{{ row.diagnosis || 'None recorded' }}</td>
                            <td class="px-3 py-3 text-secondary">{{ medicineNames(row) }}</td>
                            <td class="px-3 py-3"><boo-status-badge [label]="statusLabel(row)" [tone]="tone(row)" dotted /></td>
                            <td class="px-5 py-3 text-right">
                                <button type="button" boo-button variant="secondary" size="sm" [attr.aria-label]="'Open ' + row.prescriptionNumber" (click)="open.emit(row.id)">Open</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `,
})
export class PrescriptionPatientListComponent {
    @Input() rows: PatientPrescriptionRow[] = [];
    @Output() open = new EventEmitter<string>();

    trackRow = (_: number, row: PatientPrescriptionRow) => row.id;

    private status(row: PatientPrescriptionRow): PrescriptionStatus {
        return normalizePrescriptionStatus(row.status);
    }

    statusLabel(row: PatientPrescriptionRow): string {
        return STATUS_LABELS[this.status(row)];
    }

    tone(row: PatientPrescriptionRow) {
        return statusTone(this.status(row));
    }

    medicineNames(row: PatientPrescriptionRow): string {
        return (row.prescriptionItemRows ?? []).map(i => i.medicineName).join(', ') || 'None';
    }
}
