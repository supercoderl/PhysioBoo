import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, takeUntil } from "rxjs";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { AdmissionService } from "../../../../services/admin/admission.service";
import { BedMapService } from "../../../../services/admin/bed-map.service";
import { DepartmentService } from "../../../../services/admin/department.service";
import { DoctorService } from "../../../../services/admin/doctor.service";
import { PatientService } from "../../../../services/admin/patient.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Admission, AdmissionType, CreateAdmissionRequest } from "../../../../shared/types/admission.types";
import { Bed } from "../../../../shared/types/bed.types";
import { Doctor } from "../../../../shared/types/medical-staff.types";
import { Department } from "../../../../shared/types/operation.types";
import { Patient } from "../../../../shared/types/patient.types";
import { Ward } from "../../../../shared/types/ward.types";

interface AdmissionDraft {
    admissionDate: string;
    admissionTime: string;
    admissionType: AdmissionType | '';
    referredBy: string;
    departmentId: string;
    doctorId: string;
    wardId: string;
    bedId: string;
    expectedDischargeDate: string;
    chiefComplaint: string;
    provisionalDiagnosis: string;
    allergies: string;
    currentMedications: string;
    medicalHistory: string;
    hasInsurance: boolean;
    insuranceProvider: string;
    policyNumber: string;
}

