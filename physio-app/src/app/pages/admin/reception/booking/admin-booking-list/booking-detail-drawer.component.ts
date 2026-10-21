import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../../components/drawer/drawer.component';
import { AppointmentRecord } from '../../../../../shared/types/appointment.types';
import { BookingAction, bookingStatus, canCancel, canCheckIn, canConfirm, endMinutes, fromMinutes, parseIsoDate, shortTime } from './booking.utils';

/** Read-only view of one booking with the status changes reception can make from here. */
@Component({
    selector: 'booking-detail-drawer',
    standalone: true,
    imports: [NgIf, DatePipe, RouterLink, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent],
    template: `
        <drawer [isOpen]="!!appointment" (close)="close.emit()">
            <div
                *ngIf="appointment as a"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-detail-title"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">{{ a.appointmentNumber || 'Booking' }}</p>
                        <h2 id="booking-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ a.patientName || 'Unnamed patient' }}</h2>
                        <div class="mt-2"><boo-status-badge dotted [label]="status(a.status).label" [tone]="status(a.status).tone" /></div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <section aria-labelledby="bd-when">
                        <h3 id="bd-when" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Appointment</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Date</dt>
                                <dd class="m-0 font-medium text-regular">{{ (date(a) | date: 'EEEE, d MMM y') || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Time</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ timeRange(a) || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Doctor</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.doctorName || '—' }}</dd>
                            </div>
                            <div *ngIf="a.appointmentTypeName">
                                <dt class="text-xs text-secondary">Type</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.appointmentTypeName }}</dd>
                            </div>
                            <div *ngIf="a.durationMinutes">
                                <dt class="text-xs text-secondary">Duration</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.durationMinutes }} min</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="bd-patient" class="pt-5 border-t border-rowDivider">
                        <h3 id="bd-patient" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Patient</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Name</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.patientName || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Patient no.</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ a.patientMRN || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Phone</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ a.patientPhone || '—' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="bd-reason" class="pt-5 border-t border-rowDivider">
                        <h3 id="bd-reason" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Chief complaint</h3>
                        <p class="m-0 text-sm text-regular whitespace-pre-line break-words" [class.text-placeholder]="!a.chiefComplaint">{{ a.chiefComplaint || 'None recorded' }}</p>
                    </section>

                    <a
                        *ngIf="queueLink && a.status === 'CheckedIn'"
                        [routerLink]="queueLink"
                        class="self-start inline-flex items-center gap-1 text-sm font-semibold text-primaryDeep no-underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >Open the reception queue<physio-icon name="chevron-right" [size]="14" /></a>
                </div>

                <footer *ngIf="canUpdate && hasActions(a)" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canCancelIt(a)" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" (click)="action.emit('cancel')">
                        <physio-icon name="circle-x" [size]="15" aria-hidden="true" />Cancel booking
                    </button>
                    <button *ngIf="canConfirmIt(a)" boo-button variant="secondary" size="sm" [disabled]="busy" (click)="action.emit('confirm')">
                        <physio-icon name="circle-check" [size]="15" aria-hidden="true" />Confirm
                    </button>
                    <button *ngIf="canCheckInIt(a)" boo-button variant="primary" size="sm" [loading]="busy" (click)="action.emit('checkIn')">
                        <physio-icon *ngIf="!busy" name="user-check" [size]="15" aria-hidden="true" />Check in
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class BookingDetailDrawerComponent {
    /** The booking to show; null closes the drawer. */
    @Input() appointment: AppointmentRecord | null = null;
    @Input() canUpdate = false;
    /** A status change for this booking is in flight. */
    @Input() busy = false;
    @Input() queueLink: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() action = new EventEmitter<BookingAction>();

    readonly status = bookingStatus;
    readonly canConfirmIt = canConfirm;
    readonly canCheckInIt = canCheckIn;
    readonly canCancelIt = canCancel;

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.appointment) this.close.emit();
    }

    date(a: AppointmentRecord): Date | null {
        return parseIsoDate(a.scheduledDate);
    }

    timeRange(a: AppointmentRecord): string {
        const start = shortTime(a.scheduledTime);
        const end = endMinutes(a);
        const endText = end !== null ? shortTime(fromMinutes(end)) : '';
        return endText ? `${start} – ${endText}` : start;
    }

    hasActions(a: AppointmentRecord): boolean {
        return canConfirm(a) || canCheckIn(a) || canCancel(a);
    }
}
