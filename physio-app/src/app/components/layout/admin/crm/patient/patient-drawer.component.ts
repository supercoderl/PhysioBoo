import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { PatientService } from "../../../../../services/admin/patient.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { PatientType, RiskLevel } from "../../../../../shared/enums/patient";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CreatePatientRequest, Patient, UpdatePatientRequest } from "../../../../../shared/types/patient.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'crm-patient-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooCheckboxComponent,
        BooTextareaComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="760" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Patient' : 'New Patient' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Clinical profile and care preferences</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <!-- Classification -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Classification</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Patient Type" formControlName="patientType" [options]="patientTypeOptions"></boo-select>
                            <boo-select label="Risk Level" formControlName="riskLevel" [options]="riskLevelOptions"></boo-select>
                        </div>
                        <boo-select label="Primary Doctor" formControlName="primaryDoctorId" [options]="doctorOptions" required></boo-select>

                        <div class="grid grid-cols-3 gap-3 mt-2">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isVip')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isVip')">
                                <span class="text-sm font-medium text-gray-700">VIP</span>
                                <boo-checkbox formControlName="isVip"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isSeniorCitizen')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isSeniorCitizen')">
                                <span class="text-sm font-medium text-gray-700">Senior</span>
                                <boo-checkbox formControlName="isSeniorCitizen"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isChronicPatient')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isChronicPatient')">
                                <span class="text-sm font-medium text-gray-700">Chronic</span>
                                <boo-checkbox formControlName="isChronicPatient"></boo-checkbox>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Demographics -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Demographics</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Occupation" formControlName="occupation" placeholder="Ex: Software Engineer"></boo-input>
                            <boo-input label="Annual Income Range" formControlName="annualIncomeRange" placeholder="Ex: 20,000-30,000 USD"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Insurance -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Insurance</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Provider" formControlName="inssuranceProvider" placeholder="Ex: AIA Vietnam"></boo-input>
                            <boo-input label="Policy Number" formControlName="inssurancePolicyNumber" placeholder="POL-INS-2026-001"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Expiry Date" type="date" formControlName="inssuranceExpiryDate"></boo-input>
                            <boo-input label="Coverage Amount" type="number" formControlName="inssuranceCoverageAmount" placeholder="0"></boo-input>
                        </div>
                    </div>

                    <!-- Referral (create-only) -->
                    <ng-container *ngIf="!currentId">
                        <div class="h-px bg-gray-100 mx-6"></div>
                        <div class="p-6 space-y-4">
                            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Referral</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <boo-select label="Referred By (Doctor)" formControlName="referredBy" [options]="doctorOptions"></boo-select>
                                <boo-select label="Referral Hospital" formControlName="referralHospitalId" [options]="hospitalOptions"></boo-select>
                            </div>
                        </div>
                    </ng-container>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Care Preferences -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Care Preferences</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Preferred Doctor" formControlName="preferredDoctorId" [options]="doctorOptions"></boo-select>
                            <boo-select label="Preferred Hospital" formControlName="preferredHospitalId" [options]="hospitalOptions"></boo-select>
                        </div>
                        <boo-input label="Preferred Appointment Time" formControlName="preferredAppointmentTime" placeholder="Ex: Morning (08:00 - 11:00)"></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Medical Background -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Medical Background</h3>
                        <boo-textarea label="Medical History" formControlName="medicalHistory" [rows]="3" placeholder="Hypertension, Type 2 Diabetes..."></boo-textarea>
                        <boo-textarea label="Family History" formControlName="familyHistory" [rows]="3" placeholder="Family history of heart disease..."></boo-textarea>
                        <boo-textarea label="Surgical History" formControlName="surgicalHistory" [rows]="3" placeholder="Appendectomy in 2018..."></boo-textarea>
                        <boo-textarea label="Allergy Information" formControlName="allergyInformation" [rows]="3" placeholder="Penicillin allergy..."></boo-textarea>
                        <boo-textarea label="Current Medications" formControlName="currentMedications" [rows]="3" placeholder="Metformin 500mg daily..."></boo-textarea>
                        <boo-textarea label="Lifestyle Notes" formControlName="lifestyleNotes" [rows]="3" placeholder="Non-smoker, exercises twice weekly..."></boo-textarea>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Communication & Consent -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Communication & Consent</h3>
                        <boo-textarea label="Communication Preferences (JSON)" formControlName="communicationPreferences" [rows]="3"
                            placeholder='{"sms":true,"email":true,"call":false}'></boo-textarea>

                        <div class="grid grid-cols-3 gap-3 mt-2">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('consentForResearch')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('consentForResearch')">
                                <span class="text-sm font-medium text-gray-700">Research</span>
                                <boo-checkbox formControlName="consentForResearch"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('consentForMarketing')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('consentForMarketing')">
                                <span class="text-sm font-medium text-gray-700">Marketing</span>
                                <boo-checkbox formControlName="consentForMarketing"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('dataSharingConsent')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('dataSharingConsent')">
                                <span class="text-sm font-medium text-gray-700">Data Sharing</span>
                                <boo-checkbox formControlName="dataSharingConsent"></boo-checkbox>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class CrmPatientDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Input() doctorOptions: { label: string; value: string }[] = [];
    @Input() hospitalOptions: { label: string; value: string }[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Patient>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    readonly patientTypeOptions = [
        { label: 'Outpatient', value: PatientType.Outpatient },
        { label: 'Inpatient', value: PatientType.Inpatient },
        { label: 'Emergency', value: PatientType.Emergency },
        { label: 'Referral', value: PatientType.Referral },
    ];

    readonly riskLevelOptions = [
        { label: 'Low', value: RiskLevel.Low },
        { label: 'Medium', value: RiskLevel.Medium },
        { label: 'High', value: RiskLevel.High },
        { label: 'Critical', value: RiskLevel.Critical },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private patientSrv: PatientService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['currentId'] && this.currentId) {
            this.loadDetail(this.currentId);
        } else if (!this.currentId) {
            this.resetForm();
        }
    }
    // #endregion

    // #region Methods
    private initForm(): FormGroup {
        return this.fb.group({
            patientType: [PatientType.Outpatient, [Validators.required]],
            riskLevel: [RiskLevel.Low, [Validators.required]],
            primaryDoctorId: [null, [Validators.required]],

            isVip: [false],
            isSeniorCitizen: [false],
            isChronicPatient: [false],

            occupation: [null],
            annualIncomeRange: [null],

            inssuranceProvider: [null],
            inssurancePolicyNumber: [null],
            inssuranceExpiryDate: [null],
            inssuranceCoverageAmount: [null],

            referredBy: [null],
            referralHospitalId: [null],

            preferredDoctorId: [null],
            preferredHospitalId: [null],
            preferredAppointmentTime: [null],

            medicalHistory: [null],
            familyHistory: [null],
            surgicalHistory: [null],
            allergyInformation: [null],
            currentMedications: [null],
            lifestyleNotes: [null],

            communicationPreferences: [null],

            consentForResearch: [false],
            consentForMarketing: [false],
            dataSharingConsent: [true],
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.patientSrv.search_by_id(id)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(res => {
                if (!res.success || !res.data) return;
                const p = res.data;
                this.form.patchValue({
                    patientType: p.patientType,
                    riskLevel: p.riskLevel,
                    primaryDoctorId: p.primaryDoctorId,

                    isVip: p.isVip,
                    isSeniorCitizen: p.isSeniorCitizen,
                    isChronicPatient: p.isChronicPatient,

                    occupation: p.occupation,
                    annualIncomeRange: p.annualIncomeRange,

                    inssuranceProvider: p.inssuranceProvider,
                    inssurancePolicyNumber: p.inssurancePolicyNumber,
                    inssuranceExpiryDate: p.inssuranceExpiryDate,
                    inssuranceCoverageAmount: p.inssuranceCoverageAmount,

                    referredBy: p.referredBy,
                    referralHospitalId: p.referralHospitalId,

                    preferredDoctorId: p.preferredDoctorId,
                    preferredHospitalId: p.preferredHospitalId,
                    preferredAppointmentTime: p.preferredAppointmentTime,

                    medicalHistory: p.medicalHistory,
                    familyHistory: p.familyHistory,
                    surgicalHistory: p.surgicalHistory,
                    allergyInformation: p.allergyInformation,
                    currentMedications: p.currentMedications,
                    lifestyleNotes: p.lifestyleNotes,

                    communicationPreferences: p.communicationPreferences,

                    consentForResearch: p.consentForResearch,
                    consentForMarketing: p.consentForMarketing,
                    dataSharingConsent: p.dataSharingConsent,
                });
            });
    }

    toggleCheck(controlName: string) {
        this.form.patchValue({ [controlName]: !this.form.get(controlName)?.value });
        this.form.markAsDirty();
    }

    private toNullableString(v: unknown): string | null {
        if (v === null || v === undefined) return null;
        const s = String(v).trim();
        return s.length === 0 ? null : s;
    }

    private toNullableNumber(v: unknown): number | null {
        if (v === null || v === undefined || v === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    private buildUpdate(): UpdatePatientRequest {
        const v = this.form.getRawValue();
        return {
            patientType: v.patientType,
            primaryDoctorId: v.primaryDoctorId,
            preferredHospitalId: this.toNullableString(v.preferredHospitalId),
            preferredDoctorId: this.toNullableString(v.preferredDoctorId),
            preferredAppointmentTime: this.toNullableString(v.preferredAppointmentTime),

            inssuranceProvider: this.toNullableString(v.inssuranceProvider),
            inssurancePolicyNumber: this.toNullableString(v.inssurancePolicyNumber),
            inssuranceExpiryDate: this.toNullableString(v.inssuranceExpiryDate),
            inssuranceCoverageAmount: this.toNullableNumber(v.inssuranceCoverageAmount),

            isVip: !!v.isVip,
            isSeniorCitizen: !!v.isSeniorCitizen,
            isChronicPatient: !!v.isChronicPatient,
            riskLevel: v.riskLevel,

            medicalHistory: this.toNullableString(v.medicalHistory),
            familyHistory: this.toNullableString(v.familyHistory),
            surgicalHistory: this.toNullableString(v.surgicalHistory),
            allergyInformation: this.toNullableString(v.allergyInformation),
            currentMedications: this.toNullableString(v.currentMedications),
            lifestyleNotes: this.toNullableString(v.lifestyleNotes),

            occupation: this.toNullableString(v.occupation),
            annualIncomeRange: this.toNullableString(v.annualIncomeRange),
            communicationPreferences: this.toNullableString(v.communicationPreferences),

            consentForResearch: !!v.consentForResearch,
            consentForMarketing: !!v.consentForMarketing,
            dataSharingConsent: !!v.dataSharingConsent,
        };
    }

    private buildCreate(): CreatePatientRequest {
        const v = this.form.getRawValue();
        return {
            primaryDoctorId: v.primaryDoctorId,
            referredBy: this.toNullableString(v.referredBy),
            referralHospitalId: this.toNullableString(v.referralHospitalId),

            inssuranceProvider: this.toNullableString(v.inssuranceProvider),
            inssurancePolicyNumber: this.toNullableString(v.inssurancePolicyNumber),
            inssuranceExpiryDate: this.toNullableString(v.inssuranceExpiryDate),
            inssuranceCoverageAmount: this.toNullableNumber(v.inssuranceCoverageAmount),

            medicalHistory: this.toNullableString(v.medicalHistory),
            familyHistory: this.toNullableString(v.familyHistory),
            surgicalHistory: this.toNullableString(v.surgicalHistory),
            allergyInformation: this.toNullableString(v.allergyInformation),
            currentMedications: this.toNullableString(v.currentMedications),
            lifestyleNotes: this.toNullableString(v.lifestyleNotes),

            occupation: this.toNullableString(v.occupation),
            annualIncomeRange: this.toNullableString(v.annualIncomeRange),

            preferredHospitalId: this.toNullableString(v.preferredHospitalId),
            preferredDoctorId: this.toNullableString(v.preferredDoctorId),
            preferredAppointmentTime: this.toNullableString(v.preferredAppointmentTime),
            communicationPreferences: this.toNullableString(v.communicationPreferences),
        };
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        try {
            let id: string;
            if (this.currentId) {
                await firstValueFrom(this.patientSrv.update(this.currentId, this.buildUpdate()));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.patientSrv.create(this.buildCreate()));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.patientSrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    resetForm() {
        this.form.reset({
            patientType: PatientType.Outpatient,
            riskLevel: RiskLevel.Low,
            primaryDoctorId: null,
            isVip: false,
            isSeniorCitizen: false,
            isChronicPatient: false,
            occupation: null,
            annualIncomeRange: null,
            inssuranceProvider: null,
            inssurancePolicyNumber: null,
            inssuranceExpiryDate: null,
            inssuranceCoverageAmount: null,
            referredBy: null,
            referralHospitalId: null,
            preferredDoctorId: null,
            preferredHospitalId: null,
            preferredAppointmentTime: null,
            medicalHistory: null,
            familyHistory: null,
            surgicalHistory: null,
            allergyInformation: null,
            currentMedications: null,
            lifestyleNotes: null,
            communicationPreferences: null,
            consentForResearch: false,
            consentForMarketing: false,
            dataSharingConsent: true,
        });
    }

    onClose() {
        if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = 0;
        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
    // #endregion
}
