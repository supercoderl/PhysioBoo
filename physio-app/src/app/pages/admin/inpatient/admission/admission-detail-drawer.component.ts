import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Admission } from '../../../../shared/types/admission.types';
import { admissionStatus, admissionTypeTone, isActive } from './admission.utils';

/** Read-only view of one admission with the edit and discharge actions the user may take while it is active. */
@Component({
    selector: 'admission-detail-drawer',
    standalone: true,
    imports: [NgIf, DatePipe, ReactiveFormsModule, DrawerComponent, CustomScrollbarDirective, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, BooTextareaComponent],
    template: `
        <drawer [isOpen]="!!admission" (close)="close.emit()">
            <div
                *ngIf="admission as a"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="adm-detail-title"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">{{ a.admissionNumber }}</p>
                        <h2 id="adm-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ a.patientName || 'Unnamed patient' }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-2">
                            <boo-status-badge dotted [label]="status(a.status).label" [tone]="status(a.status).tone" />
                            <boo-status-badge [label]="a.admissionType" [tone]="typeTone(a.admissionType)" />
                        </div>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <section aria-labelledby="adm-d-stay">
                        <h3 id="adm-d-stay" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Stay</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Patient no.</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ a.patientNumber || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Admitted</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ a.admittedAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Department</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.departmentName || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Doctor</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.doctorName || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Bed</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.bedNumber ? 'Bed ' + a.bedNumber + (a.wardName ? ' · ' + a.wardName : '') : 'No bed assigned' }}</dd>
                            </div>
                            <div *ngIf="a.referredBy">
                                <dt class="text-xs text-secondary">Referred by</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.referredBy }}</dd>
                            </div>
                            <div *ngIf="a.dischargedAt">
                                <dt class="text-xs text-secondary">Discharged</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ a.dischargedAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="adm-d-clinical">
                        <h3 id="adm-d-clinical" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Clinical information</h3>
                        <dl class="m-0 flex flex-col gap-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Chief complaint</dt>
                                <dd class="m-0 text-regular whitespace-pre-line break-words">{{ a.chiefComplaint }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Provisional diagnosis</dt>
                                <dd class="m-0 text-regular whitespace-pre-line break-words">{{ a.provisionalDiagnosis }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Known allergies</dt>
                                <dd class="m-0 text-regular whitespace-pre-line break-words">{{ a.allergies || 'None recorded' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Current medications</dt>
                                <dd class="m-0 text-regular whitespace-pre-line break-words">{{ a.currentMedications || 'None recorded' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Medical history</dt>
                                <dd class="m-0 text-regular whitespace-pre-line break-words">{{ a.medicalHistory || 'None recorded' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="adm-d-ins">
                        <h3 id="adm-d-ins" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Insurance</h3>
                        <p *ngIf="!a.hasInsurance" class="m-0 text-sm text-regular">Self-pay: no insurance recorded.</p>
                        <p *ngIf="a.hasInsurance" class="m-0 text-sm text-regular">{{ a.insuranceProvider || '—' }}<ng-container *ngIf="a.policyNumber"> · Policy {{ a.policyNumber }}</ng-container></p>
                    </section>

                    <section *ngIf="a.dischargeNotes" aria-labelledby="adm-d-notes">
                        <h3 id="adm-d-notes" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Discharge notes</h3>
                        <p class="m-0 text-sm text-regular whitespace-pre-line break-words">{{ a.dischargeNotes }}</p>
                    </section>

                    <!-- Discharge: notes stay in the field if the request fails -->
                    <section *ngIf="discharging && active(a)" class="rounded-lg border border-borderGray p-4" aria-labelledby="adm-d-discharge">
                        <h3 id="adm-d-discharge" class="m-0 text-sm font-semibold text-regular">Discharge {{ a.patientName || 'patient' }}</h3>
                        <p class="m-0 mt-1 text-xs text-secondary">
                            The discharge time is set to now.<ng-container *ngIf="a.bedNumber"> Bed {{ a.bedNumber }} becomes available.</ng-container>
                        </p>
                        <div class="mt-3">
                            <label for="adm-discharge-notes" class="block mb-1 text-[13px] font-medium text-regular">Discharge notes</label>
                            <boo-textarea id="adm-discharge-notes" [formControl]="notes" label="Discharge notes" [rows]="3" [maxlength]="2000" />
                        </div>
                        <div class="mt-3 flex items-center justify-end gap-2">
                            <button type="button" boo-button variant="secondary" size="sm" [disabled]="busy" (click)="discharging = false">Keep admitted</button>
                            <button type="button" boo-button variant="primary" size="sm" [loading]="busy" [disabled]="busy" (click)="confirmDischarge()">Discharge</button>
                        </div>
                    </section>
                </div>

                <footer *ngIf="active(a) && !discharging && (canUpdate || canDischarge)" class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button *ngIf="canUpdate" type="button" boo-button variant="secondary" size="sm" [disabled]="busy" (click)="edit.emit()">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit
                    </button>
                    <button *ngIf="canDischarge" type="button" boo-button variant="primary" size="sm" [disabled]="busy" (click)="startDischarge()">
                        <physio-icon name="door-open" [size]="15" aria-hidden="true" />Discharge
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class AdmissionDetailDrawerComponent implements OnChanges {
    @Input() admission: Admission | null = null;
    @Input() canUpdate = false;
    @Input() canDischarge = false;
    /** A discharge request is in flight. */
    @Input() busy = false;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<void>();
    @Output() discharge = new EventEmitter<string | null>();

    readonly status = admissionStatus;
    readonly typeTone = admissionTypeTone;
    readonly active = isActive;
    readonly notes = new FormControl('', { nonNullable: true, validators: Validators.maxLength(2000) });
    discharging = false;

    ngOnChanges(changes: SimpleChanges): void {
        // A different admission (or none) starts with the discharge panel closed; a refresh of the same one keeps it.
        const prev = changes['admission']?.previousValue as Admission | null | undefined;
        if (changes['admission'] && prev?.id !== this.admission?.id) {
            this.discharging = false;
            this.notes.reset('');
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.admission && !this.busy) this.close.emit();
    }

    startDischarge(): void {
        this.discharging = true;
    }

    confirmDischarge(): void {
        if (this.busy) return;
        if (this.notes.invalid) {
            this.notes.markAsTouched();
            return;
        }
        this.discharge.emit(this.notes.value.trim() || null);
    }
}
