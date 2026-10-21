import { BooBadgeTone } from '@physioboo/ui';
import { AppointmentRecord, AppointmentStatus } from '../../../../../shared/types/appointment.types';

export const BOOKING_STATUS: Record<AppointmentStatus, { label: string; tone: BooBadgeTone }> = {
    Scheduled: { label: 'Scheduled', tone: 'neutral' },
    Confirmed: { label: 'Confirmed', tone: 'primary' },
    CheckedIn: { label: 'Checked in', tone: 'success' },
    InProgress: { label: 'In progress', tone: 'warning' },
    Completed: { label: 'Completed', tone: 'neutral' },
    Cancelled: { label: 'Cancelled', tone: 'danger' },
    NoShow: { label: 'No show', tone: 'danger' },
    Rescheduled: { label: 'Rescheduled', tone: 'warning' },
};

export function bookingStatus(status: string): { label: string; tone: BooBadgeTone } {
    return BOOKING_STATUS[status as AppointmentStatus] ?? { label: status || 'Unknown', tone: 'neutral' };
}

/** Status changes reception can make from the booking list (the same rules the previous list used, plus confirm). */
export type BookingAction = 'confirm' | 'checkIn' | 'cancel';

export function canConfirm(a: AppointmentRecord): boolean {
    return a.status === 'Scheduled';
}

export function canCheckIn(a: AppointmentRecord): boolean {
    return a.status === 'Scheduled' || a.status === 'Confirmed';
}

export function canCancel(a: AppointmentRecord): boolean {
    return a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'CheckedIn';
}

/** "09:30:00" → "09:30". */
export function shortTime(time: string | null | undefined): string {
    return time ? time.slice(0, 5) : '';
}

/** Minutes since midnight for "HH:mm[:ss]", or null. */
export function toMinutes(time: string | null | undefined): number | null {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

/** Minutes since midnight → "HH:mm:ss", or null past midnight. */
export function fromMinutes(total: number): string | null {
    if (total < 0 || total >= 24 * 60) return null;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(2, '0')}:00`;
}

/** Local date as YYYY-MM-DD. */
export function isoDate(d: Date): string {
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Parses YYYY-MM-DD as a local date (new Date('YYYY-MM-DD') would be UTC midnight). */
export function parseIsoDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
}

export function addDays(d: Date, days: number): Date {
    const next = new Date(d);
    next.setDate(next.getDate() + days);
    return next;
}

/** End of an appointment in minutes: the stored end time, else start + duration. */
export function endMinutes(a: AppointmentRecord): number | null {
    const end = toMinutes(a.scheduledEndTime);
    if (end !== null) return end;
    const start = toMinutes(a.scheduledTime);
    return start !== null && a.durationMinutes ? start + a.durationMinutes : null;
}
