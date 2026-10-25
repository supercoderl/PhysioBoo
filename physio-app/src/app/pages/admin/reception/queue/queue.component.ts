import { DatePipe, DOCUMENT, NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, from, interval, of } from 'rxjs';
import { catchError, finalize, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { AppointmentService } from '../../../../services/admin/appointment.service';
import { DoctorService } from '../../../../services/admin/doctor.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SKIP_ERROR_TOAST } from '../../../../shared/contexts/option.context';
import { AppointmentRecord, AppointmentStatus } from '../../../../shared/types/appointment.types';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { BookingDetailDrawerComponent } from '../booking/admin-booking-list/booking-detail-drawer.component';
import { BookingAction, bookingStatus, canCheckIn, isoDate, parseIsoDate, shortTime, toMinutes } from '../booking/admin-booking-list/booking.utils';

type LoadError = 'forbidden' | 'failed';

/** Where a visit is in the day, derived from the appointment status. */
type QueueStage = 'waiting' | 'withDoctor' | 'notArrived' | 'done' | 'closed';
type QueueTab = 'active' | QueueStage | 'all';

interface QueueGroup {
    stage: QueueStage;
    label: string;
    items: AppointmentRecord[];
}

const STAGE_OF: Record<AppointmentStatus, QueueStage> = {
    Scheduled: 'notArrived',
    Confirmed: 'notArrived',
    CheckedIn: 'waiting',
    InProgress: 'withDoctor',
    Completed: 'done',
    Cancelled: 'closed',
    NoShow: 'closed',
    Rescheduled: 'closed',
};

/** Display order of the groups: who is waiting first, then who is with a doctor, then who is still expected. */
const STAGES: { stage: QueueStage; label: string; tab: string }[] = [
    { stage: 'waiting', label: 'Waiting', tab: 'Waiting' },
    { stage: 'withDoctor', label: 'With doctor', tab: 'With doctor' },
    { stage: 'notArrived', label: 'Not arrived yet', tab: 'Not arrived' },
    { stage: 'done', label: 'Completed', tab: 'Completed' },
    { stage: 'closed', label: 'Cancelled, no-show or rescheduled', tab: 'Cancelled' },
];
const ACTIVE_STAGES: QueueStage[] = ['waiting', 'withDoctor', 'notArrived'];

const ACTION_COPY: Record<BookingAction, { status: AppointmentStatus; done: string }> = {
    confirm: { status: 'Confirmed', done: 'Booking confirmed' },
    checkIn: { status: 'CheckedIn', done: 'Patient checked in' },
    cancel: { status: 'Cancelled', done: 'Booking cancelled' },
};

/** Same cap the booking form uses for its doctor lookup. */
const DOCTOR_LOOKUP_SIZE = 200;
/** Parallel schedule requests when the queue spans every doctor. */
const FAN_OUT = 4;
const POLL_MS = 30_000;

function stageOf(status: string): QueueStage {
    return STAGE_OF[status as AppointmentStatus] ?? 'closed';
}

/** Lower-case, accent-free text so "nguyen" finds "Nguyễn". */
function fold(text: string | null | undefined): string {
    return (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
}

/**
 * Reception queue: every appointment scheduled on one day, grouped by where the patient is in the visit.
 *
 * The appointment search API filters by the date a booking was made, so it can't list a day's visits. The day comes
 * from the per-doctor daily schedule endpoint instead: one request for a chosen doctor, or one per doctor (a few at a
 * time) for "All doctors". Search and stage filters then run on that loaded day. The view model has no check-in time
 * or queue number, so the list shows scheduled times and lateness against them, not waiting durations or positions.
 */
@Component({
    selector: 'admin-queue',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        FormsModule,
        RouterLink,
        BooButtonComponent,
        BooDatepickerComponent,
        BooSelectComponent,
        BooIconComponent,
        BooStatusBadgeComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        BookingDetailDrawerComponent,
    ],
    templateUrl: './queue.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminQueueComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    readonly tabs: QueueTab[] = ['active', 'waiting', 'withDoctor', 'notArrived', 'done', 'closed', 'all'];
    readonly skeletonRows = Array.from({ length: 6 });
    readonly status = bookingStatus;
    readonly canCheckInIt = canCheckIn;
    readonly time = shortTime;

    today = isoDate(new Date());
    date = this.today;
    doctorId = '';
    tab: QueueTab = 'active';
    query = '';

    doctors: Doctor[] = [];
    doctorsLoading = false;
    doctorsError: LoadError | null = null;

    /** The loaded day; null until the first load for the current date and doctor. */
    items: AppointmentRecord[] | null = null;
    loading = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Doctors whose schedule failed to load in the last "All doctors" load. */
    failedDoctors = 0;
    lastUpdated: Date | null = null;
    /** Minutes since midnight, for lateness. */
    nowMinutes = this.minutesNow();

    counts: Record<QueueTab, number> = this.emptyCounts();
    groups: QueueGroup[] = [];
    busyIds = new Set<string>();
    selected: AppointmentRecord | null = null;

    canUpdate = false;
    bookingLink: string | null = null;

    private readonly load$ = new Subject<void>();
    private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops a day the user has already moved past; each schedule request catches its own error so one
        // doctor's failure neither hides the others nor ends the stream.
        this.load$
            .pipe(
                switchMap(() => {
                    const ids = this.doctorId ? [this.doctorId] : this.doctors.map(d => d.id);
                    const day = this.date;
                    this.loading = true;
                    return from(ids).pipe(
                        mergeMap(id => this.appointmentSrv.doctorDaily(id, day, this.silent).pipe(
                            map(res => res?.success ? { items: res.data ?? [], err: null } : { items: [], err: 0 }),
                            catchError((err: HttpErrorResponse) => of({ items: [] as AppointmentRecord[], err: err?.status ?? 0 })),
                        ), FAN_OUT),
                        toArray(),
                        map(results => ({ results, requested: ids.length })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ results, requested }) => this.applyResults(results, requested));

        this.loadDoctors();

        if (this.isBrowser) {
            // Today's queue moves on its own (doctors start and finish visits), so refresh it while the tab is visible.
            interval(POLL_MS)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    this.nowMinutes = this.minutesNow();
                    if (this.isLive && !this.document.hidden && !this.loading && !this.busyIds.size && !this.loadError) this.load();
                });
        }
    }
    // #endregion

    // #region Getters
    /** Today's queue: lateness and auto-refresh apply. */
    get isLive(): boolean {
        return this.date === this.today;
    }

    /** "All doctors" first (empty id), then each doctor; the select shows the first entry while loading. */
    get doctorOptions(): { id: string; fullName: string }[] {
        const all = this.doctorsLoading ? 'Loading doctors…' : 'All doctors';
        return [{ id: '', fullName: all }, ...this.doctors.map(d => ({ id: d.id, fullName: d.fullName || 'Unnamed doctor' }))];
    }

    get scopeLabel(): string {
        if (!this.doctorId) return 'All doctors';
        return this.doctors.find(d => d.id === this.doctorId)?.fullName || 'Selected doctor';
    }

    get partialWhat(): string {
        return this.failedDoctors === 1 ? "1 doctor's schedule" : `${this.failedDoctors} doctors' schedules`;
    }

    get emptyTitle(): string {
        if (!this.items?.length) return this.isLive ? 'No appointments today' : 'No appointments on this day';
        if (this.query.trim()) return 'No matches';
        return this.tab === 'active' ? 'Nobody left in the queue' : `No ${this.tabLabel(this.tab).toLowerCase()} appointments`;
    }

    get emptyDescription(): string {
        if (!this.items?.length) {
            if (this.doctorId) return 'This doctor has nothing scheduled. Try another doctor or day.';
            return this.doctors.length ? 'Nothing is scheduled. Try another day.' : 'No doctors are set up yet, so there are no schedules to show.';
        }
        if (this.query.trim()) return 'No appointment on this day matches that name, number or phone.';
        return 'Check the other tabs for the rest of the day.';
    }
    // #endregion

    // #region Methods
    load(): void {
        if (!this.date) return;
        if (!this.doctorId && (this.doctorsLoading || this.doctorsError)) return;
        if (this.items && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    /** Date or doctor changed: the old rows belong to another queue, so drop them before loading. */
    onScopeChange(): void {
        this.today = isoDate(new Date());
        // A cleared date input falls back to today rather than leaving the queue without a day.
        if (!this.date) this.date = this.today;
        this.items = null;
        this.loadError = null;
        this.failedDoctors = 0;
        this.selected = null;
        this.rebuild();
        this.load();
    }

    goToday(): void {
        if (this.date === isoDate(new Date())) return;
        this.date = isoDate(new Date());
        this.onScopeChange();
    }

    shiftDay(days: number): void {
        const d = parseIsoDate(this.date) ?? new Date();
        d.setDate(d.getDate() + days);
        this.date = isoDate(d);
        this.onScopeChange();
    }

    setTab(tab: QueueTab): void {
        this.tab = tab;
        this.rebuild();
    }

    onQueryChange(): void {
        this.rebuild();
    }

    clearQuery(): void {
        this.query = '';
        this.rebuild();
    }

    retryDoctors(): void {
        this.loadDoctors();
    }

    tabLabel(tab: QueueTab): string {
        if (tab === 'active') return 'In queue';
        if (tab === 'all') return 'All';
        return STAGES.find(s => s.stage === tab)?.tab ?? tab;
    }

    /** Minutes past the scheduled start for a patient who hasn't arrived today; 0 when not late. */
    lateBy(a: AppointmentRecord): number {
        if (!this.isLive || stageOf(a.status) !== 'notArrived') return 0;
        const start = toMinutes(a.scheduledTime);
        return start === null ? 0 : Math.max(0, this.nowMinutes - start);
    }

    lateLabel(minutes: number): string {
        return minutes < 60 ? `${minutes} min late` : `${Math.floor(minutes / 60)} h ${minutes % 60} min late`;
    }

    runAction(a: AppointmentRecord, action: BookingAction): void {
        if (this.busyIds.has(a.id)) return;
        if (action === 'cancel') {
            this.dialogSrv.confirm(
                `Cancel ${a.patientName || 'this patient'}'s appointment${a.appointmentNumber ? ' ' + a.appointmentNumber : ''} at ${shortTime(a.scheduledTime)}? This can't be undone here.`,
                () => this.updateStatus(a, action),
                'Cancel appointment',
                'danger',
                'Cancel appointment',
                'Keep appointment',
            );
            return;
        }
        this.updateStatus(a, action);
    }

    trackById(_: number, a: AppointmentRecord): string {
        return a.id;
    }

    trackByStage(_: number, g: QueueGroup): string {
        return g.stage;
    }
    // #endregion

    // #region Helpers
    private loadDoctors(): void {
        this.doctorsLoading = true;
        this.doctorsError = null;
        this.doctorSrv.search({ pageNumber: 1, pageSize: DOCTOR_LOOKUP_SIZE, filter: { start: '', end: '' } })
            .pipe(
                finalize(() => this.doctorsLoading = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    if (!res?.success) {
                        this.doctorsError = 'failed';
                        return;
                    }
                    this.doctors = (res.data?.items ?? []).slice().sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
                    this.doctorsLoading = false;
                    this.load();
                },
                error: (err: HttpErrorResponse) => this.doctorsError = err?.status === 403 ? 'forbidden' : 'failed',
            });
    }

    private applyResults(results: { items: AppointmentRecord[]; err: number | null }[], requested: number): void {
        const failed = results.filter(r => r.err !== null);
        this.nowMinutes = this.minutesNow();

        if (requested > 0 && failed.length === requested) {
            this.refreshErrorState = this.items && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
            this.loadError = failed.every(r => r.err === 403) ? 'forbidden' : 'failed';
            return;
        }

        // Keyed by id so overlapping responses never show the same visit twice.
        const byId = new Map<string, AppointmentRecord>();
        for (const r of results) for (const a of r.items) byId.set(a.id, a);
        this.items = [...byId.values()];
        this.failedDoctors = failed.length;
        this.loadError = null;
        this.refreshErrorState = 'default';
        this.lastUpdated = new Date();

        const open = this.selected;
        if (open) this.selected = byId.get(open.id) ?? open;
        this.rebuild();
    }

    /** Recomputes tab counts and the visible groups from the loaded day, the search and the tab. */
    private rebuild(): void {
        const q = fold(this.query.trim());
        const matches = (this.items ?? []).filter(a => !q || [a.patientName, a.patientMRN, a.patientPhone, a.appointmentNumber, a.doctorName].some(f => fold(f).includes(q)));

        const counts = this.emptyCounts();
        for (const a of matches) {
            const s = stageOf(a.status);
            counts[s]++;
            counts.all++;
            if (ACTIVE_STAGES.includes(s)) counts.active++;
        }
        this.counts = counts;

        const shown = (s: QueueStage) => this.tab === 'all' || this.tab === s || (this.tab === 'active' && ACTIVE_STAGES.includes(s));
        const byTime = (a: AppointmentRecord, b: AppointmentRecord) =>
            (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '') || (a.appointmentNumber ?? '').localeCompare(b.appointmentNumber ?? '');

        this.groups = STAGES
            .filter(s => shown(s.stage))
            .map(s => ({ stage: s.stage, label: s.label, items: matches.filter(a => stageOf(a.status) === s.stage).sort(byTime) }))
            .filter(g => g.items.length);
    }

    private updateStatus(a: AppointmentRecord, action: BookingAction): void {
        const copy = ACTION_COPY[action];
        this.busyIds = new Set(this.busyIds).add(a.id);
        this.appointmentSrv.updateStatus(a.id, copy.status)
            .pipe(
                finalize(() => {
                    const next = new Set(this.busyIds);
                    next.delete(a.id);
                    this.busyIds = next;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.toastSrv.success(`${a.patientName || 'Patient'}${a.appointmentNumber ? ' · ' + a.appointmentNumber : ''}`, copy.done);
                    // Move the row now, then reload so the list matches the server.
                    this.items = (this.items ?? []).map(x => x.id === a.id ? { ...x, status: copy.status } : x);
                    if (this.selected?.id === a.id) this.selected = this.items.find(x => x.id === a.id) ?? null;
                    this.rebuild();
                    this.load();
                },
                // The global HTTP error toast reports the failure; the row keeps its status.
                error: () => undefined,
            });
    }

    private emptyCounts(): Record<QueueTab, number> {
        return { active: 0, waiting: 0, withDoctor: 0, notArrived: 0, done: 0, closed: 0, all: 0 };
    }

    private minutesNow(): number {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
    }

    private applyPermissions(perms: string[]): void {
        // Status changes follow the permission the appointment API enforces.
        this.canUpdate = perms.includes(Permissions.Scheduling.AppointmentUpdate);
        this.bookingLink = perms.includes(Permissions.Reception.BookingRead) ? '/admin/reception/booking/list' : null;
    }
    // #endregion
}
