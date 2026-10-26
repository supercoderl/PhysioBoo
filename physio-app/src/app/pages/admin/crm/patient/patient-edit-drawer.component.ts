import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { finalize, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { PatientService } from '../../../../services/admin/patient.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { PatientType, RiskLevel } from '../../../../shared/enums/patient';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { Patient, UpdatePatientRequest } from '../../../../shared/types/patient.types';
import { Hospital } from '../../../../shared/types/support.types';
import { PATIENT_TYPE_OPTIONS, RISK_OPTIONS, displayName } from './patient.utils';

/** Largest value numeric(12,2) holds. */
const MAX_COVERAGE = 9_999_999_999.99;

/** The server stores communication preferences as jsonb, so anything entered must be valid JSON. */
function jsonText(control: AbstractControl<string>): ValidationErrors | null {
    const v = control.value?.trim();
    if (!v) return null;
    try {
        JSON.parse(v);
        return null;
    } catch {
        return { json: true };
    }
}

/**
 * Edit form for a patient's care profile (PATCH /api/patients/{id}). Personal details (name, birth date, contact)
 * belong to the person's profile, which this endpoint does not change. Failures are reported by the global HTTP
 * error toast and the form keeps what was entered.
 */
@Component({
    selector: 'crm-patient-edit-drawer',
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooCheckboxComponent,
        BooSelectComponent,
        BooDatepickerComponent,
        BooTextareaComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="!!patient" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="patient as p"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="patient-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">Edit · {{ p.patientNumber }}</p>
                        <h2 id="patient-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(p) }}</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close edit patient" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <p *ngIf="lookupError" class="m-0 flex items-start gap-1.5 text-xs text-danger" role="alert">
                        <physio-icon name="circle-alert" [size]="14" class="flex-none mt-px" />{{ lookupError }}
                    </p>

                    <!-- Care -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Care</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="pe-type" class="block mb-1 text-[13px] font-medium text-regular">Patient type <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="pe-type" formControlName="patientType" label="Patient type" required [options]="typeOptions" />
                            </div>
                            <div>
                                <label for="pe-risk" class="block mb-1 text-[13px] font-medium text-regular">Risk level <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="pe-risk" formControlName="riskLevel" label="Risk level" required [options]="riskOptions" />
                            </div>
                            <div class="sm:col-span-2">
                                <label for="pe-doctor" class="block mb-1 text-[13px] font-medium text-regular">Primary doctor <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="pe-doctor" formControlName="primaryDoctorId" label="Primary doctor" required [options]="doctors" bindLabel="fullName" bindValue="id" />
                            </div>
                        </div>
                        <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2" role="group" aria-label="Patient flags">
                            <boo-checkbox formControlName="isVip" label="VIP" />
                            <boo-checkbox formControlName="isChronicPatient" label="Chronic patient" />
                            <boo-checkbox formControlName="isSeniorCitizen" label="Senior citizen" />
                        </div>
                    </fieldset>

                    <!-- Preferences -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Preferences</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="pe-pref-doctor" class="block mb-1 text-[13px] font-medium text-regular">Preferred doctor</label>
                                <boo-select id="pe-pref-doctor" formControlName="preferredDoctorId" label="No preference" [options]="doctors" bindLabel="fullName" bindValue="id" />
                            </div>
                            <div>
                                <label for="pe-pref-hospital" class="block mb-1 text-[13px] font-medium text-regular">Preferred facility</label>
                                <boo-select id="pe-pref-hospital" formControlName="preferredHospitalId" label="No preference" [options]="hospitals" bindLabel="name" bindValue="id" />
                            </div>
                            <div>
                                <label for="pe-pref-time" class="block mb-1 text-[13px] font-medium text-regular">Preferred time</label>
                                <boo-input name="pe-pref-time" formControlName="preferredAppointmentTime" [maxlength]="20" label="e.g. Weekday mornings" />
                            </div>
                            <div>
                                <label for="pe-occupation" class="block mb-1 text-[13px] font-medium text-regular">Occupation</label>
                                <boo-input name="pe-occupation" formControlName="occupation" [maxlength]="255" label="e.g. Teacher" />
                            </div>
                            <div>
                                <label for="pe-income" class="block mb-1 text-[13px] font-medium text-regular">Annual income range</label>
                                <boo-input name="pe-income" formControlName="annualIncomeRange" [maxlength]="50" label="e.g. 200–300M VND" />
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Insurance -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Insurance</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="pe-ins-provider" class="block mb-1 text-[13px] font-medium text-regular">Provider</label>
                                <boo-input name="pe-ins-provider" formControlName="inssuranceProvider" [maxlength]="255" label="Insurance provider" />
                            </div>
                            <div>
                                <label for="pe-ins-policy" class="block mb-1 text-[13px] font-medium text-regular">Policy number</label>
                                <boo-input name="pe-ins-policy" formControlName="inssurancePolicyNumber" [maxlength]="100" label="Policy number" />
                            </div>
                            <div>
                                <label for="pe-ins-expiry" class="block mb-1 text-[13px] font-medium text-regular">Expiry date</label>
                                <boo-datepicker id="pe-ins-expiry" formControlName="inssuranceExpiryDate" label="Expiry date" />
                            </div>
                            <div>
                                <label for="pe-ins-coverage" class="block mb-1 text-[13px] font-medium text-regular">Coverage amount</label>
                                <boo-input name="pe-ins-coverage" type="number" formControlName="inssuranceCoverageAmount" [maxlength]="16" label="Coverage amount" />
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Clinical background -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Clinical background</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="pe-allergy" class="block mb-1 text-[13px] font-medium text-regular">Allergies</label>
                                <boo-textarea id="pe-allergy" formControlName="allergyInformation" label="Known allergies" [rows]="2" />
                            </div>
                            <div>
                                <label for="pe-history" class="block mb-1 text-[13px] font-medium text-regular">Medical history</label>
                                <boo-textarea id="pe-history" formControlName="medicalHistory" label="Medical history" [rows]="3" />
                            </div>
                            <div>
                                <label for="pe-meds" class="block mb-1 text-[13px] font-medium text-regular">Current medications</label>
                                <boo-textarea id="pe-meds" formControlName="currentMedications" label="Current medications" [rows]="2" />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="pe-surgical" class="block mb-1 text-[13px] font-medium text-regular">Surgical history</label>
                                    <boo-textarea id="pe-surgical" formControlName="surgicalHistory" label="Surgical history" [rows]="2" />
                                </div>
                                <div>
                                    <label for="pe-family" class="block mb-1 text-[13px] font-medium text-regular">Family history</label>
                                    <boo-textarea id="pe-family" formControlName="familyHistory" label="Family history" [rows]="2" />
                                </div>
                            </div>
                            <div>
                                <label for="pe-lifestyle" class="block mb-1 text-[13px] font-medium text-regular">Lifestyle notes</label>
                                <boo-textarea id="pe-lifestyle" formControlName="lifestyleNotes" label="Lifestyle notes" [rows]="2" />
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Consent and communication -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Consent and communication</legend>
                        <div class="flex flex-wrap gap-x-6 gap-y-2" role="group" aria-label="Consent">
                            <boo-checkbox formControlName="dataSharingConsent" label="Data sharing" />
                            <boo-checkbox formControlName="consentForResearch" label="Research" />
                            <boo-checkbox formControlName="consentForMarketing" label="Marketing" />
                        </div>
                        <div class="mt-4">
                            <label for="pe-comms" class="block mb-1 text-[13px] font-medium text-regular">Communication preferences <span class="font-normal text-secondary">(JSON)</span></label>
                            <boo-textarea id="pe-comms" formControlName="communicationPreferences" label='e.g. {"sms": true, "email": true}' [rows]="2" />
                            <p *ngIf="form.controls.communicationPreferences.touched && form.controls.communicationPreferences.hasError('json')" class="m-0 mt-1 text-xs text-danger" role="alert">
                                Enter valid JSON, or leave this empty.
                            </p>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!form.dirty">Save changes</button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmPatientEditDrawerComponent implements OnChanges {
    /** The patient being edited; the drawer is open while it is set. */
    @Input() patient: Patient | null = null;
    @Input() doctors: Doctor[] = [];
    @Input() hospitals: Hospital[] = [];
    /** Set when a pick list could not be loaded. */
    @Input() lookupError: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<Patient>();

    private readonly fb = inject(FormBuilder);
    private readonly patientSrv = inject(PatientService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly typeOptions = PATIENT_TYPE_OPTIONS;
    readonly riskOptions = RISK_OPTIONS;
    readonly name = displayName;

    readonly form = this.fb.group({
        patientType: this.fb.nonNullable.control<PatientType>(PatientType.Outpatient, Validators.required),
        riskLevel: this.fb.nonNullable.control<RiskLevel>(RiskLevel.Low, Validators.required),
        primaryDoctorId: this.fb.control<string | null>(null, Validators.required),
        isVip: this.fb.nonNullable.control(false),
        isChronicPatient: this.fb.nonNullable.control(false),
        isSeniorCitizen: this.fb.nonNullable.control(false),
        preferredDoctorId: this.fb.control<string | null>(null),
        preferredHospitalId: this.fb.control<string | null>(null),
        preferredAppointmentTime: this.fb.nonNullable.control('', Validators.maxLength(20)),
        occupation: this.fb.nonNullable.control('', Validators.maxLength(255)),
        annualIncomeRange: this.fb.nonNullable.control('', Validators.maxLength(50)),
        inssuranceProvider: this.fb.nonNullable.control('', Validators.maxLength(255)),
        inssurancePolicyNumber: this.fb.nonNullable.control('', Validators.maxLength(100)),
        inssuranceExpiryDate: this.fb.control<string | null>(null),
        inssuranceCoverageAmount: this.fb.control<string | number | null>(null, [Validators.min(0), Validators.max(MAX_COVERAGE)]),
        allergyInformation: this.fb.nonNullable.control(''),
        medicalHistory: this.fb.nonNullable.control(''),
        currentMedications: this.fb.nonNullable.control(''),
        surgicalHistory: this.fb.nonNullable.control(''),
        familyHistory: this.fb.nonNullable.control(''),
        lifestyleNotes: this.fb.nonNullable.control(''),
        dataSharingConsent: this.fb.nonNullable.control(false),
        consentForResearch: this.fb.nonNullable.control(false),
        consentForMarketing: this.fb.nonNullable.control(false),
        communicationPreferences: this.fb.nonNullable.control('', jsonText),
    });

    submitting = false;

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['patient'];
        if (!change) return;
        const next = change.currentValue as Patient | null;
        const prev = change.previousValue as Patient | null;
        // A new patient (not a refreshed copy of the same one) starts from that patient's saved values.
        if (next && next.id !== prev?.id) this.fill(next);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.patient) this.requestClose();
    }

    submit(): void {
        const p = this.patient;
        if (!p || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        this.submitting = true;
        this.patientSrv.update(p.id, this.buildRequest())
            .pipe(
                // The update returns no body; read the saved record back so the list shows what the server stored.
                switchMap(() => this.patientSrv.search_by_id(p.id)),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    this.form.markAsPristine();
                    // Saved even if the read-back failed; fall back to the edited values on the old record.
                    this.saved.emit(res?.success && res.data ? res.data : { ...p, ...this.buildRequest() } as Patient);
                },
                // The global HTTP error toast reports the failure; the form keeps what was entered.
                error: () => undefined,
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
    discard(): void {
        if (this.submitting) return;
        this.form.markAsPristine();
        this.close.emit();
    }

    private fill(p: Patient): void {
        this.form.reset({
            patientType: p.patientType,
            riskLevel: p.riskLevel,
            primaryDoctorId: p.primaryDoctorId || null,
            isVip: p.isVip,
            isChronicPatient: p.isChronicPatient,
            isSeniorCitizen: p.isSeniorCitizen,
            preferredDoctorId: p.preferredDoctorId,
            preferredHospitalId: p.preferredHospitalId,
            preferredAppointmentTime: p.preferredAppointmentTime ?? '',
            occupation: p.occupation ?? '',
            annualIncomeRange: p.annualIncomeRange ?? '',
            inssuranceProvider: p.inssuranceProvider ?? '',
            inssurancePolicyNumber: p.inssurancePolicyNumber ?? '',
            inssuranceExpiryDate: p.inssuranceExpiryDate,
            inssuranceCoverageAmount: p.inssuranceCoverageAmount,
            allergyInformation: p.allergyInformation ?? '',
            medicalHistory: p.medicalHistory ?? '',
            currentMedications: p.currentMedications ?? '',
            surgicalHistory: p.surgicalHistory ?? '',
            familyHistory: p.familyHistory ?? '',
            lifestyleNotes: p.lifestyleNotes ?? '',
            dataSharingConsent: p.dataSharingConsent,
            consentForResearch: p.consentForResearch,
            consentForMarketing: p.consentForMarketing,
            communicationPreferences: p.communicationPreferences ?? '',
        });
    }

    private buildRequest(): UpdatePatientRequest {
        const v = this.form.getRawValue();
        const text = (s: string | null | undefined) => s?.trim() || null;
        const coverage = v.inssuranceCoverageAmount === null || v.inssuranceCoverageAmount === '' ? null : Number(v.inssuranceCoverageAmount);
        return {
            patientType: v.patientType,
            riskLevel: v.riskLevel,
            primaryDoctorId: v.primaryDoctorId!,
            isVip: v.isVip,
            isChronicPatient: v.isChronicPatient,
            isSeniorCitizen: v.isSeniorCitizen,
            preferredDoctorId: v.preferredDoctorId || null,
            preferredHospitalId: v.preferredHospitalId || null,
            preferredAppointmentTime: text(v.preferredAppointmentTime),
            occupation: text(v.occupation),
            annualIncomeRange: text(v.annualIncomeRange),
            inssuranceProvider: text(v.inssuranceProvider),
            inssurancePolicyNumber: text(v.inssurancePolicyNumber),
            inssuranceExpiryDate: v.inssuranceExpiryDate || null,
            inssuranceCoverageAmount: coverage !== null && Number.isFinite(coverage) ? coverage : null,
            allergyInformation: text(v.allergyInformation),
            medicalHistory: text(v.medicalHistory),
            currentMedications: text(v.currentMedications),
            surgicalHistory: text(v.surgicalHistory),
            familyHistory: text(v.familyHistory),
            lifestyleNotes: text(v.lifestyleNotes),
            dataSharingConsent: v.dataSharingConsent,
            consentForResearch: v.consentForResearch,
            consentForMarketing: v.consentForMarketing,
            communicationPreferences: text(v.communicationPreferences),
        };
    }
}
