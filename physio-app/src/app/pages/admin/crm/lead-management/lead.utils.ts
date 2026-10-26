import { BooBadgeTone } from '@physioboo/ui';
import { LeadPriority, LeadStatus } from '../../../../shared/enums/lead';
import { Lead, UpdateLeadRequest } from '../../../../shared/types/lead.types';

/** Server limits (LeadConfiguration and the create/update validators). */
export const LEAD_LIMITS = { name: 120, phone: 32, email: 254, service: 64, source: 64, assignedTo: 120, notes: 2000 } as const;

export interface StageMeta {
    label: string;
    tone: BooBadgeTone;
    /** What this stage asks of staff, shown under the stage tabs and in the details. */
    hint: string;
}

/** Open stages read as work to do; the two outcomes stay quiet or alarming. */
export const STAGE: Record<LeadStatus, StageMeta> = {
    [LeadStatus.New]: { label: 'New', tone: 'warning', hint: 'Waiting for a first call or message.' },
    [LeadStatus.Contacted]: { label: 'Contacted', tone: 'primary', hint: 'Reached once; find out what they need.' },
    [LeadStatus.Qualified]: { label: 'Qualified', tone: 'primary', hint: 'A good fit; help them book or register.' },
    [LeadStatus.Converted]: { label: 'Converted', tone: 'success', hint: 'Became a patient or booked care.' },
    [LeadStatus.Lost]: { label: 'Lost', tone: 'neutral', hint: 'Not going ahead.' },
};

/** The forward path of a lead. Lost can be reached from any open stage. */
export const PIPELINE: LeadStatus[] = [LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.Converted];
export const OPEN_STAGES: LeadStatus[] = [LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified];
export const ALL_STAGES: LeadStatus[] = [...PIPELINE, LeadStatus.Lost];

/** Only high priority gets colour, so it stands out in a long queue. */
export const PRIORITY: Record<LeadPriority, { label: string; tone: BooBadgeTone }> = {
    [LeadPriority.High]: { label: 'High', tone: 'danger' },
    [LeadPriority.Medium]: { label: 'Medium', tone: 'neutral' },
    [LeadPriority.Low]: { label: 'Low', tone: 'neutral' },
};

export const STAGE_OPTIONS = ALL_STAGES.map(value => ({ value, label: STAGE[value].label }));
export const PRIORITY_OPTIONS = [LeadPriority.High, LeadPriority.Medium, LeadPriority.Low].map(value => ({ value, label: PRIORITY[value].label }));

/** Common ways leads arrive. "Website" is what the public site's forms record. */
export const SOURCES = ['Website', 'Phone call', 'Walk-in', 'Referral', 'Social media', 'Advertisement', 'Event'];

export interface LeadMove {
    to: LeadStatus;
    label: string;
    icon: string;
    /** Ask before applying. */
    confirm: boolean;
    danger?: boolean;
}

/**
 * Stage moves offered for each status. The server accepts any status on update; these are the moves that make sense
 * in a lead's life, with the usual next step first.
 */
const MOVES: Record<LeadStatus, LeadMove[]> = {
    [LeadStatus.New]: [
        { to: LeadStatus.Contacted, label: 'Mark contacted', icon: 'phone-call', confirm: false },
        { to: LeadStatus.Qualified, label: 'Mark qualified', icon: 'badge-check', confirm: false },
        { to: LeadStatus.Lost, label: 'Mark lost', icon: 'ban', confirm: true, danger: true },
    ],
    [LeadStatus.Contacted]: [
        { to: LeadStatus.Qualified, label: 'Mark qualified', icon: 'badge-check', confirm: false },
        { to: LeadStatus.New, label: 'Back to new', icon: 'undo-2', confirm: false },
        { to: LeadStatus.Lost, label: 'Mark lost', icon: 'ban', confirm: true, danger: true },
    ],
    [LeadStatus.Qualified]: [
        { to: LeadStatus.Converted, label: 'Mark converted', icon: 'circle-check', confirm: false },
        { to: LeadStatus.Contacted, label: 'Back to contacted', icon: 'undo-2', confirm: false },
        { to: LeadStatus.Lost, label: 'Mark lost', icon: 'ban', confirm: true, danger: true },
    ],
    [LeadStatus.Converted]: [
        { to: LeadStatus.Qualified, label: 'Reopen as qualified', icon: 'rotate-ccw', confirm: false },
    ],
    [LeadStatus.Lost]: [
        { to: LeadStatus.New, label: 'Reopen as new', icon: 'rotate-ccw', confirm: false },
    ],
};

