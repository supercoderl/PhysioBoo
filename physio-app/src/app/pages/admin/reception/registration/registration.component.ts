import { DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooIconComponent, BooInlineErrorComponent, BooInputComponent, BooSearchFieldComponent } from '@physioboo/ui';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { AdminBreadcrumbComponent } from '../../../../components/breadcrumb/admin-breadcrumb.component';
import { DoctorService } from '../../../../services/admin/doctor.service';
import { PatientService } from '../../../../services/admin/patient.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SKIP_ERROR_TOAST } from '../../../../shared/contexts/option.context';
import { BloodGroup } from '../../../../shared/enums/blood-group';
import { Gender } from '../../../../shared/enums/gender';
import { MaritalStatus } from '../../../../shared/enums/marital-status';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { Patient, RegisterPatientRequest } from '../../../../shared/types/patient.types';

const FIELD = 'w-full h-10 px-3 rounded-lg border border-borderGray bg-surface text-sm text-regular placeholder:text-placeholder transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 disabled:bg-black/5 disabled:cursor-not-allowed aria-[invalid=true]:border-danger';
const AREA = 'w-full px-3 py-2 rounded-lg border border-borderGray bg-surface text-sm text-regular placeholder:text-placeholder resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 aria-[invalid=true]:border-danger';

const DOCTOR_LOOKUP_SIZE = 200;
const MATCH_RESULTS = 6;
const MIN_QUERY = 2;
const MIN_DOB = '1900-01-01';

/** Same pattern the server applies to phone numbers (CreatePatientCommandValidation). */
const PHONE_PATTERN = /^\+?[0-9][0-9\s\-().]{5,19}$/;

const GENDERS = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' },
    { value: Gender.Other, label: 'Other' },
    { value: Gender.PreferNotToSay, label: 'Prefer not to say' },
];

const BLOOD_GROUPS = [
    { value: BloodGroup.A_Positive, label: 'A+' },
    { value: BloodGroup.A_Negative, label: 'A−' },
    { value: BloodGroup.B_Positive, label: 'B+' },
    { value: BloodGroup.B_Negative, label: 'B−' },
    { value: BloodGroup.AB_Positive, label: 'AB+' },
    { value: BloodGroup.AB_Negative, label: 'AB−' },
    { value: BloodGroup.O_Positive, label: 'O+' },
    { value: BloodGroup.O_Negative, label: 'O−' },
];

const MARITAL_STATUSES = [
    { value: MaritalStatus.Single, label: 'Single' },
    { value: MaritalStatus.Married, label: 'Married' },
    { value: MaritalStatus.Divorced, label: 'Divorced' },
    { value: MaritalStatus.Widowed, label: 'Widowed' },
];

type MatchKind = 'search' | 'submit';

interface Registered {
    id: string;
    name: string;
    patientNumber: string | null;
}

function validDob(control: AbstractControl<string>): ValidationErrors | null {
    const v = control.value;
    if (!v) return null;
    if (v < MIN_DOB || v > new Date().toISOString().slice(0, 10)) return { dobRange: true };
    return null;
}

/**
 * Reception patient registration (POST /api/patients). The page first lets staff look for an existing patient
 * (POST /api/patients/search). The server has no duplicate rule of its own, so on submit the page searches the
 * entered phone number and, when someone matches, asks staff to confirm before creating another record.
 * Failures are reported by the global HTTP error toast and the form keeps what was entered.
 */
