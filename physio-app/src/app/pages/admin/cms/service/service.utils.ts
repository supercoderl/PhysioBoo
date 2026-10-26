import { BooBadgeTone } from '@physioboo/ui';
import { MedicalService, ServiceAvailability, ServiceStatus } from '../../../../shared/types/service.types';

export interface LookupOption {
    label: string;
    value: string;
}

/** Only Active reads green: it is the one status the public website lists. */
export const STATUS: Record<ServiceStatus, { label: string; tone: BooBadgeTone; hint: string }> = {
    Active: { label: 'Active', tone: 'success', hint: 'Listed on the website and bookable' },
    Draft: { label: 'Draft', tone: 'neutral', hint: 'Only staff can see it' },
    Inactive: { label: 'Inactive', tone: 'warning', hint: 'Taken off the website for now' },
    Archived: { label: 'Archived', tone: 'neutral', hint: 'Kept for the record, hidden from the catalog' },
};

/** Operational state, independent of the lifecycle status. Shown as a quiet dot + label. */
export const AVAILABILITY: Record<ServiceAvailability, { label: string; dot: string; text: string }> = {
    Available: { label: 'Available', dot: 'bg-emerald-500', text: 'text-secondary' },
    Limited: { label: 'Limited slots', dot: 'bg-amber-500', text: 'text-amber-700' },
    Unavailable: { label: 'Unavailable', dot: 'bg-rose-500', text: 'text-rose-700' },
};

export const AVAILABILITY_OPTIONS: { label: string; value: ServiceAvailability }[] = [
    { label: 'Available', value: 'Available' },
    { label: 'Limited slots', value: 'Limited' },
    { label: 'Unavailable', value: 'Unavailable' },
];

/** Currencies the catalog has always offered; the server only checks for a 3-letter code. */
export const CURRENCY_OPTIONS: LookupOption[] = [
    { label: 'VND', value: 'VND' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
];

/**
 * How a status change is applied. `publish`, `archive` and `restore` have their own endpoints;
 * deactivating goes through PATCH with only the status, which the update endpoint accepts.
 */
export type ServiceMoveKind = 'publish' | 'deactivate' | 'archive' | 'restore';

export interface ServiceTransition {
    kind: ServiceMoveKind;
    to: ServiceStatus;
    label: string;
    icon: string;
    /** Changes what the website lists, so it is confirmed first. */
    confirm: boolean;
    /** Toast title once saved. */
    done: string;
    /** Shown apart from the forward moves. */
    quiet?: boolean;
}

const PUBLISH: ServiceTransition = { kind: 'publish', to: 'Active', label: 'Publish', icon: 'send', confirm: true, done: 'Service published' };
const REACTIVATE: ServiceTransition = { ...PUBLISH, label: 'Reactivate', icon: 'rotate-ccw', done: 'Service reactivated' };
const DEACTIVATE: ServiceTransition = { kind: 'deactivate', to: 'Inactive', label: 'Deactivate', icon: 'pause', confirm: true, done: 'Service deactivated' };
const ARCHIVE: ServiceTransition = { kind: 'archive', to: 'Archived', label: 'Archive', icon: 'archive', confirm: true, done: 'Service archived', quiet: true };
const RESTORE: ServiceTransition = { kind: 'restore', to: 'Draft', label: 'Restore as draft', icon: 'archive-restore', confirm: false, done: 'Service restored' };

/** Moves offered per status, the usual next step first. */
const TRANSITIONS: Record<ServiceStatus, ServiceTransition[]> = {
    Draft: [PUBLISH, ARCHIVE],
    Active: [DEACTIVATE, ARCHIVE],
    Inactive: [REACTIVATE, ARCHIVE],
    Archived: [RESTORE],
};

export function transitionsOf(s: MedicalService): ServiceTransition[] {
    return TRANSITIONS[s.status] ?? [];
}

/** The step offered right on the row: bring a service (back) towards the website. Deactivating lives in the detail view. */
export function rowMoveOf(s: MedicalService): ServiceTransition | null {
    const first = transitionsOf(s)[0];
    return first && first.kind !== 'deactivate' ? first : null;
}

export function statusOf(s: MedicalService) {
    return STATUS[s.status] ?? { label: s.status, tone: 'neutral' as BooBadgeTone, hint: '' };
}

export function availabilityOf(s: MedicalService) {
    return AVAILABILITY[s.availability] ?? { label: s.availability, dot: 'bg-gray-400', text: 'text-secondary' };
}

export function formatMoney(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
        return `${amount.toLocaleString()} ${currency}`;
    }
}

export function formatDuration(minutes: number): string {
    if (!minutes || minutes < 60) return `${minutes || 0} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
}

/** How a patient gets this service: by appointment, walk-in, and whether a referral is needed. */
export function bookingRuleOf(s: MedicalService): string {
    const base = s.requiresAppointment ? 'By appointment' : 'Walk-in';
    return s.requiresReferral ? `${base} · Referral needed` : base;
}

export function doctorCountOf(s: MedicalService): number {
    return s.doctorCount ?? s.doctorIds?.length ?? 0;
}
