import { BooBadgeTone } from '@physioboo/ui';
import { Member, MemberStatus, MembershipTier } from '../../../../shared/types/member.types';
import { RewardCategory } from '../../../../shared/types/reward.types';

/** Tiers in programme order, as the server names them. */
export const TIERS: MembershipTier[] = ['Basic', 'Silver', 'Gold', 'Platinum'];
export const STATUSES: MemberStatus[] = ['active', 'inactive', 'suspended'];

/** Only suspension draws colour; inactive members simply fade back. */
export const STATUS: Record<MemberStatus, { label: string; tone: BooBadgeTone }> = {
    active: { label: 'Active', tone: 'success' },
    inactive: { label: 'Inactive', tone: 'neutral' },
    suspended: { label: 'Suspended', tone: 'danger' },
};

const TIER_TONE: Record<MembershipTier, BooBadgeTone> = {
    Basic: 'neutral',
    Silver: 'neutral',
    Gold: 'warning',
    Platinum: 'primary',
};

export const REWARD_CATEGORY: Record<RewardCategory, string> = {
    discount: 'Discount',
    service: 'Service',
    product: 'Product',
    voucher: 'Voucher',
};

export const TIER_OPTIONS = TIERS.map(t => ({ value: t, label: t }));
export const STATUS_OPTIONS = STATUSES.map(s => ({ value: s, label: STATUS[s].label }));

/** Matches the server's add-points validation. */
export const MAX_POINTS_PER_ADD = 1_000_000;
/** Matches the server's description length limit for point transactions. */
export const MAX_NOTE_LENGTH = 255;

export function statusOf(m: Member): { label: string; tone: BooBadgeTone } {
    return STATUS[m.status] ?? { label: m.status || 'Unknown', tone: 'neutral' };
}

export function tierToneOf(m: Member): BooBadgeTone {
    return TIER_TONE[m.membershipType] ?? 'neutral';
}

export function memberName(m: Member): string {
    return m.name?.trim() || 'Unnamed member';
}

export function memberInitials(m: Member): string {
    const parts = (m.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (parts[0][0] + last).toUpperCase();
}

/** The server matches the text anywhere in the member number, name, email or phone. */
export function cleanMemberSearch(term: string): string {
    return term.replace(/\s+/g, ' ').trim();
}

/** Server error text for a failed request, when the response carries one meant for the user. */
export function serverMessage(err: unknown): string | null {
    const e = err as { status?: number; error?: { message?: string; errors?: unknown } } | null;
    if (!e || e.status === 0 || (e.status ?? 0) >= 500) return null;
    if (e.status === 403) return "You don't have permission to do this.";
    const errors = e.error?.errors;
    const first = Array.isArray(errors) ? errors[0] : null;
    return e.error?.message || (typeof first === 'string' ? first : null);
}
