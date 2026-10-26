import { BooBadgeTone } from '@physioboo/ui';
import { PatientType, RiskLevel } from '../../../../shared/enums/patient';
import { Patient } from '../../../../shared/types/patient.types';

export const PATIENT_TYPE_LABEL: Record<PatientType, string> = {
    [PatientType.Outpatient]: 'Outpatient',
    [PatientType.Inpatient]: 'Inpatient',
    [PatientType.Emergency]: 'Emergency',
    [PatientType.Referral]: 'Referral',
};

/** Low risk stays neutral so colour only draws the eye to patients who need attention. */
export const RISK: Record<RiskLevel, { label: string; tone: BooBadgeTone }> = {
    [RiskLevel.Low]: { label: 'Low risk', tone: 'neutral' },
    [RiskLevel.Medium]: { label: 'Medium risk', tone: 'warning' },
    [RiskLevel.High]: { label: 'High risk', tone: 'danger' },
    [RiskLevel.Critical]: { label: 'Critical', tone: 'danger' },
};

export const PATIENT_TYPE_OPTIONS = Object.entries(PATIENT_TYPE_LABEL).map(([value, label]) => ({ value: Number(value) as PatientType, label }));
export const RISK_OPTIONS = [
    { value: RiskLevel.Low, label: 'Low' },
    { value: RiskLevel.Medium, label: 'Medium' },
    { value: RiskLevel.High, label: 'High' },
    { value: RiskLevel.Critical, label: 'Critical' },
];

export function riskOf(p: Patient): { label: string; tone: BooBadgeTone } {
    return RISK[p.riskLevel] ?? { label: 'Unknown risk', tone: 'neutral' };
}

export function patientTypeOf(p: Patient): string {
    return PATIENT_TYPE_LABEL[p.patientType] ?? '—';
}

/** Short labels for the flags set on a patient, in a fixed order. */
export function flagsOf(p: Patient): string[] {
    const flags: string[] = [];
    if (p.isVip) flags.push('VIP');
    if (p.isChronicPatient) flags.push('Chronic');
    if (p.isSeniorCitizen) flags.push('Senior');
    return flags;
}

export function displayName(p: Patient): string {
    return p.fullName?.trim() || 'Unnamed patient';
}

export function initials(p: Patient): string {
    const parts = (p.fullName ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

/**
 * Age in whole years. The server sends a placeholder birth date when a patient has no personal profile, so a
 * patient without a name is treated as having no known age.
 */
export function ageOf(p: Patient, today = new Date()): number | null {
    if (!p.fullName?.trim() || !p.dateOfBirth) return null;
    const dob = parseIsoDate(p.dateOfBirth);
    if (!dob) return null;
    let age = today.getFullYear() - dob.getFullYear();
    const beforeBirthday = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
    if (beforeBirthday) age--;
    return age >= 0 && age < 150 ? age : null;
}

export function genderOf(p: Patient): string {
    if (!p.fullName?.trim()) return '';
    return p.gender === 'PreferNotToSay' ? 'Not stated' : p.gender || '';
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

/**
 * The server turns the search text into a Postgres prefix query; operator characters would make that query
 * invalid and fail the request, so they are dropped before sending.
 */
export function cleanSearch(term: string): string {
    return term.replace(/[&|!():*<>'"\\]/g, ' ').replace(/\s+/g, ' ').trim();
}
