import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Patient } from '../../../../shared/types/patient.types';
import { ageOf, displayName, flagsOf, genderOf, parseIsoDate, patientTypeOf, riskOf } from './patient.utils';

/**
 * Read-only profile of one patient: contact, care, visits and billing, insurance, clinical background and consent.
 * Allergies sit first in the clinical section because they matter most at a glance.
 */
@Component({
    selector: 'crm-patient-detail-drawer',
    standalone: true,
    imports: [NgIf, NgFor, DatePipe, DecimalPipe, RouterLink, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="!!patient" (close)="close.emit()">
            <div
                *ngIf="patient as p"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="patient-detail-title"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">{{ p.patientNumber || 'Patient' }}</p>
                        <h2 id="patient-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(p) }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-1.5">
                            <boo-status-badge dotted [label]="risk(p).label" [tone]="risk(p).tone" />
                            <boo-status-badge [label]="type(p)" tone="neutral" />
                            <boo-status-badge *ngFor="let f of flags(p)" [label]="f" [tone]="f === 'VIP' ? 'primary' : 'neutral'" />
                        </div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close patient profile" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <section aria-labelledby="pd-contact">
                        <h3 id="pd-contact" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Contact and profile</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Phone</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ p.phone || '—' }}</dd>
                            </div>
                            <div class="min-w-0">
                                <dt class="text-xs text-secondary">Email</dt>
                                <dd class="m-0 font-medium text-regular break-all">{{ p.email || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Date of birth</dt>
                                <dd class="m-0 font-medium text-regular">
                                    <ng-container *ngIf="age(p) !== null; else dash">{{ dob(p) | date: 'd MMM y' }} <span class="text-secondary font-normal">· {{ age(p) }} yrs</span></ng-container>
                                </dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Gender</dt>
                                <dd class="m-0 font-medium text-regular">{{ gender(p) || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Occupation</dt>
                                <dd class="m-0 font-medium text-regular break-words">{{ p.occupation || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Registered</dt>
                                <dd class="m-0 font-medium text-regular">{{ (p.registrationDate | date: 'd MMM y') || '—' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="pd-care" class="pt-5 border-t border-rowDivider">
                        <h3 id="pd-care" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Care</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Primary doctor</dt>
                                <dd class="m-0 font-medium text-regular">{{ doctorName(p.primaryDoctorId) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Preferred doctor</dt>
                                <dd class="m-0 font-medium text-regular">{{ doctorName(p.preferredDoctorId) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Preferred facility</dt>
                                <dd class="m-0 font-medium text-regular">{{ hospitalName(p.preferredHospitalId) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Preferred time</dt>
                                <dd class="m-0 font-medium text-regular">{{ p.preferredAppointmentTime || '—' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="pd-visits" class="pt-5 border-t border-rowDivider">
                        <h3 id="pd-visits" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Visits and billing</h3>
                        <dl class="m-0 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Last visit</dt>
                                <dd class="m-0 font-medium text-regular">{{ (p.lastVisitDate | date: 'd MMM y') || 'None yet' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Next follow-up</dt>
                                <dd class="m-0 font-medium text-regular">{{ (p.nextFollowUpDate | date: 'd MMM y') || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Total visits</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ p.totalVisits }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Total spent</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ p.totalAmountSpent | number: '1.0-2' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Outstanding</dt>
                                <dd class="m-0 font-medium tabular-nums" [class.text-danger]="p.outstandingBalance > 0" [class.text-regular]="p.outstandingBalance <= 0">{{ p.outstandingBalance | number: '1.0-2' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Loyalty points</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ p.loyaltyPoints }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="pd-insurance" class="pt-5 border-t border-rowDivider">
                        <h3 id="pd-insurance" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Insurance</h3>
                        <p *ngIf="!p.inssuranceProvider && !p.inssurancePolicyNumber; else insuranceTpl" class="m-0 text-sm text-placeholder">No insurance on file</p>
                        <ng-template #insuranceTpl>
                            <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <dt class="text-xs text-secondary">Provider</dt>
                                    <dd class="m-0 font-medium text-regular break-words">{{ p.inssuranceProvider || '—' }}</dd>
                                </div>
                                <div>
                                    <dt class="text-xs text-secondary">Policy no.</dt>
                                    <dd class="m-0 font-medium text-regular tabular-nums break-all">{{ p.inssurancePolicyNumber || '—' }}</dd>
                                </div>
                                <div>
                                    <dt class="text-xs text-secondary">Expires</dt>
                                    <dd class="m-0 font-medium" [class.text-danger]="insuranceExpired(p)" [class.text-regular]="!insuranceExpired(p)">
                                        {{ (p.inssuranceExpiryDate | date: 'd MMM y') || '—' }}<span *ngIf="insuranceExpired(p)" class="font-normal"> · expired</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt class="text-xs text-secondary">Coverage</dt>
                                    <dd class="m-0 font-medium text-regular tabular-nums">{{ p.inssuranceCoverageAmount !== null ? (p.inssuranceCoverageAmount | number: '1.0-2') : '—' }}</dd>
                                </div>
                            </dl>
                        </ng-template>
                    </section>

                    <section aria-labelledby="pd-clinical" class="pt-5 border-t border-rowDivider">
                        <h3 id="pd-clinical" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Clinical background</h3>
                        <div *ngIf="p.allergyInformation" class="mb-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5">
                            <physio-icon name="triangle-alert" [size]="16" class="flex-none mt-0.5 text-amber-700" aria-hidden="true" />
                            <div class="min-w-0">
                                <p class="m-0 text-xs font-semibold text-amber-800">Allergies</p>
                                <p class="m-0 mt-0.5 text-sm text-regular whitespace-pre-line break-words">{{ p.allergyInformation }}</p>
                            </div>
                        </div>
                        <dl class="m-0 flex flex-col gap-3 text-sm">
                            <div *ngFor="let n of notes(p)">
                                <dt class="text-xs text-secondary">{{ n.label }}</dt>
                                <dd class="m-0 text-regular whitespace-pre-line break-words" [class.text-placeholder]="!n.value">{{ n.value || 'None recorded' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="pd-consent" class="pt-5 border-t border-rowDivider">
                        <h3 id="pd-consent" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Consent</h3>
                        <ul class="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                            <li *ngFor="let c of consents(p)" class="flex items-center gap-2">
                                <physio-icon [name]="c.given ? 'circle-check' : 'circle-x'" [size]="15" [class]="c.given ? 'text-emerald-600' : 'text-placeholder'" aria-hidden="true" />
                                <span class="text-regular">{{ c.label }}</span>
                                <span class="sr-only">{{ c.given ? 'given' : 'not given' }}</span>
                            </li>
                        </ul>
                    </section>
                </div>

                <footer *ngIf="canUpdate || canDelete || recordLink" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" (click)="remove.emit(p)">
                        <physio-icon name="trash" [size]="15" aria-hidden="true" />Delete
                    </button>
                    <a *ngIf="recordLink" boo-button variant="secondary" size="sm" [routerLink]="recordLink" [queryParams]="{ patientId: p.id }">
                        <physio-icon name="file-text" [size]="15" aria-hidden="true" />Medical record
                    </a>
                    <button *ngIf="canUpdate" boo-button variant="primary" size="sm" aria-haspopup="dialog" [disabled]="busy" (click)="edit.emit(p)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit patient
                    </button>
                </footer>
            </div>
            <ng-template #dash>—</ng-template>
        </drawer>
    `,
})
export class CrmPatientDetailDrawerComponent {
    @Input() patient: Patient | null = null;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** Route to the medical record page, when the user may read medical records. */
    @Input() recordLink: string | null = null;
    /** A delete of this patient is in flight. */
    @Input() busy = false;
    /** Doctor and facility names by id, for the ids the patient record holds. */
    @Input() doctorNames: ReadonlyMap<string, string> = new Map();
    @Input() hospitalNames: ReadonlyMap<string, string> = new Map();
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Patient>();
    @Output() remove = new EventEmitter<Patient>();

    readonly name = displayName;
    readonly risk = riskOf;
    readonly type = patientTypeOf;
    readonly flags = flagsOf;
    readonly age = ageOf;
    readonly gender = genderOf;

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.patient) this.close.emit();
    }

    dob(p: Patient): Date | null {
        return parseIsoDate(p.dateOfBirth);
    }

    doctorName(id: string | null): string {
        if (!id) return '—';
        return this.doctorNames.get(id) ?? (this.doctorNames.size ? 'Unknown doctor' : '…');
    }

    hospitalName(id: string | null): string {
        if (!id) return '—';
        return this.hospitalNames.get(id) ?? (this.hospitalNames.size ? 'Unknown facility' : '…');
    }

    insuranceExpired(p: Patient): boolean {
        const d = parseIsoDate(p.inssuranceExpiryDate);
        if (!d) return false;
        const today = new Date();
        return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    notes(p: Patient): { label: string; value: string | null }[] {
        return [
            { label: 'Medical history', value: p.medicalHistory },
            { label: 'Current medications', value: p.currentMedications },
            { label: 'Surgical history', value: p.surgicalHistory },
            { label: 'Family history', value: p.familyHistory },
            { label: 'Lifestyle', value: p.lifestyleNotes },
        ];
    }

    consents(p: Patient): { label: string; given: boolean }[] {
        return [
            { label: 'Data sharing', given: p.dataSharingConsent },
            { label: 'Research', given: p.consentForResearch },
            { label: 'Marketing', given: p.consentForMarketing },
        ];
    }
}
