import { BooBadgeTone } from '@physioboo/ui';
import { CampaignStatus, CampaignType } from '../../../../shared/enums/campaign';
import { Campaign, UpdateCampaignRequest } from '../../../../shared/types/campaign.types';

export const CHANNEL: Record<CampaignType, { label: string; icon: string }> = {
    [CampaignType.Email]: { label: 'Email', icon: 'mail' },
    [CampaignType.Sms]: { label: 'SMS', icon: 'message-square' },
    [CampaignType.Social]: { label: 'Social media', icon: 'share-2' },
    [CampaignType.MultiChannel]: { label: 'Multi-channel', icon: 'layers' },
    [CampaignType.Push]: { label: 'Push notification', icon: 'bell' },
};

/** Live campaigns get the strongest colour; finished ones stay quiet. */
export const STATUS: Record<CampaignStatus, { label: string; tone: BooBadgeTone }> = {
    [CampaignStatus.Draft]: { label: 'Draft', tone: 'neutral' },
    [CampaignStatus.Scheduled]: { label: 'Scheduled', tone: 'primary' },
    [CampaignStatus.Active]: { label: 'Active', tone: 'success' },
    [CampaignStatus.Paused]: { label: 'Paused', tone: 'warning' },
    [CampaignStatus.Completed]: { label: 'Completed', tone: 'neutral' },
    [CampaignStatus.Cancelled]: { label: 'Cancelled', tone: 'danger' },
};

export const CHANNEL_OPTIONS = (Object.keys(CHANNEL) as unknown as CampaignType[])
    .map(k => Number(k) as CampaignType)
    .map(value => ({ value, label: CHANNEL[value].label }));

export const STATUS_OPTIONS = (Object.keys(STATUS) as unknown as CampaignStatus[])
    .map(k => Number(k) as CampaignStatus)
    .map(value => ({ value, label: STATUS[value].label }));

export interface CampaignTransition {
    to: CampaignStatus;
    label: string;
    icon: string;
    /** Ask before applying: the change ends or abandons the campaign. */
    confirm: boolean;
    danger?: boolean;
}

/**
 * Lifecycle moves offered for each status. The server accepts any status on update; these are the moves that make
 * sense in a campaign's life, listed with the usual next step first.
 */
const TRANSITIONS: Record<CampaignStatus, CampaignTransition[]> = {
    [CampaignStatus.Draft]: [
        { to: CampaignStatus.Active, label: 'Launch', icon: 'play', confirm: false },
        { to: CampaignStatus.Scheduled, label: 'Mark scheduled', icon: 'calendar-clock', confirm: false },
        { to: CampaignStatus.Cancelled, label: 'Cancel campaign', icon: 'ban', confirm: true, danger: true },
    ],
    [CampaignStatus.Scheduled]: [
        { to: CampaignStatus.Active, label: 'Launch', icon: 'play', confirm: false },
        { to: CampaignStatus.Draft, label: 'Back to draft', icon: 'rotate-ccw', confirm: false },
        { to: CampaignStatus.Cancelled, label: 'Cancel campaign', icon: 'ban', confirm: true, danger: true },
    ],
    [CampaignStatus.Active]: [
        { to: CampaignStatus.Paused, label: 'Pause', icon: 'pause', confirm: false },
        { to: CampaignStatus.Completed, label: 'Complete', icon: 'circle-check', confirm: true },
        { to: CampaignStatus.Cancelled, label: 'Cancel campaign', icon: 'ban', confirm: true, danger: true },
    ],
    [CampaignStatus.Paused]: [
        { to: CampaignStatus.Active, label: 'Resume', icon: 'play', confirm: false },
        { to: CampaignStatus.Completed, label: 'Complete', icon: 'circle-check', confirm: true },
        { to: CampaignStatus.Cancelled, label: 'Cancel campaign', icon: 'ban', confirm: true, danger: true },
    ],
    [CampaignStatus.Completed]: [],
    [CampaignStatus.Cancelled]: [
        { to: CampaignStatus.Draft, label: 'Restore as draft', icon: 'rotate-ccw', confirm: false },
    ],
};

export function statusOf(c: Campaign): { label: string; tone: BooBadgeTone } {
    return STATUS[c.status] ?? { label: 'Unknown', tone: 'neutral' };
}

export function channelOf(c: Campaign): { label: string; icon: string } {
    return CHANNEL[c.type] ?? { label: 'Unknown channel', icon: 'megaphone' };
}

export function transitionsOf(c: Campaign): CampaignTransition[] {
    return TRANSITIONS[c.status] ?? [];
}

/** The usual next step, shown on the row; ending or cancelling stays in the details panel. */
export function primaryTransitionOf(c: Campaign): CampaignTransition | null {
    const t = transitionsOf(c)[0];
    return t && !t.danger && !t.confirm ? t : null;
}

/** The full update body for a campaign with only its status changed. */
export function withStatus(c: Campaign, status: CampaignStatus): UpdateCampaignRequest {
    return {
        name: c.name,
        type: c.type,
        status,
        audienceSegmentId: c.audienceSegmentId,
        goal: c.goal,
        startDate: c.startDate,
        endDate: c.endDate,
        budget: c.budget,
        spent: c.spent,
        description: c.description,
    };
}

/** Share of the budget spent, 0–100; null when there is no budget. */
export function budgetUse(c: Campaign): number | null {
    if (!c.budget || c.budget <= 0) return null;
    return Math.round((c.spent / c.budget) * 100);
}

/** Parses YYYY-MM-DD (or the date part of an ISO timestamp) as a local date. */
export function parseIsoDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
}

/** Local date as YYYY-MM-DD. */
export function isoDate(d: Date): string {
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

function daysBetween(from: Date, to: Date): number {
    return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * A short note on where today falls in the campaign's schedule, e.g. "Starts in 3 days" or "Ended 4 days ago".
 * Finished or cancelled campaigns get no note; their status already says it.
 */
export function timingOf(c: Campaign, today = new Date()): { text: string; overdue: boolean } | null {
    if (c.status === CampaignStatus.Completed || c.status === CampaignStatus.Cancelled) return null;
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = parseIsoDate(c.startDate);
    const end = parseIsoDate(c.endDate);

    if (start && start > day) {
        const n = daysBetween(day, start);
        return { text: n === 1 ? 'Starts tomorrow' : `Starts in ${plural(n, 'day')}`, overdue: false };
    }
    if (end && end < day) {
        // Still open after its end date: worth a nudge to complete it.
        return { text: `Ended ${plural(daysBetween(end, day), 'day')} ago`, overdue: true };
    }
    if (end) {
        const n = daysBetween(day, end);
        return { text: n === 0 ? 'Ends today' : `${plural(n, 'day')} left`, overdue: false };
    }
    if (start) return { text: 'No end date', overdue: false };
    return null;
}
