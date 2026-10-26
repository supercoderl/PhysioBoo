import { Doctor } from '../../../../shared/types/medical-staff.types';

export interface LookupOption {
    label: string;
    value: string;
}

/** Public profile content a patient sees, checked so gaps can be filled before the doctor is promoted. */
export type ProfileGap = 'photo' | 'specialty' | 'bio' | 'about';

const GAP_LABEL: Record<ProfileGap, string> = {
    photo: 'photo',
    specialty: 'specialty',
    bio: 'short bio',
    about: 'about',
};

export function displayName(d: Doctor): string {
    return d.fullName?.trim() || 'Unnamed doctor';
}

export function initials(d: Doctor): string {
    const parts = (d.fullName ?? '').replace(/^(dr\.?\s+)/i, '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Which of the public profile fields are still empty. */
export function profileGaps(d: Doctor): ProfileGap[] {
    const gaps: ProfileGap[] = [];
    if (!d.avatar) gaps.push('photo');
    if (!d.primarySpecialtyId) gaps.push('specialty');
    if (!d.bio?.trim()) gaps.push('bio');
    if (!d.about?.trim()) gaps.push('about');
    return gaps;
}

/** "Missing photo and short bio", or null when nothing is missing. */
export function gapSummary(d: Doctor): string | null {
    const labels = profileGaps(d).map(g => GAP_LABEL[g]);
    if (!labels.length) return null;
    if (labels.length === 1) return `Missing ${labels[0]}`;
    return `Missing ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

/** The ways a doctor can be seen beyond the clinic, as the booking flags state them. */
export function consultModes(d: Doctor): { icon: string; label: string }[] {
    const modes: { icon: string; label: string }[] = [];
    if (d.isAvailableOnline) modes.push({ icon: 'video', label: 'Online' });
    if (d.isAvailableHomeVisit) modes.push({ icon: 'house', label: 'Home visits' });
    if (d.isAvailableEmergency) modes.push({ icon: 'siren', label: 'Emergency' });
    return modes;
}

/** Languages as stored; older records may come back without the list. */
export function languageList(d: Doctor): string[] {
    return d.languagesSpoken ?? [];
}

export function years(n: number | null | undefined): string {
    const v = Math.max(0, Math.floor(n ?? 0));
    return `${v} ${v === 1 ? 'year' : 'years'}`;
}

/** The licence expiry date as a local date; the server sends a date-only string. */
export function licenceExpiry(d: Doctor): Date | null {
    const raw = d.medicalLicenseExpiry as unknown as string | null;
    if (!raw) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw));
    const date = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(raw);
    // DateOnly.MinValue (0001-01-01) means no expiry was entered.
    return isNaN(date.getTime()) || date.getFullYear() < 1900 ? null : date;
}

export function licenceExpired(d: Doctor): boolean {
    const date = licenceExpiry(d);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

export function isoDate(d: Date): string {
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/**
 * The server turns the search text into a Postgres prefix query; operator characters would make that query
 * invalid and fail the request, so they are dropped before sending.
 */
export function cleanSearch(term: string): string {
    return term.replace(/[&|!():*<>'"\\]/g, ' ').replace(/\s+/g, ' ').trim();
}