/** Toast titles after a stage move. */
export const MOVED: Record<LeadStatus, string> = {
    [LeadStatus.New]: 'Lead reopened',
    [LeadStatus.Contacted]: 'Marked as contacted',
    [LeadStatus.Qualified]: 'Marked as qualified',
    [LeadStatus.Converted]: 'Marked as converted',
    [LeadStatus.Lost]: 'Marked as lost',
};

export function stageOf(l: Lead): StageMeta {
    return STAGE[l.status] ?? { label: l.status || 'Unknown', tone: 'neutral', hint: '' };
}

export function priorityOf(l: Lead): { label: string; tone: BooBadgeTone } {
    return PRIORITY[l.priority] ?? { label: l.priority || '—', tone: 'neutral' };
}

export function movesOf(l: Lead): LeadMove[] {
    return MOVES[l.status] ?? [];
}

/** The usual forward step, shown on the row; going back, losing or reopening stays in the details. */
export function nextMoveOf(l: Lead): LeadMove | null {
    if (!OPEN_STAGES.includes(l.status)) return null;
    const m = movesOf(l)[0];
    return m && !m.danger && !m.confirm ? m : null;
}

export function isOpen(l: Lead): boolean {
    return OPEN_STAGES.includes(l.status);
}

/**
 * Every update is checked against the create rules, which need an email. Leads from the public website may have
 * none, so they must be given one (in the edit form) before anything else about them can be saved.
 */
export function canSave(l: Lead): boolean {
    return !!l.email?.trim();
}

export const NEEDS_EMAIL = 'Add an email address to this lead before changing it; the server requires one on every save.';

/** The full update body for a lead, with some fields changed. */
export function updateOf(l: Lead, patch: Partial<UpdateLeadRequest> = {}): UpdateLeadRequest {
    return {
        name: l.name,
        phone: l.phone,
        email: l.email,
        service: l.service,
        source: l.source,
        status: l.status,
        priority: l.priority,
        assignedTo: l.assignedTo || null,
        notes: l.notes || null,
        ...patch,
    };
}

/** Notes with a dated, signed entry added at the end. */
export function withNote(notes: string | null, text: string, author: string | null, at = new Date()): string {
    const stamp = at.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const entry = `— ${stamp}${author ? ' · ' + author : ''}\n${text.trim()}`;
    return notes?.trim() ? `${notes.trimEnd()}\n\n${entry}` : entry;
}

/** Room left in the notes for a new entry (its header included), given the current author. */
export function noteRoom(notes: string | null, author: string | null): number {
    return LEAD_LIMITS.notes - withNote(notes, '', author).length;
}

export function displayName(l: Lead): string {
    return l.name?.trim() || 'Unnamed lead';
}

export function initials(l: Lead): string {
    const parts = (l.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Whole days since the lead arrived (0 = today). */
export function ageInDays(l: Lead, now = new Date()): number | null {
    const at = l.createdAt ? new Date(l.createdAt) : null;
    if (!at || isNaN(at.getTime())) return null;
    const start = new Date(at.getFullYear(), at.getMonth(), at.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
}

/** "Today", "Yesterday", "4 days ago". */
export function ageLabel(l: Lead, now = new Date()): string {
    const d = ageInDays(l, now);
    if (d === null) return '';
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
}

/** "Waiting since yesterday", "Waiting 4 days", for new leads. */
export function waitLabel(l: Lead, now = new Date()): string {
    const d = ageInDays(l, now) ?? 0;
    return d <= 1 ? `Waiting since ${d === 1 ? 'yesterday' : 'today'}` : `Waiting ${d} days`;
}

/** A new lead nobody has contacted after a day is worth a nudge. */
export function isWaiting(l: Lead, now = new Date()): boolean {
    return l.status === LeadStatus.New && (ageInDays(l, now) ?? 0) >= 1;
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
