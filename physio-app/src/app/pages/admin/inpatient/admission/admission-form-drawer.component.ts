import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { AdmissionService } from '../../../../services/admin/admission.service';
import { BedMapService } from '../../../../services/admin/bed-map.service';
import { DepartmentService } from '../../../../services/admin/department.service';
import { DoctorService } from '../../../../services/admin/doctor.service';
import { PatientService } from '../../../../services/admin/patient.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Admission, AdmissionType, CreateAdmissionRequest, UpdateAdmissionRequest } from '../../../../shared/types/admission.types';
import { Bed } from '../../../../shared/types/bed.types';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { Department } from '../../../../shared/types/operation.types';
import { Patient } from '../../../../shared/types/patient.types';
import { Ward } from '../../../../shared/types/ward.types';
import { ADMISSION_TYPES, isoDate, isoTime, toLocalDateTime } from './admission.utils';

/** A pick list loaded from the API. `error` is set when the user can't read it or it failed. */
interface Lookup<T> {
    items: T[];
    loading: boolean;
    error: string | null;
}

/** What the page needs to confirm the saved admission. */
export interface SavedAdmission {
    id: string;
    mode: 'create' | 'edit';
}

const LOOKUP_SIZE = 100;
const PATIENT_RESULTS = 8;

/**
 * Admit a registered patient (POST /api/admissions, optionally into an available bed in the same transaction) or edit
 * an active admission (PATCH /api/admissions/{id}). Editing never changes the patient, admission time or bed: the
 * update API does not accept them.
 */