@Component({
    selector: 'admin-registration',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgTemplateOutlet,
        DatePipe,
        ReactiveFormsModule,
        RouterLink,
        AdminBreadcrumbComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInlineErrorComponent,
        BooInputComponent,
        BooSearchFieldComponent,
        BooSelectComponent,
        BooDatepickerComponent,
        BooTextareaComponent,
    ],
    templateUrl: './registration.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminRegistrationComponent implements OnInit {
    // #region Inject Services
    private readonly fb = inject(FormBuilder);
    private readonly patientSrv = inject(PatientService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly field = FIELD;
    readonly area = AREA;
    readonly genders = GENDERS;
    readonly bloodGroups = BLOOD_GROUPS;
    readonly maritalStatuses = MARITAL_STATUSES;
    readonly minDob = MIN_DOB;
    readonly today = new Date().toISOString().slice(0, 10);

    readonly form = this.fb.nonNullable.group({
        firstName: ['', [Validators.required, Validators.maxLength(100)]],
        lastName: ['', [Validators.required, Validators.maxLength(100)]],
        dateOfBirth: ['', [Validators.required, validDob]],
        gender: this.fb.control<Gender | null>(null, Validators.required),
        bloodGroup: this.fb.control<BloodGroup | null>(null, Validators.required),
        maritalStatus: this.fb.control<MaritalStatus | null>(null, Validators.required),
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        phone: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(PHONE_PATTERN)]],
        emergencyContactName: ['', Validators.maxLength(255)],
        emergencyContactPhone: ['', [Validators.maxLength(20), Validators.pattern(PHONE_PATTERN)]],
        primaryDoctorId: ['', Validators.required],
        occupation: ['', Validators.maxLength(255)],
        insuranceProvider: ['', Validators.maxLength(255)],
        insurancePolicyNumber: ['', Validators.maxLength(100)],
        insuranceExpiryDate: [''],
        insuranceCoverageAmount: ['', Validators.min(0)],
        allergyInformation: [''],
        medicalHistory: [''],
        familyHistory: [''],
        surgicalHistory: [''],
        currentMedications: [''],
        lifestyleNotes: [''],
    });

    // Existing-patient lookup (top of the page)
    readonly searchQuery = this.fb.nonNullable.control('');
    searchResults: Patient[] = [];
    searching = false;
    searchedTerm = '';
    searchError: string | null = null;

    // Possible duplicates found when submitting; the next submit is the staff's confirmation.
    matches: Patient[] = [];
    matchesConfirmed = false;

    doctors: Doctor[] = [];
    doctorsLoading = false;
    doctorsError: string | null = null;

    submitting = false;
    registered: Registered | null = null;

    canReadPatients = false;
    canBook = false;

    private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => {
                this.canReadPatients = (perms ?? []).includes(Permissions.Reception.PatientRead);
                this.canBook = (perms ?? []).includes(Permissions.Reception.BookingRead);
            });

        this.watchSearch();
        this.loadDoctors();

        // An edit to the phone number invalidates a confirmation given for the previous one.
        this.form.controls.phone.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.clearMatches());
    }
    // #endregion

    // #region Getters
    get selectedDoctorName(): string {
        return this.doctors.find(d => d.id === this.form.controls.primaryDoctorId.value)?.fullName ?? '';
    }

    get noDoctors(): boolean {
        return !this.doctorsLoading && !this.doctorsError && this.doctors.length === 0;
    }

    get searchHint(): string {
        const q = this.searchQuery.value.trim();
        if (q.length < MIN_QUERY) return `Type at least ${MIN_QUERY} characters to search.`;
        return '';
    }

    get searchedNothing(): boolean {
        return !this.searching && !this.searchError && !!this.searchedTerm && this.searchResults.length === 0;
    }

    age(): number | null {
        const dob = this.form.controls.dateOfBirth.value;
        if (!dob || this.form.controls.dateOfBirth.invalid) return null;
        const d = new Date(dob);
        const now = new Date();
        let age = now.getFullYear() - d.getFullYear();
        if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
        return age >= 0 ? age : null;
    }
    // #endregion

    // #region Validation state
    showError(name: keyof AdminRegistrationComponent['form']['controls']): boolean {
        const c = this.form.controls[name];
        return c.invalid && (c.touched || c.dirty);
    }
    // #endregion

    // #region Existing patient lookup
    private watchSearch(): void {
        this.searchQuery.valueChanges.pipe(
            map(v => v.trim()),
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchError = null),
            // switchMap drops the response of a term the user has already typed past.
            switchMap(term => {
                if (term.length < MIN_QUERY) {
                    this.searching = false;
                    this.searchedTerm = '';
                    return of<Patient[]>([]);
                }
                this.searching = true;
                return this.findPatients(term, 'search').pipe(
                    tap(() => this.searchedTerm = term),
                    finalize(() => this.searching = false),
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(items => this.searchResults = items);
    }

    private findPatients(term: string, kind: MatchKind) {
        return this.patientSrv.search({
            pageNumber: 1,
            pageSize: MATCH_RESULTS,
            search: term,
            filter: { start: '', end: '', patientType: null, riskLevel: null, isVip: null, isChronicPatient: null },
        }).pipe(
            map(res => res?.success ? res.data?.items ?? [] : []),
            catchError((err: HttpErrorResponse) => {
                if (kind === 'search') {
                    this.searchError = err?.status === 403 ? "You don't have access to patient records." : 'Patient search failed. Try again.';
                }
                return of<Patient[]>([]);
            }),
        );
    }

    clearSearch(): void {
        this.searchQuery.setValue('');
    }

    retrySearch(): void {
        const q = this.searchQuery.value;
        this.searchQuery.setValue('');
        this.searchQuery.setValue(q);
    }
    // #endregion

    // #region Lookups
    loadDoctors(): void {
        this.doctorsLoading = true;
        this.doctorsError = null;
        this.doctorSrv.search({ pageNumber: 1, pageSize: DOCTOR_LOOKUP_SIZE, filter: { start: '', end: '' } })
            .pipe(finalize(() => this.doctorsLoading = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success) {
                        this.doctorsError = "Couldn't load doctors.";
                        return;
                    }
                    this.doctors = (res.data?.items ?? []).slice().sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
                },
                error: (err: HttpErrorResponse) => this.doctorsError = err?.status === 403 ? "You don't have access to the doctor list." : "Couldn't load doctors.",
            });
    }
    // #endregion

    // #region Submit
    submit(): void {
        if (this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        if (this.matchesConfirmed) {
            this.create();
            return;
        }

        // Look for someone already registered with this phone number before creating another record.
        this.submitting = true;
        this.findPatients(this.form.controls.phone.value.trim(), 'submit')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(found => {
                if (found.length) {
                    this.matches = found;
                    this.matchesConfirmed = true;
                    this.submitting = false;
                    setTimeout(() => this.host.querySelector<HTMLElement>('#reg-matches')?.focus());
                    return;
                }
                this.create();
            });
    }

    private create(): void {
        const request = this.buildRequest();
        this.submitting = true;
        this.patientSrv.create(request)
            .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success || !res.data) return;
                    const name = `${request.profile.firstName} ${request.profile.lastName}`;
                    this.registered = { id: res.data, name, patientNumber: null };
                    this.toastSrv.success(`${name} is registered.`);
                    this.loadPatientNumber(res.data);
                    setTimeout(() => this.host.querySelector<HTMLElement>('#reg-done')?.focus());
                },
                // The global HTTP error toast reports the failure; the form keeps what was entered.
                error: () => undefined,
            });
    }

    /** The create response only returns the new id, so read the generated patient number back. */
    private loadPatientNumber(id: string): void {
        this.patientSrv.search_by_id(id, this.silent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (this.registered?.id === id) this.registered = { ...this.registered, patientNumber: res?.data?.patientNumber ?? null };
                },
                error: () => undefined,
            });
    }

    private buildRequest(): RegisterPatientRequest {
        const v = this.form.getRawValue();
        return {
            profile: {
                firstName: v.firstName.trim(),
                lastName: v.lastName.trim(),
                dateOfBirth: v.dateOfBirth,
                gender: v.gender!,
                bloodGroup: v.bloodGroup!,
                maritalStatus: v.maritalStatus!,
                email: v.email.trim(),
                phone: v.phone.trim(),
                emergencyContactName: this.text(v.emergencyContactName),
                emergencyContactPhone: this.text(v.emergencyContactPhone),
                // The server accepts these but does not store them yet, so the form does not collect them.
                address: null,
                city: null,
                postalCode: null,
            },
            primaryDoctorId: v.primaryDoctorId,
            referredBy: null,
            referralHospitalId: null,
            inssuranceProvider: this.text(v.insuranceProvider),
            inssurancePolicyNumber: this.text(v.insurancePolicyNumber),
            inssuranceExpiryDate: v.insuranceExpiryDate || null,
            inssuranceCoverageAmount: v.insuranceCoverageAmount === '' || v.insuranceCoverageAmount == null ? null : Number(v.insuranceCoverageAmount),
            medicalHistory: this.text(v.medicalHistory),
            familyHistory: this.text(v.familyHistory),
            surgicalHistory: this.text(v.surgicalHistory),
            allergyInformation: this.text(v.allergyInformation),
            currentMedications: this.text(v.currentMedications),
            lifestyleNotes: this.text(v.lifestyleNotes),
            occupation: this.text(v.occupation),
            annualIncomeRange: null,
            preferredHospitalId: null,
            preferredDoctorId: null,
            preferredAppointmentTime: null,
            communicationPreferences: null,
        };
    }

    private text(s: string): string | null {
        return s.trim() || null;
    }

    clearMatches(): void {
        this.matches = [];
        this.matchesConfirmed = false;
    }
    // #endregion

    // #region Actions
    registerAnother(): void {
        this.registered = null;
        this.clearMatches();
        this.form.reset();
        this.searchQuery.setValue('');
        setTimeout(() => this.host.querySelector<HTMLElement>('#reg-first-name')?.focus());
    }

    trackById(_: number, item: { id: string }): string {
        return item.id;
    }
    // #endregion
}
