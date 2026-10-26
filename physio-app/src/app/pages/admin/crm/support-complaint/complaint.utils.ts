import { BooBadgeTone } from '@physioboo/ui';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../../../shared/enums/complaint';
import { Complaint, UpdateComplaintRequest } from '../../../../shared/types/complaint.types';

/** Server limits (the create/update complaint validators). */
export const COMPLAINT_LIMITS = { patientName: 120, email: 254, phone: 32, subject: 200, description: 4000, assignedTo: 120 } as const;

export interface StatusMeta {
    label: string;
    tone: BooBadgeTone;
    /** What this status asks of staff, shown under the status tabs and in the details. */
    hint: string;
}

/** Open work reads as amber (untouched) or blue (being handled); finished tickets stay calm. */
export const STATUS: Record<ComplaintStatus, StatusMeta> = {
    [ComplaintStatus.Pending]: { label: 'Pending', tone: 'warning', hint: 'Not picked up yet. Check the details, set a priority and take ownership.' },
    [ComplaintStatus.InProgress]: { label: 'In progress', tone: 'primary', hint: 'Someone is looking into it. Resolve it once the patient has an answer.' },
    [ComplaintStatus.Resolved]: { label: 'Resolved', tone: 'success', hint: 'Answered. Close it once nothing more is needed, or reopen it if the patient comes back.' },
    [ComplaintStatus.Closed]: { label: 'Closed', tone: 'neutral', hint: 'Finished and filed. Reopen it if the issue comes back.' },
};

export const ALL_STATUSES: ComplaintStatus[] = [ComplaintStatus.Pending, ComplaintStatus.InProgress, ComplaintStatus.Resolved, ComplaintStatus.Closed];
export const OPEN_STATUSES: ComplaintStatus[] = [ComplaintStatus.Pending, ComplaintStatus.InProgress];

/** Colour only for the two levels that should jump out of a long queue. */
export const PRIORITY: Record<ComplaintPriority, { label: string; tone: BooBadgeTone }> = {
    [ComplaintPriority.Urgent]: { label: 'Urgent', tone: 'danger' },
    [ComplaintPriority.High]: { label: 'High', tone: 'warning' },
    [ComplaintPriority.Medium]: { label: 'Medium', tone: 'neutral' },
    [ComplaintPriority.Low]: { label: 'Low', tone: 'neutral' },
};

export const CATEGORY: Record<ComplaintCategory, string> = {
    [ComplaintCategory.MedicalServices]: 'Medical services',
    [ComplaintCategory.BillingInsurance]: 'Billing & insurance',
    [ComplaintCategory.FacilityEquipment]: 'Facility & equipment',
    [ComplaintCategory.StaffBehavior]: 'Staff behaviour',
    [ComplaintCategory.AppointmentIssues]: 'Appointments',
    [ComplaintCategory.PharmacyServices]: 'Pharmacy',
    [ComplaintCategory.Other]: 'Other',
};

export const STATUS_OPTIONS = ALL_STATUSES.map(value => ({ value, label: STATUS[value].label }));
export const PRIORITY_OPTIONS = [ComplaintPriority.Urgent, ComplaintPriority.High, ComplaintPriority.Medium, ComplaintPriority.Low]
    .map(value => ({ value, label: PRIORITY[value].label }));
export const CATEGORY_OPTIONS = (Object.keys(CATEGORY).map(Number) as ComplaintCategory[]).map(value => ({ value, label: CATEGORY[value] }));

export interface ComplaintMove {
    to: ComplaintStatus;
    label: string;
    icon: string;
    /** Ask before applying. */
    confirm: boolean;
}

/**
 * Status changes offered from each status. The server accepts any status on update; these are the steps that make
 * sense in a ticket's life, with the usual next step first. Reopening clears the resolved date on the server.
 */
