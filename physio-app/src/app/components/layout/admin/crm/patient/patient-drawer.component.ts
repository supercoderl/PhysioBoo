import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { PatientService } from "../../../../../services/admin/patient.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { PatientType, RiskLevel } from "../../../../../shared/enums/patient";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Patient } from "../../../../../shared/types/patient";
import { generateUUID } from "../../../../../shared/utils/common";
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
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooCheckboxComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Patient' : 'New Patient' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Personal and medical profile information</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <!-- Personal Information -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Personal Information</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Full Name" formControlName="fullName" placeholder="Ex: John Doe"></boo-input>
                            <boo-input label="Date of Birth" type="date" formControlName="dateOfBirth"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Gender" formControlName="gender" [options]="genderOptions"></boo-select>
                            <boo-select label="Blood Type" formControlName="bloodType" [options]="bloodTypeOptions"></boo-select>
                        </div>
                        <boo-input label="Occupation" formControlName="occupation" placeholder="Ex: Engineer"></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Contact -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Contact</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Phone" formControlName="phone" placeholder="+1..."></boo-input>
                            <boo-input label="Email" formControlName="email" placeholder="patient@example.com"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="City" formControlName="city" placeholder="Ex: New York"></boo-input>
                            <boo-input label="Country" formControlName="country" placeholder="Ex: United States"></boo-input>
                        </div>
                        <boo-input label="Address" formControlName="address" placeholder="Full address"></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Emergency Contact -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Emergency Contact</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Contact Name" formControlName="emergencyContactName" placeholder="Ex: Jane Doe"></boo-input>
                            <boo-input label="Contact Phone" formControlName="emergencyContactPhone" placeholder="+1..."></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Medical Profile -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Medical Profile</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Patient Type" formControlName="patientType" [options]="patientTypeOptions"></boo-select>
                            <boo-select label="Risk Level" formControlName="riskLevel" [options]="riskLevelOptions"></boo-select>
                        </div>
                        <boo-select label="Primary Doctor" formControlName="primaryDoctorId" [options]="[]"></boo-select>

                        <div class="grid grid-cols-2 gap-3 mt-2">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isVip')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isVip')">
                                <span class="text-sm font-medium text-gray-700">VIP Patient</span>
                                <boo-checkbox formControlName="isVip"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isSeniorCitizen')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isSeniorCitizen')">
                                <span class="text-sm font-medium text-gray-700">Senior Citizen</span>
                                <boo-checkbox formControlName="isSeniorCitizen"></boo-checkbox>
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

    readonly genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
    ];

    readonly bloodTypeOptions = [
        { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
        { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
        { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
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
            fullName: ['', [Validators.required, Validators.maxLength(100)]],
            dateOfBirth: [null],
            gender: [null],
            bloodType: [null],
            phone: [''],
            email: ['', [Validators.email]],
            address: [''],
            city: [''],
            country: [''],
            occupation: [''],
            emergencyContactName: [''],
            emergencyContactPhone: [''],
            patientType: [PatientType.Outpatient, [Validators.required]],
            riskLevel: [RiskLevel.Low, [Validators.required]],
            primaryDoctorId: [null],
            isVip: [false],
            isSeniorCitizen: [false],
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.patientSrv.search_by_id({ id })
            .pipe(finalize(() => this.form.enable()))
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        fullName: _res.data?.fullName ?? '',
                        dateOfBirth: _res.data?.dateOfBirth ?? null,
                        gender: _res.data?.gender,
                        bloodType: _res.data?.bloodType,
                        phone: _res.data?.phone,
                        email: _res.data?.email,
                        address: _res.data?.address,
                        city: _res.data?.city,
                        country: _res.data?.country,
                        occupation: _res.data?.occupation,
                        emergencyContactName: _res.data?.emergencyContactName,
                        emergencyContactPhone: _res.data?.emergencyContactPhone,
                        patientType: _res.data?.patientType,
                        riskLevel: _res.data?.riskLevel,
                        primaryDoctorId: _res.data?.primaryDoctorId,
                        isVip: _res.data?.isVip ?? false,
                        isSeniorCitizen: _res.data?.isSeniorCitizen ?? false,
                    });
                }
            });
    }

    toggleCheck(controlName: string) {
        this.form.patchValue({ [controlName]: !this.form.get(controlName)?.value });
        this.form.markAsDirty();
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const targetId = this.currentId ?? generateUUID();
        const formData = { ...this.form.getRawValue(), id: targetId };

        const request$ = this.currentId
            ? this.patientSrv.update(formData)
            : this.patientSrv.create(formData);

        try {
            await firstValueFrom(request$);
            const response = await firstValueFrom(this.patientSrv.search_by_id({ id: targetId }));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (error) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            console.error(error);
        }
    }

    resetForm() {
        this.form.reset({
            fullName: '', dateOfBirth: null, gender: null, bloodType: null,
            phone: '', email: '', address: '', city: '', country: '',
            occupation: '', emergencyContactName: '', emergencyContactPhone: '',
            patientType: PatientType.Outpatient, riskLevel: RiskLevel.Low,
            primaryDoctorId: null, isVip: false, isSeniorCitizen: false,
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
