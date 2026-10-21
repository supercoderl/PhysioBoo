import { BooBadgeTone } from '@physioboo/ui';
import { Admission, AdmissionRecordStatus, AdmissionType } from '../../../../shared/types/admission.types';

export const ADMISSION_STATUS: Record<AdmissionRecordStatus, { label: string; tone: BooBadgeTone }> = {
    Admitted: { label: 'Admitted', tone: 'success' },
    Discharged: { label: 'Discharged', tone: 'neutral' },
    Cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const ADMISSION_TYPES: AdmissionType[] = ['Emergency', 'Scheduled', 'Transfer', 'Outpatient'];

export const ADMISSION_TYPE_TONE: Record<AdmissionType, BooBadgeTone> = {
    Emergency: 'danger',
    Scheduled: 'primary',
    Transfer: 'warning',
    Outpatient: 'neutral',
};

export function admissionStatus(status: string): { label: string; tone: BooBadgeTone } {
    return ADMISSION_STATUS[status as AdmissionRecordStatus] ?? { label: status || 'Unknown', tone: 'neutral' };
}

export function admissionTypeTone(type: string): BooBadgeTone {
    return ADMISSION_TYPE_TONE[type as AdmissionType] ?? 'neutral';
}

/** The server only edits and discharges an admission while the patient is still admitted. */
export function isActive(a: Admission): boolean {
    return a.status === 'Admitted';
}

/** Local date as YYYY-MM-DD. */
export function isoDate(d: Date): string {
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Local time as HH:mm. */
export function isoTime(d: Date): string {
    return `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`;
}

/** Local wall-clock date and time without a timezone: the server stores local times. */
export function toLocalDateTime(date: string, time: string): string {
    return `${date}T${time.length === 5 ? time + ':00' : time}`;
}
