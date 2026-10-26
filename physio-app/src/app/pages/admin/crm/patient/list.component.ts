import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooFilterChip,
    BooFilterChipsComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooPaginationComponent,
    BooSearchFieldComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { DoctorService } from '../../../../services/admin/doctor.service';
import { HospitalService } from '../../../../services/admin/hospital.service';
import { PatientService } from '../../../../services/admin/patient.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { PaginationData } from '../../../../shared/types/common';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { Patient } from '../../../../shared/types/patient.types';
import { Hospital } from '../../../../shared/types/support.types';
import { CrmPatientDetailDrawerComponent } from './patient-detail-drawer.component';
import { CrmPatientEditDrawerComponent } from './patient-edit-drawer.component';
import { ageOf, cleanSearch, displayName, flagsOf, genderOf, initials, isoDate, parseIsoDate, patientTypeOf, riskOf } from './patient.utils';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'range';
}

const PAGE_SIZE = 20;
const LOOKUP_SIZE = 200;

/**
 * CRM patient directory (POST /api/patients/search). The server searches the patient number only, filters by the
 * date a record was created (both dates required) and sorts by creation date or patient number, so those are the
 * only controls offered. New patients are registered at reception, which collects the personal profile the create
 * endpoint requires.
 */
@Component({
    selector: 'crm-patient-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        FormsModule,
        RouterLink,
        BooButtonComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooFilterChipsComponent,
        BooDatepickerComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        CrmPatientDetailDrawerComponent,
        CrmPatientEditDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class CrmPatientListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly patientSrv = inject(PatientService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly hospitalSrv = inject(HospitalService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    readonly sortOptions = [
        { value: '-createdat', label: 'Newest first' },
        { value: '+createdat', label: 'Oldest first' },
        { value: '+patientnumber', label: 'Patient no. (A–Z)' },
        { value: '-patientnumber', label: 'Patient no. (Z–A)' },
    ];
    readonly skeletonRows = Array.from({ length: 8 });
    readonly name = displayName;
    readonly initials = initials;
    readonly risk = riskOf;
    readonly type = patientTypeOf;
    readonly flags = flagsOf;
    readonly age = ageOf;
    readonly gender = genderOf;

    today = isoDate(new Date());
    query = '';
    from: string | null = null;
    to: string | null = null;
    sort = '-createdat';
    page = 1;

    data: PaginationData<Patient> | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Patients with a delete in flight; their actions are disabled. */
    busyIds = new Set<string>();

    selected: Patient | null = null;
    editing: Patient | null = null;
    /** Reopen the profile after editing when the edit started there. */
    private returnToProfile = false;

    doctors: Doctor[] = [];
    hospitals: Hospital[] = [];
    doctorNames = new Map<string, string>();
    hospitalNames = new Map<string, string>();
    lookupError: string | null = null;
    private lookupsState: 'idle' | 'loading' | 'done' = 'idle';

    canUpdate = false;
    canDelete = false;
    registerLink: string | null = null;
    recordLink: string | null = null;

    private readonly load$ = new Subject<void>();
    private readonly query$ = new Subject<string>();
    /** The cleaned search term last sent to the server. */
    private lastSearched = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next search.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    const range = this.effectiveRange;
                    return this.patientSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: { start: range?.from ?? '', end: range?.to ?? '' },
                    }).pipe(
                        map(res => ({ res, err: null as HttpErrorResponse | null })),
                        catchError((err: HttpErrorResponse) => of({ res: null, err })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ res, err }) => {
                if (err || !res?.success || !res.data) {
                    this.failLoad(err?.status === 403 ? 'forbidden' : 'failed');
                    return;
                }
                this.data = { ...res.data, items: res.data.items ?? [] };
                this.loadError = null;
                this.refreshErrorState = 'default';
                // Keep an open profile in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(p => p.id === open.id) ?? open;
            });

        this.query$
            .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Read the field now rather than the emitted value, in case filters were cleared meanwhile.
                const term = this.searchTerm;
                this.searchPending = false;
                if (term === this.lastSearched) return;
                this.lastSearched = term;
                this.page = 1;
                this.load();
            });

        this.load();
    }
    // #endregion

    // #region Getters
    get items(): Patient[] {
        return this.data?.items ?? [];
    }

    get totalPages(): number {
        return Math.max(1, this.data?.totalPages ?? Math.ceil((this.data?.totalCount ?? 0) / PAGE_SIZE));
    }

    get firstShown(): number {
        return this.items.length ? (this.page - 1) * PAGE_SIZE + 1 : 0;
    }

    get lastShown(): number {
        return (this.page - 1) * PAGE_SIZE + this.items.length;
    }

    get searchTerm(): string {
        return cleanSearch(this.query);
    }

    get rangeInvalid(): boolean {
        return !!this.from && !!this.to && this.from > this.to;
    }

    /** Exactly one date picked; the server only filters when it gets both. */
    get rangePartial(): boolean {
        return !!this.from !== !!this.to;
    }

    get effectiveRange(): { from: string; to: string } | null {
        return this.from && this.to && !this.rangeInvalid ? { from: this.from, to: this.to } : null;
    }

    get hasFilters(): boolean {
        return !!this.searchTerm || !!this.effectiveRange;
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `Patient no. “${this.searchTerm}”` });
        const range = this.effectiveRange;
        if (range) chips.push({ kind: 'range', label: `Registered ${this.shortDate(range.from)} – ${this.shortDate(range.to)}` });
        return chips;
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label.toLowerCase() ?? '';
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.rangeInvalid) return;
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    onQueryChange(): void {
        this.searchPending = cleanSearch(this.query) !== this.lastSearched;
        this.query$.next(this.query);
    }

    clearSearch(): void {
        this.query = '';
        this.onQueryChange();
    }

    onRangeChange(): void {
        if (this.rangeInvalid) return;
        this.page = 1;
        this.load();
    }

    onSortChange(): void {
        this.page = 1;
        this.load();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    removeChip(chip: FilterChip): void {
        if (chip.kind === 'search') {
            this.clearSearch();
            return;
        }
        this.from = null;
        this.to = null;
        this.onRangeChange();
    }

    clearFilters(): void {
        this.query = '';
        this.from = null;
        this.to = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.load();
    }

    openProfile(p: Patient): void {
        this.editing = null;
        this.selected = p;
        this.ensureLookups();
    }

    openEdit(p: Patient, fromProfile = false): void {
        if (!this.canUpdate) return;
        this.returnToProfile = fromProfile;
        this.selected = null;
        this.editing = p;
        this.ensureLookups();
    }

    closeEdit(): void {
        const p = this.editing;
        this.editing = null;
        if (p && this.returnToProfile) this.selected = this.items.find(i => i.id === p.id) ?? p;
        this.returnToProfile = false;
    }

    onSaved(p: Patient): void {
        if (this.data) this.data = { ...this.data, items: this.data.items.map(i => i.id === p.id ? p : i) };
        this.toastSrv.success(`${displayName(p)} · ${p.patientNumber}`, 'Patient updated');
        this.editing = p;
        this.closeEdit();
    }

    confirmDelete(p: Patient): void {
        if (!this.canDelete || this.busyIds.has(p.id)) return;
        this.dialogSrv.confirm(
            `Delete ${displayName(p)} (${p.patientNumber})? Their patient record will be removed. This can't be undone here.`,
            () => this.delete(p),
            'Delete patient',
            'danger',
            'Delete patient',
            'Keep patient',
        );
    }

    trackById(_: number, p: Patient): string {
        return p.id;
    }

    lastVisit(p: Patient): Date | null {
        return p.lastVisitDate ? new Date(p.lastVisitDate) : null;
    }

    followUp(p: Patient): Date | null {
        return p.nextFollowUpDate ? new Date(p.nextFollowUpDate) : null;
    }
    // #endregion

    // #region Helpers
    private delete(p: Patient): void {
        this.busyIds = new Set(this.busyIds).add(p.id);
        this.patientSrv.delete(p.id)
            .pipe(
                finalize(() => {
                    const next = new Set(this.busyIds);
                    next.delete(p.id);
                    this.busyIds = next;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.toastSrv.success(`${displayName(p)} · ${p.patientNumber}`, 'Patient deleted');
                    if (this.selected?.id === p.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.load();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    /** Doctor and facility names for the profile and the edit form, loaded once per visit; retried after a failure. */
    private ensureLookups(): void {
        if (this.lookupsState !== 'idle') return;
        this.lookupsState = 'loading';
        this.lookupError = null;
        const fail = (what: string) => (err: HttpErrorResponse): Observable<null> => {
            this.lookupError = err?.status === 403
                ? `You don't have access to the list of ${what}, so names may be missing.`
                : `Couldn't load ${what}. Close and reopen to try again.`;
            return of(null);
        };
        forkJoin({
            doctors: this.doctorSrv.search({ pageNumber: 1, pageSize: LOOKUP_SIZE, filter: { start: '', end: '' } })
                .pipe(map(res => res?.success ? res.data?.items ?? [] : null), catchError(fail('doctors'))),
            hospitals: this.hospitalSrv.lookup(LOOKUP_SIZE).pipe(catchError(fail('facilities'))),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ doctors, hospitals }) => {
                if (doctors) {
                    this.doctors = doctors.slice().sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
                    this.doctorNames = new Map(this.doctors.map(d => [d.id, d.fullName]));
                }
                if (hospitals) {
                    this.hospitals = hospitals;
                    this.hospitalNames = new Map(hospitals.map(h => [h.id, h.name]));
                }
                if (!doctors && !this.lookupError) this.lookupError = "Couldn't load doctors. Close and reopen to try again.";
                this.lookupsState = doctors && hospitals ? 'done' : 'idle';
            });
    }

    private shortDate(iso: string): string {
        const d = parseIsoDate(iso);
        return d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : iso;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the patient API enforces.
        this.canUpdate = can(Permissions.Reception.PatientUpdate);
        this.canDelete = can(Permissions.Reception.PatientDelete);
        this.registerLink = can(Permissions.Reception.PatientRegister) ? '/admin/reception/registration' : null;
        this.recordLink = can(Permissions.Clinical.MedicalRecordRead) ? '/admin/clinic/medical-record' : null;
    }
    // #endregion
}