const MOVES: Record<ComplaintStatus, ComplaintMove[]> = {
    [ComplaintStatus.Pending]: [
        { to: ComplaintStatus.InProgress, label: 'Start handling', icon: 'play', confirm: false },
        { to: ComplaintStatus.Resolved, label: 'Mark resolved', icon: 'circle-check', confirm: false },
        { to: ComplaintStatus.Closed, label: 'Close', icon: 'archive', confirm: true },
    ],
    [ComplaintStatus.InProgress]: [
        { to: ComplaintStatus.Resolved, label: 'Mark resolved', icon: 'circle-check', confirm: false },
        { to: ComplaintStatus.Pending, label: 'Back to pending', icon: 'undo-2', confirm: false },
        { to: ComplaintStatus.Closed, label: 'Close', icon: 'archive', confirm: true },
    ],
    [ComplaintStatus.Resolved]: [
        { to: ComplaintStatus.Closed, label: 'Close ticket', icon: 'archive', confirm: true },
        { to: ComplaintStatus.InProgress, label: 'Reopen', icon: 'rotate-ccw', confirm: false },
    ],
    [ComplaintStatus.Closed]: [
        { to: ComplaintStatus.InProgress, label: 'Reopen', icon: 'rotate-ccw', confirm: false },
    ],
};

/** Toast titles after a status change. */
export const MOVED: Record<ComplaintStatus, string> = {
    [ComplaintStatus.Pending]: 'Moved back to pending',
    [ComplaintStatus.InProgress]: 'Marked in progress',
    [ComplaintStatus.Resolved]: 'Marked resolved',
    [ComplaintStatus.Closed]: 'Ticket closed',
};

export function statusOf(c: Complaint): StatusMeta {
    return STATUS[c.status] ?? { label: 'Unknown', tone: 'neutral', hint: '' };
}

export function priorityOf(c: Complaint): { label: string; tone: BooBadgeTone } {
    return PRIORITY[c.priority] ?? { label: '—', tone: 'neutral' };
}

export function categoryOf(c: Complaint): string {
    return CATEGORY[c.category] ?? 'Other';
}

export function movesOf(c: Complaint): ComplaintMove[] {
    return MOVES[c.status] ?? [];
}

/** Urgent and high priority get a badge on the row; lower levels stay plain text. */
export function isRaised(c: Complaint): boolean {
    return c.priority === ComplaintPriority.Urgent || c.priority === ComplaintPriority.High;
}

export function isOpen(c: Complaint): boolean {
    return OPEN_STATUSES.includes(c.status);
}

/** The full update body for a complaint, with some fields changed. The server replaces every field. */
export function updateOf(c: Complaint, patch: Partial<UpdateComplaintRequest> = {}): UpdateComplaintRequest {
    return {
        patientName: c.patientName,
        patientId: c.patientId || null,
        email: c.email,
        phone: c.phone,
        category: c.category,
        priority: c.priority,
        status: c.status,
        subject: c.subject,
        description: c.description,
        assignedTo: c.assignedTo || null,
        ...patch,
    };
}

export function subjectOf(c: Complaint): string {
    return c.subject?.trim() || 'No subject';
}

export function ticketOf(c: Complaint): string {
    return c.ticketNumber?.trim() || 'Ticket';
}

/** Whole days since the complaint was logged (0 = today). */
export function ageInDays(c: Complaint, now = new Date()): number | null {
    const at = c.createdAt ? new Date(c.createdAt) : null;
    if (!at || isNaN(at.getTime())) return null;
    const start = new Date(at.getFullYear(), at.getMonth(), at.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
}

/** "Today", "Yesterday", "4 days ago". */
export function ageLabel(c: Complaint, now = new Date()): string {
    const d = ageInDays(c, now);
    if (d === null) return '';
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
}

/** Local date as YYYY-MM-DD. */
export function isoDate(d: Date): string {
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Parses YYYY-MM-DD as a local date. */
export function parseIsoDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGuid(value: string): boolean {
    return GUID.test(value.trim());
}