@Component({
    selector: 'admission-form-drawer',
    standalone: true,
    imports: [
        NgIf, NgFor, DatePipe, ReactiveFormsModule, RouterLink, DrawerComponent, CustomScrollbarDirective,
        BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent,
        BooSelectComponent, BooDatepickerComponent, BooTextareaComponent,
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" (close)="discard()">
            <form
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="adm-form-title"
                [attr.inert]="isOpen ? null : ''"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="adm-form-title" class="m-0 text-lg font-semibold leading-tight text-regular">{{ editing ? 'Edit admission' : 'New admission' }}</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">
                            <ng-container *ngIf="editing; else createHint">{{ admission?.admissionNumber }} · fields marked <span class="text-danger">*</span> are required.</ng-container>
                            <ng-template #createHint>Fields marked <span class="text-danger">*</span> are required. The admission number is assigned on save.</ng-template>
                        </p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close admission form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- 1. Patient -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular">Patient</legend>

                        <div *ngIf="editing && admission as a" class="flex items-center gap-3 p-3 rounded-lg border border-borderGray bg-body">
                            <span class="flex-none w-9 h-9 rounded-full bg-primarySoft text-primaryDeep flex items-center justify-center" aria-hidden="true"><physio-icon name="user-round" [size]="17" /></span>
                            <div class="min-w-0 flex-1">
                                <p class="m-0 text-sm font-semibold text-regular truncate">{{ a.patientName || 'Unnamed patient' }}</p>
                                <p class="m-0 text-xs text-secondary tabular-nums truncate">{{ a.patientNumber }} · admitted {{ a.admittedAt | date: 'd MMM y, HH:mm' }}</p>
                            </div>
                        </div>

                        <ng-container *ngIf="!editing">
                            <div *ngIf="form.controls.patient.value as p; else patientSearchTpl" class="flex items-center gap-3 p-3 rounded-lg border border-borderGray bg-body">
                                <span class="flex-none w-9 h-9 rounded-full bg-primarySoft text-primaryDeep flex items-center justify-center" aria-hidden="true"><physio-icon name="user-round" [size]="17" /></span>
                                <div class="min-w-0 flex-1">
                                    <p class="m-0 text-sm font-semibold text-regular truncate">{{ p.fullName || 'Unnamed patient' }}</p>
                                    <p class="m-0 text-xs text-secondary tabular-nums truncate">{{ p.patientNumber }}<ng-container *ngIf="p.phone"> · {{ p.phone }}</ng-container></p>
                                </div>
                                <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="clearPatient()">Change</button>
                            </div>

                            <ng-template #patientSearchTpl>
                                <label for="adm-patient" class="block mb-1 text-[13px] font-medium text-regular">Find patient <span class="text-danger" aria-hidden="true">*</span></label>
                                <div class="relative">
                                    <physio-icon
                                        [name]="patientSearching ? 'loader-circle' : 'search'"
                                        [size]="16"
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none"
                                        [class.animate-spin]="patientSearching"
                                    />
                                    <input
                                        #patientInput
                                        id="adm-patient"
                                        type="search"
                                        role="combobox"
                                        autocomplete="off"
                                        aria-autocomplete="list"
                                        aria-controls="adm-patient-results"
                                        [attr.aria-expanded]="patientResults.length > 0"
                                        [attr.aria-activedescendant]="activePatient >= 0 ? 'adm-patient-opt-' + activePatient : null"
                                        [attr.aria-invalid]="showPatientError ? true : null"
                                        aria-describedby="adm-patient-hint"
                                        [formControl]="patientQuery"
                                        placeholder="Name, patient number or phone"
                                        maxlength="100"
                                        class="w-full h-11 pl-9 pr-3 rounded-md border border-borderGray bg-surface text-sm text-regular placeholder:text-placeholder transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 aria-[invalid=true]:border-danger"
                                        (keydown)="onPatientKeydown($event)"
                                    />
                                </div>
                                <ul
                                    *ngIf="patientResults.length"
                                    id="adm-patient-results"
                                    role="listbox"
                                    aria-label="Matching patients"
                                    class="m-0 mt-1 p-1 list-none rounded-lg border border-borderGray bg-surface shadow-sm max-h-64 overflow-y-auto"
                                >
                                    <li
                                        *ngFor="let p of patientResults; let i = index; trackBy: trackById"
                                        [id]="'adm-patient-opt-' + i"
                                        role="option"
                                        [attr.aria-selected]="i === activePatient"
                                        class="flex items-center gap-3 px-2.5 py-2 rounded-md cursor-pointer"
                                        [class.bg-primarySoft]="i === activePatient"
                                        (mouseenter)="activePatient = i"
                                        (mousedown)="$event.preventDefault()"
                                        (click)="selectPatient(p)"
                                    >
                                        <div class="min-w-0 flex-1">
                                            <p class="m-0 text-sm font-medium text-regular truncate">{{ p.fullName || 'Unnamed patient' }}</p>
                                            <p class="m-0 text-xs text-secondary tabular-nums truncate">{{ p.patientNumber }}<ng-container *ngIf="p.phone"> · {{ p.phone }}</ng-container></p>
                                        </div>
                                    </li>
                                </ul>
                                <p id="adm-patient-hint" class="m-0 mt-1 text-xs" [class.text-danger]="showPatientError || patientSearchError" [class.text-secondary]="!showPatientError && !patientSearchError" aria-live="polite">
                                    <ng-container *ngIf="patientSearchError; else hintTpl">{{ patientSearchError }}</ng-container>
                                    <ng-template #hintTpl>
                                        <ng-container *ngIf="patientNoMatch; else defaultHint">No patients match “{{ patientQuery.value }}”.</ng-container>
                                        <ng-template #defaultHint>{{ showPatientError ? 'Search for and select a patient.' : 'Only registered patients can be admitted. Type at least 2 characters.' }}</ng-template>
                                    </ng-template>
                                    <a *ngIf="registerLink" [routerLink]="registerLink" class="ml-1 font-semibold text-primaryDeep hover:text-primary">Register a new patient</a>
                                </p>
                            </ng-template>
                        </ng-container>
                    </fieldset>

                    <!-- 2. Admission -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular">Admission</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ng-container *ngIf="!editing">
                                <div class="min-w-0">
                                    <label for="adm-date" class="block mb-1 text-[13px] font-medium text-regular">Admission date <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-datepicker id="adm-date" formControlName="admissionDate" label="Admission date" required />
                                    <p *ngIf="showError('admissionDate')" class="m-0 mt-1 text-xs text-danger" role="alert">Pick the admission date.</p>
                                </div>
                                <div class="min-w-0">
                                    <label for="adm-time" class="block mb-1 text-[13px] font-medium text-regular">Admission time <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input id="adm-time" name="admissionTime" type="time" formControlName="admissionTime" label="Admission time" required />
                                </div>
                            </ng-container>
                            <div class="min-w-0">
                                <label for="adm-type" class="block mb-1 text-[13px] font-medium text-regular">Admission type <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="adm-type" formControlName="admissionType" label="Admission type" required [options]="typeOptions" />
                            </div>
                            <div class="min-w-0">
                                <label for="adm-ref" class="block mb-1 text-[13px] font-medium text-regular">Referred by</label>
                                <boo-input id="adm-ref" name="referredBy" formControlName="referredBy" [maxlength]="120" label="Referring physician or facility" />
                            </div>
                            <div class="min-w-0">
                                <label for="adm-dept" class="block mb-1 text-[13px] font-medium text-regular">Department <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="adm-dept" formControlName="departmentId" label="Department" required [options]="departments.items" bindLabel="name" bindValue="id" />
                                <p *ngIf="departments.error || departments.loading" class="m-0 mt-1 text-xs" [class.text-danger]="departments.error" [class.text-secondary]="!departments.error">{{ departments.error || 'Loading departments…' }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="adm-doctor" class="block mb-1 text-[13px] font-medium text-regular">Assigned doctor <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="adm-doctor" formControlName="doctorId" label="Doctor" required [options]="doctors.items" bindLabel="fullName" bindValue="id" />
                                <p *ngIf="doctors.error || doctors.loading" class="m-0 mt-1 text-xs" [class.text-danger]="doctors.error" [class.text-secondary]="!doctors.error">{{ doctors.error || 'Loading doctors…' }}</p>
                            </div>
                        </div>
                    </fieldset>

                    <!-- 3. Bed (only when admitting) -->
                    <fieldset *ngIf="!editing" class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular">Bed <span class="font-normal text-secondary">(optional)</span></legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="min-w-0">
                                <label for="adm-ward" class="block mb-1 text-[13px] font-medium text-regular">Ward</label>
                                <boo-select id="adm-ward" formControlName="wardId" label="No bed" [options]="wardOptions" />
                                <p *ngIf="wards.error || wards.loading" class="m-0 mt-1 text-xs" [class.text-danger]="wards.error" [class.text-secondary]="!wards.error">{{ wards.error || 'Loading wards…' }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="adm-bed" class="block mb-1 text-[13px] font-medium text-regular">Available bed</label>
                                <boo-select id="adm-bed" formControlName="bedId" [label]="bedPlaceholder" [options]="bedOptions" />
                                <p *ngIf="bedsError" class="m-0 mt-1 text-xs text-danger" role="alert">{{ bedsError }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="adm-edd" class="block mb-1 text-[13px] font-medium text-regular">Expected discharge</label>
                                <boo-datepicker id="adm-edd" formControlName="expectedDischargeDate" label="Expected discharge" [min]="today" />
                            </div>
                        </div>
                        <p class="m-0 mt-2 text-xs text-secondary">The bed is assigned together with the admission. Leave it empty to admit without a bed.</p>
                    </fieldset>

                    <!-- 4. Clinical -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular">Clinical information</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="adm-cc" class="block mb-1 text-[13px] font-medium text-regular">Chief complaint <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-textarea id="adm-cc" formControlName="chiefComplaint" label="Chief complaint" required [rows]="2" [maxlength]="1000" />
                            </div>
                            <div>
                                <label for="adm-dx" class="block mb-1 text-[13px] font-medium text-regular">Provisional diagnosis <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-textarea id="adm-dx" formControlName="provisionalDiagnosis" label="Provisional diagnosis" required [rows]="2" [maxlength]="1000" />
                            </div>
                            <div>
                                <label for="adm-allergies" class="block mb-1 text-[13px] font-medium text-regular">Known allergies</label>
                                <boo-textarea id="adm-allergies" formControlName="allergies" label="Known allergies" [rows]="2" [maxlength]="1000" />
                            </div>
                            <div>
                                <label for="adm-meds" class="block mb-1 text-[13px] font-medium text-regular">Current medications</label>
                                <boo-textarea id="adm-meds" formControlName="currentMedications" label="Current medications" [rows]="2" [maxlength]="1000" />
                            </div>
                            <div>
                                <label for="adm-history" class="block mb-1 text-[13px] font-medium text-regular">Medical history</label>
                                <boo-textarea id="adm-history" formControlName="medicalHistory" label="Medical history" [rows]="3" [maxlength]="2000" />
                            </div>
                        </div>
                    </fieldset>

                    <!-- 5. Insurance -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular">Insurance</legend>
                        <boo-checkbox name="hasInsurance" formControlName="hasInsurance" label="Patient has health insurance" />
                        <div *ngIf="form.controls.hasInsurance.value" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="min-w-0">
                                <label for="adm-ins" class="block mb-1 text-[13px] font-medium text-regular">Insurance provider <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input id="adm-ins" name="insuranceProvider" formControlName="insuranceProvider" [maxlength]="120" label="Insurance provider" required />
                            </div>
                            <div class="min-w-0">
                                <label for="adm-policy" class="block mb-1 text-[13px] font-medium text-regular">Policy number</label>
                                <boo-input id="adm-policy" name="policyNumber" formControlName="policyNumber" [maxlength]="64" label="Policy number" />
                            </div>
                        </div>
                    </fieldset>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="submitting">
                        <physio-icon *ngIf="!submitting" [name]="editing ? 'save' : 'bed'" [size]="15" aria-hidden="true" />{{ editing ? 'Save changes' : 'Admit patient' }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class AdmissionFormDrawerComponent implements OnInit, OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    /** The admission being edited; null admits a new patient. */
    @Input() admission: Admission | null = null;
    /** Route to patient registration, when the user may register patients. */
    @Input() registerLink: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<SavedAdmission>();

    @ViewChild('patientInput') private patientInput?: ElementRef<HTMLInputElement>;

    private readonly fb = inject(FormBuilder);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    private readonly admissionSrv = inject(AdmissionService);
    private readonly patientSrv = inject(PatientService);
    private readonly departmentSrv = inject(DepartmentService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly bedMapSrv = inject(BedMapService);
    private readonly dialogSrv = inject(DialogService);

    readonly typeOptions = ADMISSION_TYPES.map(t => ({ label: t, value: t }));
    today = isoDate(new Date());

    readonly form = this.fb.group({
        patient: this.fb.control<Patient | null>(null, Validators.required),
        admissionDate: this.fb.nonNullable.control(this.today, Validators.required),
        admissionTime: this.fb.nonNullable.control(isoTime(new Date()), Validators.required),
        admissionType: this.fb.control<AdmissionType | null>(null, Validators.required),
        referredBy: this.fb.nonNullable.control('', Validators.maxLength(120)),
        departmentId: this.fb.control<string | null>(null, Validators.required),
        doctorId: this.fb.control<string | null>(null, Validators.required),
        wardId: this.fb.control<string | null>(null),
        bedId: this.fb.control<string | null>(null),
        expectedDischargeDate: this.fb.control<string | null>(null),
        chiefComplaint: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(1000)]),
        provisionalDiagnosis: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(1000)]),
        allergies: this.fb.nonNullable.control('', Validators.maxLength(1000)),
        currentMedications: this.fb.nonNullable.control('', Validators.maxLength(1000)),
        medicalHistory: this.fb.nonNullable.control('', Validators.maxLength(2000)),
        hasInsurance: this.fb.nonNullable.control(false),
        insuranceProvider: this.fb.nonNullable.control('', Validators.maxLength(120)),
        policyNumber: this.fb.nonNullable.control('', Validators.maxLength(64)),
    });

    readonly patientQuery = this.fb.nonNullable.control('');
    patientResults: Patient[] = [];
    patientSearching = false;
    patientNoMatch = false;
    patientSearchError: string | null = null;
    activePatient = -1;

    departments: Lookup<Department> = { items: [], loading: false, error: null };
    doctors: Lookup<Doctor> = { items: [], loading: false, error: null };
    wards: Lookup<Ward> = { items: [], loading: false, error: null };
    beds: Bed[] = [];
    bedsLoading = false;
    bedsError: string | null = null;

    submitting = false;
    private lookupsRequested = false;
    // #endregion

    // #region Getters
    get editing(): boolean {
        return !!this.admission;
    }

    get showPatientError(): boolean {
        const c = this.form.controls.patient;
        return c.invalid && c.touched;
    }

    get wardOptions(): { label: string; value: string | null }[] {
        return [{ label: 'No bed', value: null }, ...this.wards.items.map(w => ({ label: `${w.name} (${w.availableBeds} free)`, value: w.id }))];
    }

    get bedOptions(): { label: string; value: string }[] {
        return this.beds.map(b => ({ label: `${b.number}${b.roomNumber ? ' · Room ' + b.roomNumber : ''} · ${b.bedType}`, value: b.id }));
    }

    get bedPlaceholder(): string {
        if (!this.form.controls.wardId.value) return 'Select a ward first';
        if (this.bedsLoading) return 'Loading beds…';
        return this.beds.length ? 'Select a bed' : 'No available beds';
    }
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.watchPatientSearch();

        this.form.controls.hasInsurance.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(on => {
            const provider = this.form.controls.insuranceProvider;
            provider.setValidators(on ? [Validators.required, Validators.maxLength(120)] : [Validators.maxLength(120)]);
            provider.updateValueAndValidity();
        });

        this.form.controls.wardId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.form.controls.bedId.setValue(null);
            this.form.controls.expectedDischargeDate.setValue(null);
            this.loadBeds();
        });

        this.form.controls.bedId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(bedId => {
            if (!bedId) this.form.controls.expectedDischargeDate.setValue(null);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['isOpen']?.currentValue) return;

        this.today = isoDate(new Date());
        this.resetForm();
        this.loadLookups();
        if (!this.editing) setTimeout(() => this.patientInput?.nativeElement.focus(), 320);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.isOpen) this.requestClose();
    }
    // #endregion

    // #region Patient search
    onPatientKeydown(event: KeyboardEvent): void {
        const count = this.patientResults.length;
        if (!count) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.activePatient = (this.activePatient + 1) % count;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.activePatient = (this.activePatient - 1 + count) % count;
        } else if (event.key === 'Enter' && this.activePatient >= 0) {
            event.preventDefault();
            this.selectPatient(this.patientResults[this.activePatient]);
        }
    }

    selectPatient(p: Patient): void {
        this.form.controls.patient.setValue(p);
        this.form.markAsDirty();
        this.patientResults = [];
        this.activePatient = -1;
        setTimeout(() => this.host.querySelector<HTMLElement>('#adm-type')?.focus());
    }

    clearPatient(): void {
        this.form.controls.patient.setValue(null);
        this.patientQuery.setValue('');
        setTimeout(() => this.patientInput?.nativeElement.focus());
    }

    private watchPatientSearch(): void {
        this.patientQuery.valueChanges.pipe(
            map(v => v.trim()),
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => { this.patientNoMatch = false; this.patientSearchError = null; }),
            switchMap(term => {
                if (term.length < 2) {
                    this.patientSearching = false;
                    return of<Patient[]>([]);
                }
                this.patientSearching = true;
                return this.patientSrv.search({
                    pageNumber: 1,
                    pageSize: PATIENT_RESULTS,
                    search: term,
                    filter: { start: '', end: '', patientType: null, riskLevel: null, isVip: null, isChronicPatient: null },
                }).pipe(
                    map(res => {
                        const items = res?.success ? res.data?.items ?? [] : [];
                        this.patientNoMatch = items.length === 0;
                        return items;
                    }),
                    catchError((err: HttpErrorResponse) => {
                        this.patientSearchError = err?.status === 403 ? "You don't have access to patient records." : 'Patient search failed. Try again.';
                        return of<Patient[]>([]);
                    }),
                    finalize(() => this.patientSearching = false),
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(items => {
            this.patientResults = items;
            this.activePatient = items.length ? 0 : -1;
        });
    }
    // #endregion

    // #region Pick lists
    private loadLookups(): void {
        // Loaded on first open; a list that failed is retried the next time the drawer opens. Wards are
        // reloaded every time because their free-bed counts change.
        const retry = (l: Lookup<unknown>) => !this.lookupsRequested || !!l.error;
        this.lookupsRequested = true;

        if (retry(this.departments)) {
            this.fill('departments', this.departmentSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, filter: { start: '', end: '' } })
                .pipe(map(res => (res?.success ? res.data?.items ?? [] : []).filter(d => d.isActive))), l => this.departments = l);
        }
        if (retry(this.doctors)) {
            this.fill('doctors', this.doctorSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, filter: { start: '', end: '' } })
                .pipe(map(res => (res?.success ? res.data?.items ?? [] : []).slice().sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '')))), l => this.doctors = l);
        }
        if (!this.editing) {
            this.fill('wards', this.bedMapSrv.wards().pipe(map(res => res?.success ? res.data ?? [] : [])), l => this.wards = l);
        }
    }

    private fill<T>(what: string, source: Observable<T[]>, set: (lookup: Lookup<T>) => void): void {
        set({ items: [], loading: true, error: null });
        source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: items => set({ items, loading: false, error: null }),
            error: (err: HttpErrorResponse) => set({
                items: [],
                loading: false,
                error: err?.status === 403 ? `You don't have access to the list of ${what}.` : `Couldn't load ${what}. Close and reopen the form to retry.`,
            }),
        });
    }

    /** Only beds the bed map reports as available are offered; the server still decides on submit. */
    private loadBeds(): void {
        const wardId = this.form.controls.wardId.value;
        this.beds = [];
        this.bedsError = null;
        if (!wardId) return;

        this.bedsLoading = true;
        this.bedMapSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, sort: 'number', filter: { wardId, status: 'Available' } })
            .pipe(finalize(() => this.bedsLoading = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (this.form.controls.wardId.value !== wardId) return;
                    this.beds = res?.success ? res.data?.items ?? [] : [];
                },
                error: (err: HttpErrorResponse) => {
                    this.bedsError = err?.status === 403 ? "You don't have access to the list of beds." : "Couldn't load beds. Pick the ward again to retry.";
                },
            });
    }
    // #endregion

    // #region Methods
    showError(name: keyof AdmissionFormDrawerComponent['form']['controls']): boolean {
        const control = this.form.controls[name];
        return control.invalid && control.touched;
    }

    submit(): void {
        if (this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        const v = this.form.getRawValue();
        const text = (s: string) => s.trim() || null;
        const shared = {
            admissionType: v.admissionType!,
            departmentId: v.departmentId!,
            doctorId: v.doctorId!,
            referredBy: text(v.referredBy),
            chiefComplaint: v.chiefComplaint.trim(),
            provisionalDiagnosis: v.provisionalDiagnosis.trim(),
            allergies: text(v.allergies),
            currentMedications: text(v.currentMedications),
            medicalHistory: text(v.medicalHistory),
            hasInsurance: v.hasInsurance,
            insuranceProvider: v.hasInsurance ? text(v.insuranceProvider) : null,
            policyNumber: v.hasInsurance ? text(v.policyNumber) : null,
        };

        this.submitting = true;
        if (this.admission) {
            const id = this.admission.id;
            const request: UpdateAdmissionRequest = shared;
            this.admissionSrv.update(id, request)
                .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: res => res.success ? this.onSaved(id, 'edit') : undefined,
                    // The global HTTP error toast reports the failure; the form keeps what was typed.
                    error: () => undefined,
                });
            return;
        }

        const request: CreateAdmissionRequest = {
            ...shared,
            patientId: v.patient!.id,
            admittedAt: toLocalDateTime(v.admissionDate, v.admissionTime),
            bedId: v.bedId || null,
            expectedDischargeDate: v.bedId && v.expectedDischargeDate ? v.expectedDischargeDate : null,
        };
        this.admissionSrv.create(request)
            .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => res.success && res.data ? this.onSaved(res.data, 'create') : undefined,
                error: () => {
                    // A bed taken by someone else is the likely conflict: refresh the list so the form shows what is free now.
                    if (request.bedId) {
                        this.form.controls.bedId.setValue(null);
                        this.loadBeds();
                    }
                },
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
        this.close.emit();
    }

    trackById(_: number, item: { id: string }): string {
        return item.id;
    }

    private onSaved(id: string, mode: SavedAdmission['mode']): void {
        this.form.markAsPristine();
        this.saved.emit({ id, mode });
    }

    private resetForm(): void {
        this.patientQuery.setValue('', { emitEvent: false });
        this.patientResults = [];
        this.patientNoMatch = false;
        this.patientSearchError = null;
        this.beds = [];
        this.bedsError = null;

        const a = this.admission;
        this.form.reset({
            patient: null,
            admissionDate: this.today,
            admissionTime: isoTime(new Date()),
            admissionType: a?.admissionType ?? null,
            referredBy: a?.referredBy ?? '',
            departmentId: a?.departmentId ?? null,
            doctorId: a?.doctorId ?? null,
            wardId: null,
            bedId: null,
            expectedDischargeDate: null,
            chiefComplaint: a?.chiefComplaint ?? '',
            provisionalDiagnosis: a?.provisionalDiagnosis ?? '',
            allergies: a?.allergies ?? '',
            currentMedications: a?.currentMedications ?? '',
            medicalHistory: a?.medicalHistory ?? '',
            hasInsurance: a?.hasInsurance ?? false,
            insuranceProvider: a?.insuranceProvider ?? '',
            policyNumber: a?.policyNumber ?? '',
        });

        // The patient is chosen only when admitting; an edit keeps the admitted patient.
        const patient = this.form.controls.patient;
        if (this.editing) patient.disable({ emitEvent: false });
        else patient.enable({ emitEvent: false });
    }
    // #endregion
}
