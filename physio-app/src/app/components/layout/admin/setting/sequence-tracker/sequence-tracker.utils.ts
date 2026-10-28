import { SequenceTracker } from "../../../../../shared/types/system.types";

/**
 * Entity types the server asks a code for (`GenerateNextCodeAsync(...)` call sites). The lookup is an exact,
 * case-sensitive match, so a rule whose type is misspelt is never used and creating that record fails.
 */
export const SEQUENCE_ENTITY_TYPES: string[] = [
    'Admission', 'Appointment', 'AppointmentType', 'Bill', 'Campaign', 'Complaint', 'Doctor', 'Hospital',
    'ImagingOrder', 'InsuranceCompany', 'LabOrder', 'LabTest', 'LabTestCategory', 'Manufacturer', 'MedicineCategory',
    'MemberPoint', 'Patient', 'Payment', 'PointTransaction', 'Reward', 'Supplier', 'SurgeryCase',
];

export type SequenceDateFormat = 'yyyy' | 'yyMM' | 'yyyyMMdd';

export const SEQUENCE_DATE_FORMATS: { label: string; value: SequenceDateFormat | null }[] = [
    { label: 'No date', value: null },
    { label: 'Year (yyyy), e.g. 2026', value: 'yyyy' },
    { label: 'Year and month (yyMM), e.g. 2610', value: 'yyMM' },
    { label: 'Full date (yyyyMMdd), e.g. 20261028', value: 'yyyyMMdd' },
];

/**
 * The server restarts the counter at 1 on the first code of each new day whenever a date part is used
 * (Sys_SequenceTracker.GenerateNext). With a year or month part the date text stays the same across days, so
 * codes repeat; only the full date keeps them unique.
 */
export function dateFormatRepeatsCodes(format: string | null | undefined): boolean {
    return !!format && format !== 'yyyyMMdd';
}

/** Formats `date` with the .NET pattern stored on the rule (only the patterns offered above). */
export function formatDatePart(format: string, date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return format
        .replace('yyyy', String(date.getFullYear()))
        .replace('yy', String(date.getFullYear()).slice(-2))
        .replace('MM', pad(date.getMonth() + 1))
        .replace('dd', pad(date.getDate()));
}

/** prefix + (date + "-") + zero-padded number + suffix, as GenerateNextCodeAsync builds it. */
export function buildSequenceCode(
    rule: Pick<SequenceTracker, 'prefix' | 'useDateFormating' | 'sequenceLength' | 'suffix'>,
    sequence: number,
    date = new Date()
): string {
    const datePart = rule.useDateFormating ? `${formatDatePart(rule.useDateFormating, date)}-` : '';
    const length = Math.max(1, Number(rule.sequenceLength) || 1);
    return `${rule.prefix ?? ''}${datePart}${String(sequence).padStart(length, '0')}${rule.suffix ?? ''}`;
}

/**
 * The number the next code would carry if issued today: 1 when a date part is used and the rule was last touched
 * on an earlier day (the daily restart), otherwise the current number plus one.
 */
export function nextSequenceOf(rule: Pick<SequenceTracker, 'useDateFormating' | 'currentSequence' | 'updatedAt'>, now = new Date()): number {
    if (rule.useDateFormating && rule.updatedAt) {
        const last = new Date(rule.updatedAt);
        if (last.toDateString() !== now.toDateString()) return 1;
    }
    return (Number(rule.currentSequence) || 0) + 1;
}
