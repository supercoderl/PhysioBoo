import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooIconComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { Observable, combineLatest, merge, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../../components/drawer/drawer.component';
import { AppointmentTypeService } from '../../../../../services/admin/appointment-type.service';
import { AppointmentService } from '../../../../../services/admin/appointment.service';
import { DepartmentService } from '../../../../../services/admin/department.service';
import { DoctorService } from '../../../../../services/admin/doctor.service';
import { HospitalService } from '../../../../../services/admin/hospital.service';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { BooDatepickerComponent } from '../../../../../components/date-picker/boo-date-picker.component';
import { BooTextareaComponent } from '../../../../../components/textarea/boo-textarea/boo-textarea.component';
import { PatientService } from '../../../../../services/admin/patient.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../../shared/directives/scrollbar.directive';
import { AppointmentRecord, CreateAppointmentRequest } from '../../../../../shared/types/appointment.types';
import { Doctor } from '../../../../../shared/types/medical-staff.types';
import { AppointmentType, Department } from '../../../../../shared/types/operation.types';
import { Patient } from '../../../../../shared/types/patient.types';
import { Hospital } from '../../../../../shared/types/support.types';
import { bookingStatus, endMinutes, fromMinutes, isoDate, shortTime, toMinutes } from './booking.utils';

/** A pick list loaded from the API once per page visit. `error` is set when the user can't read it or it failed. */
interface Lookup<T> {
    items: T[];
    loading: boolean;
    error: string | null;
}

/** What the page needs to confirm the new booking to the receptionist. */
export interface CreatedBooking {
    id: string;
    patientName: string;
    scheduledDate: string;
    scheduledTime: string;
}

const LOOKUP_SIZE = 200;
const PATIENT_RESULTS = 8;
// Statuses that no longer hold the doctor's time.
const FREED_STATUSES = new Set(['Cancelled', 'NoShow', 'Rescheduled']);

const FIELD = 'w-full h-10 px-3 rounded-lg border border-borderGray bg-surface text-sm text-regular placeholder:text-placeholder transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 disabled:bg-black/5 disabled:cursor-not-allowed aria-[invalid=true]:border-danger';
const AREA = 'w-full px-3 py-2 rounded-lg border border-borderGray bg-surface text-sm text-regular placeholder:text-placeholder resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 aria-[invalid=true]:border-danger';

function notInPast(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && control.value < isoDate(new Date()) ? { past: true } : null;
}

/**
 * New booking form (POST /api/appointments). Pick lists come from the patient, hospital, department,
 * appointment type and doctor APIs; once a doctor and date are chosen it lists that doctor's existing bookings
 * for the day and warns about overlaps (the server does not block them).
 */
@Component({
    selector: 'booking-form-drawer',
    standalone: true,
    imports: [NgIf, NgFor, ReactiveFormsModule, RouterLink, DrawerComponent, BooButtonComponent, BooIconComponent, BooInputComponent, BooStatusBadgeComponent, BooSelectComponent, BooDatepickerComponent, BooTextareaComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" (close)="discard()">
            <form
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-form-title"
                [attr.inert]="isOpen ? null : ''"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="booking-form-title" class="m-0 text-lg font-semibold leading-tight text-regular">New booking</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close new booking" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- 1. Patient -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-primarySoft text-primaryDeep text-[11px] flex items-center justify-center" aria-hidden="true">1</span>Patient
                        </legend>

                        <div *ngIf="form.controls.patient.value as p; else patientSearchTpl" class="flex items-center gap-3 p-3 rounded-lg border border-borderGray bg-body">
                            <span class="flex-none w-9 h-9 rounded-full bg-primarySoft text-primaryDeep flex items-center justify-center" aria-hidden="true">
                                <physio-icon name="user-round" [size]="17" />
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="m-0 text-sm font-semibold text-regular truncate">{{ p.fullName || 'Unnamed patient' }}</p>
                                <p class="m-0 text-xs text-secondary tabular-nums truncate">{{ p.patientNumber }}<ng-container *ngIf="p.phone"> · {{ p.phone }}</ng-container></p>
                            </div>
                            <button type="button" boo-button variant="secondary" size="sm" (click)="clearPatient()">Change</button>
                        </div>

                        <ng-template #patientSearchTpl>
                            <label for="bf-patient" class="block mb-1 text-[13px] font-medium text-regular">Find patient <span class="text-danger" aria-hidden="true">*</span></label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-3 flex items-center text-placeholder pointer-events-none" aria-hidden="true">
                                    <physio-icon [name]="patientSearching ? 'loader-circle' : 'search'" [size]="16" [class.animate-spin]="patientSearching" />
                                </span>
                                <input
                                    #patientInput
                                    id="bf-patient"
                                    type="search"
                                    role="combobox"
                                    autocomplete="off"
                                    aria-autocomplete="list"
                                    aria-controls="bf-patient-results"
                                    [attr.aria-expanded]="patientResults.length > 0"
                                    [attr.aria-activedescendant]="activePatient >= 0 ? 'bf-patient-opt-' + activePatient : null"
                                    [attr.aria-invalid]="showError('patient') ? true : null"
                                    aria-describedby="bf-patient-hint"
                                    [formControl]="patientQuery"
                                    placeholder="Name, patient number or phone"
                                    maxlength="100"
                                    [class]="field + ' pl-9'"
                                    (keydown)="onPatientKeydown($event)"
                                />
                            </div>
                            <ul
                                *ngIf="patientResults.length"
                                id="bf-patient-results"
                                role="listbox"
                                aria-label="Matching patients"
                                class="m-0 mt-1 p-1 list-none rounded-lg border border-borderGray bg-surface shadow-sm max-h-64 overflow-y-auto"
                            >
                                <li
                                    *ngFor="let p of patientResults; let i = index; trackBy: trackById"
                                    [id]="'bf-patient-opt-' + i"
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
                            <p id="bf-patient-hint" class="m-0 mt-1 text-xs" [class.text-danger]="showError('patient') || patientSearchError" [class.text-secondary]="!showError('patient') && !patientSearchError" aria-live="polite">
                                <ng-container *ngIf="patientSearchError; else hintTpl">{{ patientSearchError }}</ng-container>
                                <ng-template #hintTpl>
                                    <ng-container *ngIf="patientNoMatch; else defaultHint">No patients match “{{ patientQuery.value }}”.</ng-container>
                                    <ng-template #defaultHint>{{ showError('patient') ? 'Search for and select a patient.' : 'Type at least 2 characters to search.' }}</ng-template>
                                </ng-template>
                                <a *ngIf="registerLink" [routerLink]="registerLink" class="ml-1 font-semibold text-primaryDeep hover:text-primary">Register a new patient</a>
                            </p>
                        </ng-template>
                    </fieldset>

                    <!-- 2. Visit -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-primarySoft text-primaryDeep text-[11px] flex items-center justify-center" aria-hidden="true">2</span>Visit
                        </legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="min-w-0">
                                <label for="bf-hospital" class="block mb-1 text-[13px] font-medium text-regular">Facility <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="bf-hospital" formControlName="hospitalId" label="Facility" required [options]="hospitals.items" bindLabel="name" bindValue="id" />
                                <p id="bf-hospital-msg" *ngIf="hospitals.error" class="m-0 mt-1 text-xs text-danger">{{ hospitals.error }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="bf-department" class="block mb-1 text-[13px] font-medium text-regular">Department <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="bf-department" formControlName="departmentId" label="Department" required [options]="hospitalDepartments" bindLabel="name" bindValue="id" />
                                <p id="bf-department-msg" *ngIf="departments.error || departments.loading || !form.controls.hospitalId.value || !hospitalDepartments.length" class="m-0 mt-1 text-xs" [class.text-danger]="departments.error" [class.text-secondary]="!departments.error">{{ departments.error || departmentPlaceholder }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="bf-type" class="block mb-1 text-[13px] font-medium text-regular">Appointment type <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="bf-type" formControlName="appointmentTypeId" label="Appointment type" required [options]="typeOptions" bindLabel="name" bindValue="id" />
                                <p id="bf-type-msg" *ngIf="types.error" class="m-0 mt-1 text-xs text-danger">{{ types.error }}</p>
                                <p *ngIf="selectedType?.requiresPreparation && selectedType?.preparationInstructions" class="m-0 mt-1 text-xs text-secondary">
                                    <span class="font-semibold text-regular">Preparation:</span> {{ selectedType?.preparationInstructions }}
                                </p>
                            </div>
                            <div class="min-w-0">
                                <label for="bf-doctor" class="block mb-1 text-[13px] font-medium text-regular">Doctor <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="bf-doctor" formControlName="doctorId" label="Doctor" required [options]="doctors.items" bindLabel="fullName" bindValue="id" />
                                <p id="bf-doctor-msg" *ngIf="doctors.error" class="m-0 mt-1 text-xs text-danger">{{ doctors.error }}</p>
                            </div>
                        </div>
                    </fieldset>

                    <!-- 3. Schedule -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-primarySoft text-primaryDeep text-[11px] flex items-center justify-center" aria-hidden="true">3</span>Date and time
                        </legend>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="min-w-0">
                                <label for="bf-date" class="block mb-1 text-[13px] font-medium text-regular">Date <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-datepicker id="bf-date" formControlName="scheduledDate" label="Date" required [min]="today" />
                                <p id="bf-date-msg" *ngIf="showError('scheduledDate')" class="m-0 mt-1 text-xs text-danger">{{ form.controls.scheduledDate.hasError('past') ? 'Pick today or a later date.' : 'Pick a date.' }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="bf-time" class="block mb-1 text-[13px] font-medium text-regular">Start time <span class="text-danger" aria-hidden="true">*</span></label>
                                <input id="bf-time" type="time" step="300" formControlName="scheduledTime" [class]="field" [attr.aria-invalid]="showError('scheduledTime') || endsPastMidnight ? true : null" aria-describedby="bf-time-msg" />
                                <p id="bf-time-msg" *ngIf="showError('scheduledTime') || endsPastMidnight" class="m-0 mt-1 text-xs text-danger">{{ endsPastMidnight ? 'The visit must end before midnight.' : 'Pick a start time.' }}</p>
                            </div>
                            <div class="min-w-0">
                                <label for="bf-duration" class="block mb-1 text-[13px] font-medium text-regular">Duration (min) <span class="text-danger" aria-hidden="true">*</span></label>
                                <input id="bf-duration" type="number" inputmode="numeric" min="5" max="480" step="5" formControlName="durationMinutes" [class]="field" [attr.aria-invalid]="showError('durationMinutes') ? true : null" aria-describedby="bf-duration-msg" />
                                <p id="bf-duration-msg" class="m-0 mt-1 text-xs" [class.text-danger]="showError('durationMinutes')" [class.text-secondary]="!showError('durationMinutes')">
                                    {{ showError('durationMinutes') ? 'Enter 5 to 480 minutes.' : (endTimeLabel ? 'Ends at ' + endTimeLabel : '') }}
                                </p>
                            </div>
                        </div>

                        <!-- The chosen doctor's existing bookings that day -->
                        <div *ngIf="form.controls.doctorId.value && form.controls.scheduledDate.value" class="mt-4 rounded-lg border border-borderGray" aria-live="polite">
                            <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-rowDivider">
                                <p class="m-0 text-xs font-semibold text-regular">Doctor's bookings that day</p>
                                <span *ngIf="dayLoading" class="text-xs text-secondary">Loading…</span>
                            </div>
                            <p *ngIf="dayError" class="m-0 px-3 py-2.5 text-xs text-danger">{{ dayError }}</p>
                            <p *ngIf="!dayLoading && !dayError && !dayBookings.length" class="m-0 px-3 py-2.5 text-xs text-secondary">No other bookings for this doctor on this date.</p>
                            <ul *ngIf="!dayError && dayBookings.length" class="m-0 p-0 list-none max-h-40 overflow-y-auto divide-y divide-rowDivider">
                                <li *ngFor="let b of dayBookings; trackBy: trackById" class="flex items-center gap-3 px-3 py-2 text-xs" [class.bg-rose-50]="overlaps(b)">
                                    <span class="w-24 flex-none font-semibold text-regular tabular-nums">{{ range(b) }}</span>
                                    <span class="flex-1 min-w-0 truncate text-secondary">{{ b.patientName || 'Unnamed patient' }}</span>
                                    <boo-status-badge [label]="status(b.status).label" [tone]="status(b.status).tone" />
                                </li>
                            </ul>
                            <p *ngIf="conflicts.length" class="m-0 px-3 py-2 border-t border-rowDivider text-xs text-amber-700 flex items-start gap-1.5" role="status">
                                <physio-icon name="triangle-alert" [size]="14" class="mt-px flex-none" />
                                This time overlaps {{ conflicts.length }} existing {{ conflicts.length === 1 ? 'booking' : 'bookings' }} for the doctor. Check before saving.
                            </p>
                        </div>
                    </fieldset>

                    <!-- 4. Notes -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-2 text-sm font-semibold text-regular flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-primarySoft text-primaryDeep text-[11px] flex items-center justify-center" aria-hidden="true">4</span>Visit details <span class="font-normal text-secondary">(optional)</span>
                        </legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="bf-complaint" class="block mb-1 text-[13px] font-medium text-regular">Chief complaint</label>
                                <boo-input name="bf-complaint" formControlName="chiefComplaint" [maxlength]="500" label="e.g. Lower back pain for two weeks" />
                            </div>
                            <div>
                                <label for="bf-reason" class="block mb-1 text-[13px] font-medium text-regular">Reason for visit</label>
                                <boo-textarea id="bf-reason" formControlName="reasonForVisit" label="Reason for visit" [rows]="2" [maxlength]="1000" />
                            </div>
                            <div>
                                <label for="bf-notes" class="block mb-1 text-[13px] font-medium text-regular">Notes for the care team</label>
                                <boo-textarea id="bf-notes" formControlName="preAppointmentNotes" label="Visible to staff only" [rows]="2" [maxlength]="1000" />
                            </div>
                        </div>
                    </fieldset>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting">
                        <physio-icon *ngIf="!submitting" name="calendar-plus" [size]="15" aria-hidden="true" />Create booking
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class BookingFormDrawerComponent implements OnInit, OnChanges {
    @Input() isOpen = false;
    /** Route to patient registration, when the user may register patients. */
    @Input() registerLink: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() created = new EventEmitter<CreatedBooking>();

    @ViewChild('patientInput') private patientInput?: ElementRef<HTMLInputElement>;

    private readonly fb = inject(FormBuilder);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly patientSrv = inject(PatientService);
    private readonly hospitalSrv = inject(HospitalService);
    private readonly departmentSrv = inject(DepartmentService);
    private readonly typeSrv = inject(AppointmentTypeService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly dialogSrv = inject(DialogService);

    readonly field = FIELD;
    readonly area = AREA;
    readonly status = bookingStatus;
    today = isoDate(new Date());

    readonly form = this.fb.group({
        patient: this.fb.control<Patient | null>(null, Validators.required),
        hospitalId: this.fb.nonNullable.control('', Validators.required),
        departmentId: this.fb.nonNullable.control('', Validators.required),
        appointmentTypeId: this.fb.nonNullable.control('', Validators.required),
        doctorId: this.fb.nonNullable.control('', Validators.required),
        scheduledDate: this.fb.nonNullable.control(this.today, [Validators.required, notInPast]),
        scheduledTime: this.fb.nonNullable.control('', Validators.required),
        durationMinutes: this.fb.control<number | null>(null, [Validators.required, Validators.min(5), Validators.max(480)]),
        chiefComplaint: this.fb.nonNullable.control('', Validators.maxLength(500)),
        reasonForVisit: this.fb.nonNullable.control('', Validators.maxLength(1000)),
        preAppointmentNotes: this.fb.nonNullable.control('', Validators.maxLength(1000)),
    });

    readonly patientQuery = this.fb.nonNullable.control('');
    patientResults: Patient[] = [];
    patientSearching = false;
    patientNoMatch = false;
    patientSearchError: string | null = null;
    activePatient = -1;

    hospitals: Lookup<Hospital> = { items: [], loading: false, error: null };
    departments: Lookup<Department> = { items: [], loading: false, error: null };
    types: Lookup<AppointmentType> = { items: [], loading: false, error: null };
    doctors: Lookup<Doctor> = { items: [], loading: false, error: null };
    hospitalDepartments: Department[] = [];

    dayBookings: AppointmentRecord[] = [];
    dayLoading = false;
    dayError: string | null = null;
    conflicts: AppointmentRecord[] = [];

    submitting = false;
    private lookupsRequested = false;

    get selectedType(): AppointmentType | undefined {
        return this.types.items.find(t => t.id === this.form.controls.appointmentTypeId.value);
    }

    /** Appointment types as select options, with the default duration in the label. */
    get typeOptions(): { id: string; name: string }[] {
        return this.types.items.map(t => ({ id: t.id, name: t.defaultDuration ? `${t.name} · ${t.defaultDuration} min` : t.name }));
    }

    get departmentPlaceholder(): string {
        if (this.departments.loading) return 'Loading…';
        if (!this.form.controls.hospitalId.value) return 'Select a facility first';
        return this.hospitalDepartments.length ? 'Select a department' : 'No departments at this facility';
    }

    /** Proposed visit as [start, end) minutes, when both are known. */
    private get proposed(): [number, number] | null {
        const start = toMinutes(this.form.controls.scheduledTime.value);
        const duration = this.form.controls.durationMinutes.value;
        return start !== null && duration ? [start, start + duration] : null;
    }

    get endsPastMidnight(): boolean {
        const p = this.proposed;
        return !!p && p[1] > 24 * 60;
    }

    get endTimeLabel(): string {
        const p = this.proposed;
        return p ? shortTime(fromMinutes(p[1])) : '';
    }

    ngOnInit(): void {
        this.watchPatientSearch();
        this.watchVisitFields();
        this.watchDoctorDay();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']?.currentValue) {
            this.today = isoDate(new Date());
            this.loadLookups();
            setTimeout(() => this.patientInput?.nativeElement.focus(), 320);
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.isOpen) this.requestClose();
    }

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
        setTimeout(() => this.host.querySelector<HTMLElement>('#bf-hospital')?.focus());
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
                        this.patientSearchError = err?.status === 403 ? "You don't have access to patient records." : "Patient search failed. Try again.";
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
        // Loaded once per page visit; a list that failed is retried the next time the drawer opens.
        const need = (l: Lookup<unknown>) => !l.loading && (!this.lookupsRequested || !!l.error);
        const first = !this.lookupsRequested;
        this.lookupsRequested = true;

        if (first || need(this.hospitals)) {
            this.fill('facilities', this.hospitalSrv.lookup(LOOKUP_SIZE), l => this.hospitals = l, items => {
                if (items.length === 1 && !this.form.controls.hospitalId.value) this.form.controls.hospitalId.setValue(items[0].id);
            });
        }
        if (first || need(this.departments)) {
            this.fill(
                'departments',
                this.departmentSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, filter: { start: '', end: '' } })
                    .pipe(map(res => (res?.success ? res.data?.items ?? [] : []).filter(d => d.isActive))),
                l => this.departments = l,
                () => this.refreshDepartments(),
            );
        }
        if (first || need(this.types)) {
            this.fill(
                'appointment types',
                this.typeSrv.search({
                    pageNumber: 1,
                    pageSize: LOOKUP_SIZE,
                    filter: { start: '', end: '', isEmergency: null, requiresPreparation: null, isFollowUp: null, isActive: true },
                }).pipe(map(res => res?.success ? res.data?.items ?? [] : [])),
                l => this.types = l,
            );
        }
        if (first || need(this.doctors)) {
            this.fill(
                'doctors',
                this.doctorSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, filter: { start: '', end: '' } })
                    .pipe(map(res => (res?.success ? res.data?.items ?? [] : []).slice().sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '')))),
                l => this.doctors = l,
            );
        }
    }

    private fill<T>(what: string, source: Observable<T[]>, set: (lookup: Lookup<T>) => void, after?: (items: T[]) => void): void {
        set({ items: [], loading: true, error: null });
        source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: items => {
                set({ items, loading: false, error: null });
                after?.(items);
            },
            error: (err: HttpErrorResponse) => set({
                items: [],
                loading: false,
                error: err?.status === 403 ? `You don't have access to the list of ${what}.` : `Couldn't load ${what}. Close and reopen the form to retry.`,
            }),
        });
    }

    private watchVisitFields(): void {
        this.form.controls.hospitalId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshDepartments());

        // A new type proposes its default length unless the receptionist already typed one.
        this.form.controls.appointmentTypeId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(id => {
            const type = this.types.items.find(t => t.id === id);
            const duration = this.form.controls.durationMinutes;
            if (type?.defaultDuration && !duration.dirty) duration.setValue(type.defaultDuration);
        });
    }

    private refreshDepartments(): void {
        const hospitalId = this.form.controls.hospitalId.value;
        this.hospitalDepartments = hospitalId ? this.departments.items.filter(d => d.hospitalId === hospitalId) : [];
        const dept = this.form.controls.departmentId;
        if (dept.value && !this.hospitalDepartments.some(d => d.id === dept.value)) dept.setValue('');
        if (this.hospitalDepartments.length === 1 && !dept.value) dept.setValue(this.hospitalDepartments[0].id);
    }
    // #endregion

    // #region Doctor's day
    private watchDoctorDay(): void {
        const c = this.form.controls;
        combineLatest([
            c.doctorId.valueChanges.pipe(startWith(c.doctorId.value)),
            c.scheduledDate.valueChanges.pipe(startWith(c.scheduledDate.value)),
        ]).pipe(
            debounceTime(150),
            distinctUntilChanged(([a1, b1], [a2, b2]) => a1 === a2 && b1 === b2),
            switchMap(([doctorId, date]) => {
                this.dayError = null;
                if (!doctorId || !date) {
                    this.dayLoading = false;
                    return of<AppointmentRecord[]>([]);
                }
                this.dayLoading = true;
                return this.appointmentSrv.doctorDaily(doctorId, date).pipe(
                    map(res => res?.success ? res.data ?? [] : []),
                    catchError((err: HttpErrorResponse) => {
                        this.dayError = err?.status === 403 ? "You don't have access to this doctor's schedule." : "Couldn't load the doctor's bookings for this date.";
                        return of<AppointmentRecord[]>([]);
                    }),
                    finalize(() => this.dayLoading = false),
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(items => {
            this.dayBookings = items
                .filter(a => !FREED_STATUSES.has(a.status))
                .sort((a, b) => (toMinutes(a.scheduledTime) ?? 0) - (toMinutes(b.scheduledTime) ?? 0));
            this.updateConflicts();
        });

        merge(c.scheduledTime.valueChanges, c.durationMinutes.valueChanges)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updateConflicts());
    }

    overlaps(b: AppointmentRecord): boolean {
        return this.conflicts.includes(b);
    }

    range(b: AppointmentRecord): string {
        const end = endMinutes(b);
        return end !== null ? `${shortTime(b.scheduledTime)}–${shortTime(fromMinutes(end))}` : shortTime(b.scheduledTime);
    }

    private updateConflicts(): void {
        const p = this.proposed;
        this.conflicts = !p ? [] : this.dayBookings.filter(b => {
            const start = toMinutes(b.scheduledTime);
            if (start === null) return false;
            const end = endMinutes(b) ?? start + 1;
            return start < p[1] && p[0] < end;
        });
    }
    // #endregion

    // #region Submit and close
    showError(name: keyof BookingFormDrawerComponent['form']['controls']): boolean {
        const control = this.form.controls[name];
        return control.invalid && control.touched;
    }

    submit(): void {
        if (this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid || this.endsPastMidnight) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        const v = this.form.getRawValue();
        const patient = v.patient!;
        const start = `${v.scheduledTime.slice(0, 5)}:00`;
        const p = this.proposed!;
        const request: CreateAppointmentRequest = {
            patientId: patient.id,
            doctorId: v.doctorId,
            hospitalId: v.hospitalId,
            departmentId: v.departmentId,
            appointmentTypeId: v.appointmentTypeId,
            scheduledDate: v.scheduledDate,
            scheduledTime: start,
            scheduledEndTime: fromMinutes(p[1]),
            durationMinutes: v.durationMinutes!,
            chiefComplaint: v.chiefComplaint.trim() || null,
            reasonForVisit: v.reasonForVisit.trim() || null,
            preAppointmentNotes: v.preAppointmentNotes.trim() || null,
        };

        this.submitting = true;
        // Failures are reported by the global HTTP error toast; the form keeps what was entered.
        this.appointmentSrv.create(request)
            .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success) return;
                    this.created.emit({ id: res.data, patientName: patient.fullName, scheduledDate: v.scheduledDate, scheduledTime: start });
                    this.resetForm();
                },
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
        this.resetForm();
        this.close.emit();
    }

    private resetForm(): void {
        const hospitalId = this.hospitals.items.length === 1 ? this.hospitals.items[0].id : '';
        this.form.reset({ scheduledDate: isoDate(new Date()), hospitalId });
        this.patientQuery.setValue('');
        this.patientResults = [];
        this.patientNoMatch = false;
        this.conflicts = [];
        this.refreshDepartments();
    }
    // #endregion

    trackById(_: number, item: { id: string }): string {
        return item.id;
    }
}
