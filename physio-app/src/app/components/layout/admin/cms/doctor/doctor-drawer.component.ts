import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { DoctorService } from "../../../../../services/admin/doctor.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { BloodGroup } from "../../../../../shared/enums/blood-group";
import { EmploymentStatus } from "../../../../../shared/enums/employment-status";
import { Gender } from "../../../../../shared/enums/gender";
import { MaritalStatus } from "../../../../../shared/enums/marital-status";
import { PreferredCommunication } from "../../../../../shared/enums/preferred-communication";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Doctor } from "../../../../../shared/types/medical-staff.types";
import { convertEnumToSelection, generateUUID } from "../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooJsonInputComponent } from "../../../../input/boo-json-input/boo-json-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";
import { BooDevJsonFillerComponent } from "../../../dev/json-input/boo-json-input.component";

interface StepConfig {
    id: number;
    label: string;
    description: string;
    icon: string;
    formGroupName: 'userForm' | 'profileForm' | 'doctorForm';
}

@Component({
    selector: 'cms-doctor-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooDevJsonFillerComponent,
        BooJsonInputComponent
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="720"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">New Doctor Account</h2>
                        <p class="text-sm text-secondary m-0">Complete all 3 steps to register a new medical professional</p>
                    </div>
                    <button (click)="onClose()"
                        class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>
                <div class="flex-none px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div class="flex items-center gap-0">
                        <ng-container *ngFor="let step of steps; let i = index">
                            <button
                                class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
                                [ngClass]="{
                                    'bg-primary text-white shadow-sm': currentStep === step.id,
                                    'bg-white border border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary': currentStep !== step.id && !isStepCompleted(step.id),
                                    'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:border-emerald-300': currentStep !== step.id && isStepCompleted(step.id)
                                }"
                                (click)="goToStep(step.id)"
                            >
                                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                    [ngClass]="{
                                        'bg-white/20': currentStep === step.id,
                                        'bg-gray-100 text-gray-500': currentStep !== step.id && !isStepCompleted(step.id),
                                        'bg-emerald-100 text-emerald-600': currentStep !== step.id && isStepCompleted(step.id)
                                    }">
                                    <boo-icon *ngIf="isStepCompleted(step.id) && currentStep !== step.id" name="check" [size]="12"></boo-icon>
                                    <span *ngIf="!isStepCompleted(step.id) || currentStep === step.id">{{ step.id }}</span>
                                </div>
                                <div class="text-left hidden sm:block">
                                    <div class="text-xs font-semibold leading-none">{{ step.label }}</div>
                                    <div class="text-xs opacity-70 mt-0.5 leading-none">{{ step.description }}</div>
                                </div>
                            </button>
                            <div *ngIf="i < steps.length - 1" class="flex-1 h-px mx-2"
                                [ngClass]="isStepCompleted(step.id) ? 'bg-emerald-300' : 'bg-gray-200'">
                            </div>
                        </ng-container>
                    </div>
                </div>
                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar>
                    <boo-json-editor [targetForms]="[userForm, profileForm, doctorForm]"></boo-json-editor>
                    
                    <div *ngIf="currentStep === 1" [formGroup]="userForm" class="p-6 space-y-6 animate-fadeIn">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <boo-icon name="user" [size]="14" class="text-blue-600"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Account Credentials</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Login email, phone and initial password for the doctor's system access.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-input
                                label="Email Address"
                                formControlName="email"
                                type="email"
                                placeholder="doctor@clinic.com"
                                class="md:col-span-2">
                            </boo-input>
                            <boo-input
                                label="Phone Number"
                                formControlName="phone"
                                placeholder="+1 (555) 000-0000">
                            </boo-input>
                            <boo-input
                                label="Initial Password"
                                formControlName="password"
                                type="password"
                                placeholder="Min. 8 characters">
                            </boo-input>
                        </div>
                        <div class="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <boo-icon name="info" [size]="16" class="text-blue-500 flex-shrink-0 mt-0.5"></boo-icon>
                            <p class="text-xs text-blue-700 m-0 leading-relaxed">
                                The doctor will receive a welcome email with their login credentials. They can change their password after the first login.
                            </p>
                        </div>
                    </div>

                    <div *ngIf="currentStep === 2" [formGroup]="profileForm" class="p-6 space-y-6 animate-fadeIn">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                                    <boo-icon name="id-card" [size]="14" class="text-violet-600"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Personal Information</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Legal name and personal details as they appear on official documents.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <boo-input label="First Name" formControlName="firstName" placeholder="John"></boo-input>
                            <boo-input label="Middle Name" formControlName="middleName" placeholder="(Optional)"></boo-input>
                            <boo-input label="Last Name" formControlName="lastName" placeholder="Smith"></boo-input>
                            <boo-input type="date" label="Date of Birth" formControlName="dateOfBirth"></boo-input>
                            <boo-select label="Gender" formControlName="gender" [options]="genderOptions"></boo-select>
                            <boo-select label="Blood Group" formControlName="bloodGroup" [options]="bloodGroupOptions"></boo-select>
                            <boo-select label="Marital Status" formControlName="maritalStatus" [options]="maritalStatusOptions"></boo-select>
                            <boo-input label="Nationality" formControlName="nationality" placeholder="e.g. American"></boo-input>
                            <boo-select label="Preferred Communication" formControlName="preferredCommunication" [options]="preferredCommunicationOptions"></boo-select>
                        </div>
 
                        <div class="h-px bg-gray-100"></div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <boo-icon name="file-badge" [size]="14" class="text-amber-600"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Identification</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Government-issued identification document details.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <boo-select label="ID Type" formControlName="identificationType" [options]="identificationTypeOptions"></boo-select>
                            <boo-input label="ID Number" formControlName="identificationNumber" placeholder="ID-000000"></boo-input>
                            <boo-input type="date" label="ID Expiry Date" formControlName="identificationExpiry"></boo-input>
                        </div>
 
                        <div class="h-px bg-gray-100"></div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                                    <boo-icon name="phone-call" [size]="14" class="text-red-500"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Emergency Contact</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Person to contact in case of emergencies.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <boo-input label="Contact Name" formControlName="emergencyContactName" placeholder="Full name"></boo-input>
                            <boo-input label="Contact Phone" formControlName="emergencyContactPhone" placeholder="+1 (555) 000-0000"></boo-input>
                            <boo-input label="Relationship" formControlName="emergencyContactRelationship" placeholder="e.g. Spouse"></boo-input>
                        </div>
                    </div>
                    <div *ngIf="currentStep === 3" [formGroup]="doctorForm" class="p-6 space-y-6 animate-fadeIn">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                                    <boo-icon name="stethoscope" [size]="14" class="text-teal-600"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Professional Summary</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Clinical background, specialty, and professional narrative.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-select
                                label="Primary Specialty"
                                formControlName="primarySpecialtyId"
                                [options]="[]"
                                class="md:col-span-2">
                            </boo-select>
                            <boo-input label="Languages Spoken" formControlName="languagesSpoken" placeholder="English, Spanish..."></boo-input>
                            <boo-input type="number" label="Years of Experience" formControlName="yearsOfExperience" placeholder="0"></boo-input>
                            <boo-input type="number" label="Years of Practice" formControlName="yearsOfPractice" placeholder="0"></boo-input>
                            <boo-input type="number" label="Publications Count" formControlName="publicationsCount" placeholder="0"></boo-input>
                            <boo-input type="number" label="Conference Presentations" formControlName="conferencePresentations" placeholder="0"></boo-input>
                        </div>
 
                        <div class="grid grid-cols-1 gap-4">
                            <boo-textarea label="Bio (Short)" formControlName="bio" placeholder="Brief professional biography..."></boo-textarea>
                            <boo-textarea label="About (Detailed)" formControlName="about" placeholder="Detailed background and approach to care..."></boo-textarea>
                            <boo-textarea label="Achievements" formControlName="archivements" placeholder="Awards, recognitions..."></boo-textarea>
                            <boo-textarea label="Research Interests" formControlName="researchInterests" placeholder="Active research areas..."></boo-textarea>
                        </div>
 
                        <div class="h-px bg-gray-100"></div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <boo-icon name="shield-check" [size]="14" class="text-blue-600"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Medical License</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Official medical license details required for verification.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <boo-input label="License Number" formControlName="medicalLicenseNumber"></boo-input>
                            <boo-input type="date" label="License Expiry" formControlName="medicalLicenseExpiry"></boo-input>
                            <boo-input label="Issuing Authority" formControlName="medicalLicenseIssuingAuthority"></boo-input>
                        </div>
 
                        <div class="h-px bg-gray-100"></div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <div class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                                    <boo-icon name="landmark" [size]="14" class="text-green-600"></boo-icon>
                                </div>
                                <h3 class="text-sm font-bold text-primary">Financial & HR</h3>
                            </div>
                            <p class="text-xs text-secondary ml-9">Employment and banking details for payroll processing.</p>
                        </div>
 
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                            <boo-select label="Employment Status" formControlName="employmentStatus" [options]="employmentStatusOptions"></boo-select>
                            <boo-json-input label="Bank Account Details" formControlName="bankAccountDetails"></boo-json-input>
                            <boo-input label="PAN Number" formControlName="panNumber"></boo-input>
                            <boo-input label="GSTIN" formControlName="gstin"></boo-input>
                        </div>
                    </div>
 
                </div>
                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0 shadow-top-md">
                    <div class="text-sm text-secondary">
                        <span class="font-semibold text-primary">Step {{ currentStep }}</span> of {{ steps.length }}
                    </div>
                    <div class="flex gap-3">
                        <boo-button-admin
                            *ngIf="currentStep > 1"
                            buttonClass="hover:!bg-gray-200"
                            background="transparent"
                            (click)="prevStep()">
                            <boo-icon name="arrow-left" [size]="14" class="mr-1"></boo-icon>
                            Back
                        </boo-button-admin>
 
                        <boo-button-admin
                            buttonClass="hover:!bg-gray-200"
                            background="transparent"
                            (click)="onClose()">
                            Cancel
                        </boo-button-admin>
 
                        <boo-button-admin
                            *ngIf="currentStep < steps.length"
                            textColor="white"
                            (click)="nextStep()">
                            Continue
                            <boo-icon name="arrow-right" [size]="14" color="white" class="ml-1"></boo-icon>
                        </boo-button-admin>
 
                        <boo-button-admin
                            *ngIf="currentStep === steps.length"
                            textColor="white"
                            (click)="onSave()"
                            [loading]="loadingSrv.isLoading('create')">
                            <boo-icon name="check" [size]="14" color="white" class="mr-1"></boo-icon>
                            Create Doctor
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `,
    styles: [`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.18s ease-out; }
    `]
})

export class CmsDoctorDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Doctor>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    currentStep = 1;
    completedSteps = new Set<number>();

    userForm!: FormGroup;
    profileForm!: FormGroup;
    doctorForm!: FormGroup;

    steps: StepConfig[] = [
        { id: 1, label: 'Account', description: 'Login credentials', icon: 'user', formGroupName: 'userForm' },
        { id: 2, label: 'Profile', description: 'Personal details', icon: 'id-card', formGroupName: 'profileForm' },
        { id: 3, label: 'Doctor', description: 'Medical profile', icon: 'stethoscope', formGroupName: 'doctorForm' },
    ];

    employmentStatusOptions = convertEnumToSelection(EmploymentStatus);
    genderOptions = convertEnumToSelection(Gender);
    bloodGroupOptions = convertEnumToSelection(BloodGroup);
    maritalStatusOptions = convertEnumToSelection(MaritalStatus);
    preferredCommunicationOptions = convertEnumToSelection(PreferredCommunication);
    identificationTypeOptions = [
        { label: 'Passport', value: 'Passport' },
        { label: 'National ID', value: 'NationalID' },
        { label: "Driver's License", value: 'DriversLicense' },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private doctorSrv: DoctorService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.initForms();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen) {
            this.resetAll();
        }
    }
    // #endregion

    // #region Methods
    private initForms() {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(8)]],
        });

        this.profileForm = this.fb.group({
            firstName: ['', [Validators.required]],
            middleName: [''],
            lastName: ['', [Validators.required]],
            dateOfBirth: [null, [Validators.required]],
            gender: [null, [Validators.required]],
            bloodGroup: [null, [Validators.required]],
            maritalStatus: [null, [Validators.required]],
            nationality: [''],
            identificationType: [null],
            identificationNumber: [''],
            identificationExpiry: [null],
            emergencyContactName: [''],
            emergencyContactPhone: [''],
            emergencyContactRelationship: [''],
            preferredCommunication: [null, [Validators.required]],
        });

        this.doctorForm = this.fb.group({
            primarySpecialtyId: [null],
            languagesSpoken: [''],
            yearsOfExperience: [0, [Validators.min(0)]],
            yearsOfPractice: [0, [Validators.min(0)]],
            bio: [''],
            about: [''],
            archivements: [''],
            researchInterests: [''],
            publicationsCount: [0, [Validators.min(0)]],
            conferencePresentations: [0, [Validators.min(0)]],
            medicalLicenseNumber: ['', [Validators.required]],
            medicalLicenseExpiry: [null],
            medicalLicenseIssuingAuthority: [''],
            employmentStatus: [EmploymentStatus.Active, [Validators.required]],
            bankAccountDetails: [''],
            panNumber: [''],
            gstin: [''],
        });
    }

    private getFormForStep(step: number): FormGroup {
        switch (step) {
            case 1: return this.userForm;
            case 2: return this.profileForm;
            case 3: return this.doctorForm;
            default: return this.userForm;
        }
    }

    private resetAll() {
        this.currentStep = 1;
        this.completedSteps.clear();
        this.userForm.reset({ email: '', phone: '', password: '' });
        this.profileForm.reset({ gender: null, bloodGroup: null, maritalStatus: null, preferredCommunication: null });
        this.doctorForm.reset({ yearsOfExperience: 0, yearsOfPractice: 0, publicationsCount: 0, conferencePresentations: 0, employmentStatus: EmploymentStatus.Active });
    }

    isStepCompleted(stepId: number): boolean {
        return this.completedSteps.has(stepId);
    }

    goToStep(stepId: number) {
        // Allow free navigation to any visited/completed step, or back
        if (stepId < this.currentStep || this.completedSteps.has(stepId)) {
            this.currentStep = stepId;
            this.scrollToTop();
        }
    }

    nextStep() {
        const form = this.getFormForStep(this.currentStep);

        if (form.invalid) {
            form.markAllAsTouched();
            this.toastSrv.error('Please complete all required fields before continuing.');
            return;
        }

        this.completedSteps.add(this.currentStep);
        this.currentStep++;
        this.scrollToTop();
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.scrollToTop();
        }
    }

    private scrollToTop() {
        setTimeout(() => {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = 0;
            }
        }, 0);
    }

    async onSave() {
        // Validate final step
        if (this.doctorForm.invalid) {
            this.doctorForm.markAllAsTouched();
            this.toastSrv.error('Please complete all required fields.');
            return;
        }

        const user = this.userForm.getRawValue();
        const profile = this.profileForm.getRawValue();
        const doctor = this.doctorForm.getRawValue();

        const targetId = generateUUID();

        const payload = {
            // User
            id: targetId,
            email: user.email,
            phone: user.phone,
            password: user.password,
            // Profile
            firstName: profile.firstName,
            lastName: profile.lastName,
            middleName: profile.middleName,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            bloodGroup: profile.bloodGroup,
            maritalStatus: profile.maritalStatus,
            nationality: profile.nationality,
            identificationType: profile.identificationType,
            identificationNumber: profile.identificationNumber,
            identificationExpiry: profile.identificationExpiry,
            emergencyContactName: profile.emergencyContactName,
            emergencyContactPhone: profile.emergencyContactPhone,
            emergencyContactRelationship: profile.emergencyContactRelationship,
            preferredCommunication: profile.preferredCommunication,
            // Doctor
            bio: doctor.bio,
            about: doctor.about,
            languagesSpoken: doctor.languagesSpoken,
            primarySpecialtyId: doctor.primarySpecialtyId,
            medicalLicenseNumber: doctor.medicalLicenseNumber,
            medicalLicenseExpiry: doctor.medicalLicenseExpiry,
            medicalLicenseIssuingAuthority: doctor.medicalLicenseIssuingAuthority,
            yearsOfExperience: doctor.yearsOfExperience,
            yearsOfPractice: doctor.yearsOfPractice,
            archivements: doctor.archivements?.join(',') ?? '',
            researchInterests: doctor.researchInterests?.join(',') ?? '',
            publicationsCount: doctor.publicationsCount,
            conferencePresentations: doctor.conferencePresentations,
            employmentStatus: doctor.employmentStatus,
            bankAccountDetails: JSON.stringify(doctor.bankAccountDetails ?? ''),
            panNumber: doctor.panNumber,
            gstin: doctor.gstin,
        };


        const request$ = this.doctorSrv.create(payload);

        try {
            await firstValueFrom(request$);

            const response = await firstValueFrom(this.doctorSrv.search_by_id(targetId));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (error) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            console.error(error);
        }
    }

    onClose() {
        this.close.emit();
    }
}