@Component({
    selector: 'admin-admission',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        BooCheckboxComponent,
        BooDatepickerComponent,
        BooInputComponent,
        BooSelectComponent,
        BooTextareaComponent
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Patient Admission</h2>
              <p class="text-gray-600 mt-1">Admit a registered patient, optionally into a bed</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Admission No.</p>
              <p class="text-lg font-bold text-primary">{{ createdAdmission()?.admissionNumber ?? 'Assigned on submit' }}</p>
            </div>
          </div>
        </div>

        <!-- Success -->
        <div *ngIf="createdAdmission() as done" class="bg-surface rounded-lg shadow-md p-8 text-center" role="status">
          <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">{{ done.patientName }} has been admitted</h3>
          <p class="text-gray-600 mt-2">
            {{ done.admissionNumber }} · {{ done.departmentName }} · {{ done.doctorName }}
            <span *ngIf="done.bedNumber"> · Bed {{ done.bedNumber }} ({{ done.wardName }})</span>
          </p>
          <boo-button-admin (click)="startNew()" textColor="white" padding="8px 24px" [radius]="8" class="mt-6">
            Admit another patient
          </boo-button-admin>
        </div>

        <form *ngIf="!createdAdmission()" (ngSubmit)="submitAdmission()" #admissionForm="ngForm">
          <!-- Progress Steps -->
          <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
            <ol class="flex items-center justify-between" aria-label="Admission steps">
              <li *ngFor="let step of steps; let i = index" class="flex items-center flex-1" [attr.aria-current]="currentStep === i + 1 ? 'step' : null">
                <div class="flex flex-col items-center flex-1">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2"
                       [ngClass]="{
                         'bg-primary text-white': currentStep >= i + 1,
                         'bg-gray-300 text-gray-600': currentStep < i + 1
                       }">
                    {{ i + 1 }}
                  </div>
                  <p class="text-xs text-center font-medium text-gray-700">{{ step }}</p>
                </div>
                <div *ngIf="i < steps.length - 1" class="h-1 flex-1 mx-2 -mt-6"
                     [ngClass]="{
                       'bg-primary': currentStep > i + 1,
                       'bg-gray-300': currentStep <= i + 1
                     }" aria-hidden="true"></div>
              </li>
            </ol>
          </div>

          <!-- Step 1: Patient -->
          <div *ngIf="currentStep === 1" class="bg-surface rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-2 pb-3 border-b border-gray-200">Patient</h3>
            <p class="text-sm text-gray-600 mb-6">
              Only registered patients can be admitted. New patient?
              <a routerLink="/admin/crm/patient" class="text-primary hover:text-primaryPressed underline">Register them in CRM → Patient</a> first.
            </p>

            <div class="relative max-w-xl">
              <label for="patient-lookup" class="block text-sm font-medium text-gray-700 mb-2">Patient <span class="text-red-500">*</span></label>
              <div *ngIf="selectedPatient() as patient; else patientSearch" class="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span class="text-sm text-gray-900">{{ patient.fullName }} · {{ patient.patientNumber }} · {{ patient.phone || patient.email }}</span>
                <button type="button" (click)="clearPatient()" class="text-sm text-primary hover:text-primaryPressed">Change</button>
              </div>
              <ng-template #patientSearch>
                <boo-input [id]="'patient-lookup'" type="search" name="patientLookup"
                           [(ngModel)]="patientQuery" (ngModelChange)="patientLookup$.next($event)"
                           label="Search by name, phone or patient number..."></boo-input>
                <ul *ngIf="patientResults().length" role="listbox" aria-label="Matching patients"
                    class="absolute z-10 mt-1 w-full bg-surface border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                  <li *ngFor="let p of patientResults()" role="option">
                    <button type="button" (click)="selectPatient(p)" class="w-full text-left px-4 py-2 hover:bg-gray-50">
                      <span class="font-medium text-gray-900">{{ p.fullName }}</span>
                      <span class="text-sm text-gray-500"> · {{ p.patientNumber }} · {{ p.phone || p.email }}</span>
                    </button>
                  </li>
                </ul>
              </ng-template>
            </div>
          </div>

          <!-- Step 2: Admission Details -->
          <div *ngIf="currentStep === 2" class="bg-surface rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Admission Details</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Admission Date <span class="text-red-500">*</span></label>
                <boo-datepicker name="admissionDate" [(ngModel)]="draft.admissionDate" required></boo-datepicker>
              </div>
              <div>
                <label for="adm-time" class="block text-sm font-medium text-gray-700 mb-2">Admission Time <span class="text-red-500">*</span></label>
                <input id="adm-time" type="time" name="admissionTime" [(ngModel)]="draft.admissionTime" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Admission Type <span class="text-red-500">*</span></label>
                <boo-select name="admissionType" [(ngModel)]="draft.admissionType" required
                            label="Select Type" [options]="admissionTypeOptions"></boo-select>
              </div>
              <div>
                <label for="adm-ref" class="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                <boo-input [id]="'adm-ref'" name="referredBy" [(ngModel)]="draft.referredBy" [maxlength]="120" label="Referring physician or facility"></boo-input>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Department <span class="text-red-500">*</span></label>
                <boo-select name="departmentId" [(ngModel)]="draft.departmentId" required
                            label="Select Department" [options]="departments()" bindLabel="name" bindValue="id"></boo-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Assigned Doctor <span class="text-red-500">*</span></label>
                <boo-select name="doctorId" [(ngModel)]="draft.doctorId" required
                            label="Select Doctor" [options]="doctors()" bindLabel="fullName" bindValue="id"></boo-select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                <boo-select name="wardId" [(ngModel)]="draft.wardId" (ngModelChange)="onWardChanged()"
                            label="No bed yet" [options]="wardOptions()"></boo-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bed</label>
                <boo-select name="bedId" [(ngModel)]="draft.bedId" [disabled]="!draft.wardId || loadingBeds()"
                            [label]="loadingBeds() ? 'Loading beds...' : (draft.wardId && beds().length === 0 ? 'No free beds' : 'Select Bed')"
                            [options]="bedOptions()"></boo-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Expected Discharge</label>
                <boo-datepicker name="expectedDischargeDate" [(ngModel)]="draft.expectedDischargeDate" [disabled]="!draft.bedId"></boo-datepicker>
              </div>
            </div>
          </div>

          <!-- Step 3: Medical Information -->
          <div *ngIf="currentStep === 3" class="bg-surface rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Medical Information</h3>

            <div class="mb-4">
              <label for="adm-cc" class="block text-sm font-medium text-gray-700 mb-2">Chief Complaint <span class="text-red-500">*</span></label>
              <boo-textarea [id]="'adm-cc'" name="chiefComplaint" [rows]="3" [maxlength]="1000" [(ngModel)]="draft.chiefComplaint" required label="Main reason for admission"></boo-textarea>
            </div>
            <div class="mb-4">
              <label for="adm-dx" class="block text-sm font-medium text-gray-700 mb-2">Provisional Diagnosis <span class="text-red-500">*</span></label>
              <boo-textarea [id]="'adm-dx'" name="provisionalDiagnosis" [rows]="3" [maxlength]="1000" [(ngModel)]="draft.provisionalDiagnosis" required></boo-textarea>
            </div>
            <div class="mb-4">
              <label for="adm-allergies" class="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
              <boo-textarea [id]="'adm-allergies'" name="allergies" [rows]="2" [maxlength]="1000" [(ngModel)]="draft.allergies"></boo-textarea>
            </div>
            <div class="mb-4">
              <label for="adm-meds" class="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
              <boo-textarea [id]="'adm-meds'" name="currentMedications" [rows]="2" [maxlength]="1000" [(ngModel)]="draft.currentMedications"></boo-textarea>
            </div>
            <div>
              <label for="adm-history" class="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
              <boo-textarea [id]="'adm-history'" name="medicalHistory" [rows]="3" [maxlength]="2000" [(ngModel)]="draft.medicalHistory"></boo-textarea>
            </div>
          </div>

          <!-- Step 4: Insurance -->
          <div *ngIf="currentStep === 4" class="bg-surface rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Insurance Information</h3>

            <div class="mb-6">
              <boo-checkbox [(ngModel)]="draft.hasInsurance" name="hasInsurance" size="large">
                <span class="text-gray-700 font-medium">Patient has health insurance</span>
              </boo-checkbox>
            </div>

            <div *ngIf="draft.hasInsurance">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="adm-ins" class="block text-sm font-medium text-gray-700 mb-2">Insurance Provider <span class="text-red-500">*</span></label>
                  <boo-input [id]="'adm-ins'" name="insuranceProvider" [maxlength]="120" [(ngModel)]="draft.insuranceProvider" label="Insurance company name"></boo-input>
                </div>
                <div>
                  <label for="adm-policy" class="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                  <boo-input [id]="'adm-policy'" name="policyNumber" [maxlength]="64" [(ngModel)]="draft.policyNumber" label="Insurance policy number"></boo-input>
                </div>
              </div>
              <div class="bg-primarySoft border border-primary/25 rounded-lg p-4">
                <p class="text-sm font-medium text-primaryPressed mb-1">Insurance Verification</p>
                <p class="text-sm text-primaryHover">Insurance details will be verified with the provider. This process may take 24-48 hours.</p>
              </div>
            </div>

            <div *ngIf="!draft.hasInsurance" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm font-medium text-yellow-800 mb-1">Self-Pay Patient</p>
              <p class="text-sm text-yellow-700">Patient will be responsible for all medical expenses. Payment arrangements should be discussed with the billing department.</p>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="bg-surface rounded-lg shadow-md p-6 flex justify-between">
            <boo-button-admin *ngIf="currentStep > 1" (click)="previousStep()" background="#85757D" textColor="white" padding="8px 24px" [radius]="8">
              Previous
            </boo-button-admin>
            <div *ngIf="currentStep === 1"></div>

            <div class="flex items-center space-x-3">
              <span *ngIf="!canProceed" class="text-sm text-gray-500">Complete the required fields to continue.</span>
              <boo-button-admin *ngIf="currentStep < 4" (click)="nextStep()" [disabled]="!canProceed" textColor="white" padding="8px 24px" [radius]="8">
                Next
              </boo-button-admin>
              <button *ngIf="currentStep === 4" type="submit" [disabled]="!canProceed || isSubmitting"
                      class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                {{ isSubmitting ? 'Submitting...' : 'Submit Admission' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    `
})

export class AdminAdmissionComponent implements OnInit, OnDestroy {
    // #region Inputs, Outputs, Properties
    readonly steps = ['Patient', 'Admission Details', 'Medical Info', 'Insurance'];
    readonly admissionTypes: AdmissionType[] = ['Emergency', 'Scheduled', 'Transfer', 'Outpatient'];
    readonly admissionTypeOptions = this.admissionTypes.map(t => ({ label: t, value: t }));

    currentStep = 1;
    isSubmitting = false;

    patientQuery = '';
    patientResults = signal<Patient[]>([]);
    selectedPatient = signal<Patient | null>(null);
    readonly patientLookup$ = new Subject<string>();

    departments = signal<Department[]>([]);
    doctors = signal<Doctor[]>([]);
    wards = signal<Ward[]>([]);
    beds = signal<Bed[]>([]);
    loadingBeds = signal(false);
    readonly wardOptions = computed(() => this.wards().map(w => ({ value: w.id, label: `${w.name} (${w.availableBeds} free)` })));
    readonly bedOptions = computed(() => this.beds().map(b => ({ value: b.id, label: `${b.number}${b.roomNumber ? ' · Room ' + b.roomNumber : ''} · ${b.bedType}` })));

    createdAdmission = signal<Admission | null>(null);
    draft: AdmissionDraft = this.emptyDraft();

    private readonly destroy$ = new Subject<void>();
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private admissionSrv: AdmissionService,
        private patientSrv: PatientService,
        private departmentSrv: DepartmentService,
        private doctorSrv: DoctorService,
        private bedMapSrv: BedMapService,
        private toastSrv: ToastService,
    ) { }

    ngOnInit(): void {
        this.patientLookup$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(q => q.trim().length < 2
                ? of(null)
                : this.patientSrv.search({ pageNumber: 1, pageSize: 6, search: q.trim() }).pipe(catchError(() => of(null)))),
            takeUntil(this.destroy$)
        ).subscribe(res => this.patientResults.set(res?.success ? res.data.items : []));

        this.loadLookups();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    // #endregion

    // #region Getters
    get canProceed(): boolean {
        const d = this.draft;
        switch (this.currentStep) {
            case 1: return !!this.selectedPatient();
            case 2: return !!d.admissionDate && !!d.admissionTime && d.admissionType !== '' && !!d.departmentId && !!d.doctorId;
            case 3: return d.chiefComplaint.trim().length > 0 && d.provisionalDiagnosis.trim().length > 0;
            case 4: return !d.hasInsurance || d.insuranceProvider.trim().length > 0;
            default: return false;
        }
    }
    // #endregion

    // #region Methods
    private emptyDraft(): AdmissionDraft {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return {
            admissionDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
            admissionTime: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
            admissionType: '',
            referredBy: '',
            departmentId: '',
            doctorId: '',
            wardId: '',
            bedId: '',
            expectedDischargeDate: '',
            chiefComplaint: '',
            provisionalDiagnosis: '',
            allergies: '',
            currentMedications: '',
            medicalHistory: '',
            hasInsurance: false,
            insuranceProvider: '',
            policyNumber: ''
        };
    }

    private loadLookups() {
        this.departmentSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe(res => {
            if (res.success) this.departments.set(res.data.items);
        });
        this.doctorSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe(res => {
            if (res.success) this.doctors.set(res.data.items);
        });
        this.bedMapSrv.wards().subscribe(res => {
            if (res.success) this.wards.set(res.data);
        });
    }

    onWardChanged() {
        this.draft.bedId = '';
        this.draft.expectedDischargeDate = '';
        this.beds.set([]);
        if (!this.draft.wardId) return;

        this.loadingBeds.set(true);
        this.bedMapSrv.search({
            pageNumber: 1,
            pageSize: 100,
            sort: 'number',
            filter: { wardId: this.draft.wardId, status: 'Available' }
        }).pipe(finalize(() => this.loadingBeds.set(false)))
            .subscribe(res => {
                if (res.success) this.beds.set(res.data.items);
            });
    }

    selectPatient(patient: Patient) {
        this.selectedPatient.set(patient);
        this.patientQuery = '';
        this.patientResults.set([]);
    }

    clearPatient() {
        this.selectedPatient.set(null);
    }

    nextStep(): void {
        if (this.currentStep < 4 && this.canProceed) {
            this.currentStep++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    submitAdmission(): void {
        const patient = this.selectedPatient();
        const d = this.draft;
        if (!patient || d.admissionType === '' || !this.canProceed || this.isSubmitting) return;

        const request: CreateAdmissionRequest = {
            patientId: patient.id,
            admissionType: d.admissionType,
            // Local wall-clock time without a timezone: the server stores local times.
            admittedAt: `${d.admissionDate}T${d.admissionTime}:00`,
            departmentId: d.departmentId,
            doctorId: d.doctorId,
            referredBy: d.referredBy.trim() || null,
            bedId: d.bedId || null,
            expectedDischargeDate: d.bedId && d.expectedDischargeDate ? d.expectedDischargeDate : null,
            chiefComplaint: d.chiefComplaint.trim(),
            provisionalDiagnosis: d.provisionalDiagnosis.trim(),
            allergies: d.allergies.trim() || null,
            currentMedications: d.currentMedications.trim() || null,
            medicalHistory: d.medicalHistory.trim() || null,
            hasInsurance: d.hasInsurance,
            insuranceProvider: d.hasInsurance ? d.insuranceProvider.trim() || null : null,
            policyNumber: d.hasInsurance ? d.policyNumber.trim() || null : null,
        };

        this.isSubmitting = true;
        this.admissionSrv.create(request)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe(res => {
                if (!res.success || !res.data) return;
                this.toastSrv.success('Patient admitted.');
                this.admissionSrv.search_by_id(res.data).subscribe(detail => {
                    if (detail.success && detail.data) this.createdAdmission.set(detail.data);
                });
            });
    }

    startNew() {
        this.createdAdmission.set(null);
        this.selectedPatient.set(null);
        this.patientQuery = '';
        this.beds.set([]);
        this.draft = this.emptyDraft();
        this.currentStep = 1;
        this.bedMapSrv.wards().subscribe(res => {
            if (res.success) this.wards.set(res.data);
        });
    }
    // #endregion
}
