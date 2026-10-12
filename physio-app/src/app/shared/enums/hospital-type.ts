/**
 * Must mirror PhysioBoo.Domain.Enums.HospitalType (sent to the API as its numeric value).
 */
export enum HospitalType {
    General = 0,
    Specialty = 1,
    Teaching = 2,
    Research = 3,
    Clinic = 4,
    Emergency = 5,
    Rehabilitation = 6
}

export const HOSPITAL_TYPE_LABELS: Record<HospitalType, string> = {
    [HospitalType.General]: 'General hospital',
    [HospitalType.Specialty]: 'Specialty hospital',
    [HospitalType.Teaching]: 'Teaching hospital',
    [HospitalType.Research]: 'Research hospital',
    [HospitalType.Clinic]: 'Clinic',
    [HospitalType.Emergency]: 'Emergency center',
    [HospitalType.Rehabilitation]: 'Rehabilitation center',
};

/** Falls back to the raw value so an enum member added on the server never renders blank. */
export function hospitalTypeLabel(type: HospitalType | number | string | null | undefined): string {
    if (type === null || type === undefined) return '—';
    return HOSPITAL_TYPE_LABELS[type as HospitalType] ?? String(type);
}
