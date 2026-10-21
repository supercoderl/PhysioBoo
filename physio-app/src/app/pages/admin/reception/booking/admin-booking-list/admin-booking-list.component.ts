import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooPaginationComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../../components/date-picker/boo-date-picker.component';
import { AdminBreadcrumbComponent } from '../../../../../components/breadcrumb/admin-breadcrumb.component';
import { AppointmentService } from '../../../../../services/admin/appointment.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { Permissions } from '../../../../../shared/constants/permission.constant';
import { AppointmentRecord, AppointmentStatus } from '../../../../../shared/types/appointment.types';
import { PaginationData } from '../../../../../shared/types/common';
import { BookingDetailDrawerComponent } from './booking-detail-drawer.component';
import { BookingFormDrawerComponent, CreatedBooking } from './booking-form-drawer.component';
import { BookingAction, addDays, bookingStatus, canCancel, canCheckIn, canConfirm, endMinutes, fromMinutes, isoDate, parseIsoDate, shortTime } from './booking.utils';

type LoadError = 'forbidden' | 'failed';

interface RangePreset {
    label: string;
    /** Days before today the range starts; 0 is today only. */
    days: number;
}

const PAGE_SIZE = 20;
const DEFAULT_PRESET_DAYS = 30;

const ACTION_COPY: Record<BookingAction, { status: AppointmentStatus; done: string }> = {
    confirm: { status: 'Confirmed', done: 'Booking confirmed' },
    checkIn: { status: 'CheckedIn', done: 'Patient checked in' },
    cancel: { status: 'Cancelled', done: 'Booking cancelled' },
};

/**
 * Reception booking list. The search API pages on the server and filters only by the date a booking was made, so
 * the date range here is "booked between"; there is no server-side text, status or doctor filter to offer.
 */
@Component({
    selector: 'admin-booking-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        FormsModule,
        AdminBreadcrumbComponent,
        BooButtonComponent,
        BooIconComponent,
        BooDatepickerComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        BookingFormDrawerComponent,
        BookingDetailDrawerComponent,
    ],
    templateUrl: './admin-booking-list.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminBookingListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    readonly presets: RangePreset[] = [
        { label: 'Today', days: 0 },
        { label: '7 days', days: 6 },
        { label: '30 days', days: 29 },
        { label: '90 days', days: 89 },
    ];
    readonly skeletonRows = Array.from({ length: 6 });
    readonly status = bookingStatus;
    readonly canConfirmIt = canConfirm;
    readonly canCheckInIt = canCheckIn;
    readonly canCancelIt = canCancel;

    today = isoDate(new Date());
    from = isoDate(addDays(new Date(), -(DEFAULT_PRESET_DAYS - 1)));
    to = this.today;
    page = 1;

    data: PaginationData<AppointmentRecord> | null = null;
    loading = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Bookings with a status change in flight; their buttons are disabled. */
    busyIds = new Set<string>();

    formOpen = false;
    selected: AppointmentRecord | null = null;

    canCreate = false;
    canUpdate = false;
    registerLink: string | null = null;
    queueLink: string | null = null;

    private readonly load$ = new Subject<void>();
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
                    return this.appointmentSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        sort: '-createdat',
                        filter: { start: this.from, end: this.to },
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
                // Keep an open details panel in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(a => a.id === open.id) ?? open;
            });

        this.load();
    }
    // #endregion

    // #region Getters
    get items(): AppointmentRecord[] {
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

    get rangeInvalid(): boolean {
        return !this.from || !this.to || this.from > this.to;
    }

    get activePreset(): RangePreset | null {
        if (this.to !== this.today) return null;
        return this.presets.find(p => isoDate(addDays(new Date(), -p.days)) === this.from) ?? null;
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.rangeInvalid) return;
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    applyPreset(p: RangePreset): void {
        this.today = isoDate(new Date());
        this.from = isoDate(addDays(new Date(), -p.days));
        this.to = this.today;
        this.page = 1;
        this.load();
    }

    onRangeChange(): void {
        this.page = 1;
        this.load();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    openForm(): void {
        this.selected = null;
        this.formOpen = true;
    }

    onCreated(b: CreatedBooking): void {
        this.formOpen = false;
        const when = parseIsoDate(b.scheduledDate);
        const day = when ? when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : b.scheduledDate;
        this.toastSrv.success(`${b.patientName || 'Patient'} · ${day} at ${shortTime(b.scheduledTime)}`, 'Booking created');
        // New bookings are made today, so show the range that contains it, newest first.
        if (this.to < isoDate(new Date())) this.to = isoDate(new Date());
        this.page = 1;
        this.load();
    }

    runAction(a: AppointmentRecord, action: BookingAction): void {
        if (this.busyIds.has(a.id)) return;
        if (action === 'cancel') {
            this.dialogSrv.confirm(
                `Cancel ${a.patientName || 'this patient'}'s booking${a.appointmentNumber ? ' ' + a.appointmentNumber : ''} on ${this.dateLabel(a)} at ${shortTime(a.scheduledTime)}? This can't be undone here.`,
                () => this.updateStatus(a, action),
                'Cancel booking',
                'danger',
                'Cancel booking',
                'Keep booking',
            );
            return;
        }
        this.updateStatus(a, action);
    }

    isToday(a: AppointmentRecord): boolean {
        return a.scheduledDate === this.today;
    }

    date(a: AppointmentRecord): Date | null {
        return parseIsoDate(a.scheduledDate);
    }

    timeRange(a: AppointmentRecord): string {
        const end = endMinutes(a);
        const endText = end !== null ? shortTime(fromMinutes(end)) : '';
        return endText ? `${shortTime(a.scheduledTime)} – ${endText}` : shortTime(a.scheduledTime);
    }

    trackById(_: number, a: AppointmentRecord): string {
        return a.id;
    }
    // #endregion

    // #region Helpers
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
                    this.toastSrv.success(`${a.patientName || 'Booking'}${a.appointmentNumber ? ' · ' + a.appointmentNumber : ''}`, copy.done);
                    this.load();
                },
                // The global HTTP error toast reports the failure; the row keeps its status.
                error: () => undefined,
            });
    }

    private dateLabel(a: AppointmentRecord): string {
        const d = this.date(a);
        return d ? d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : a.scheduledDate;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the appointment API enforces.
        this.canCreate = can(Permissions.Scheduling.AppointmentCreate);
        this.canUpdate = can(Permissions.Scheduling.AppointmentUpdate);
        this.registerLink = can(Permissions.Reception.PatientRegister) ? '/admin/reception/registration' : null;
        this.queueLink = can(Permissions.Reception.QueueRead) ? '/admin/reception/queue' : null;
    }
    // #endregion
}
