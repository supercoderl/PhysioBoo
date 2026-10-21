import { BooBadgeTone } from '@physioboo/ui';
import {
    BEFORE_AFTER_MEALS,
    PrescriptionItem,
    PrescriptionItemInput,
    PrescriptionStatus,
    StoredClinicalWarning,
    WarningSeverityName,
    beforeAfterMealToNumber,
    normalizeWarningSeverity,
} from '../../../../shared/types/prescription-rx.types';

/** An editable medication line plus the warnings shown for it. `key` identifies the line before it has a server id. */
export interface PrescriptionLine {
    key: string;
    input: PrescriptionItemInput;
    stored: StoredClinicalWarning[];
    /** Result of the last "Check warnings" run; null until it has been run for this line. */
    checked: StoredClinicalWarning[] | null;
    quantityDispensed: number;
}

export const STATUS_LABELS: Record<PrescriptionStatus, string> = {
    Draft: 'Draft',
    Issued: 'Issued',
    Dispensed: 'Dispensed',
    PartiallyDispensed: 'Partially dispensed',
    Expired: 'Expired',
    Cancelled: 'Cancelled',
};

export function statusTone(status: PrescriptionStatus): BooBadgeTone {
    switch (status) {
        case 'Issued': return 'primary';
        case 'Dispensed': return 'success';
        case 'PartiallyDispensed':
        case 'Expired': return 'warning';
        case 'Cancelled': return 'danger';
        default: return 'neutral';
    }
}

export function severityTone(severity: WarningSeverityName): BooBadgeTone {
    switch (severity) {
        case 'Critical':
        case 'Severe': return 'danger';
        case 'Moderate': return 'warning';
        default: return 'neutral';
    }
}

export function isUnacknowledgedCritical(w: StoredClinicalWarning): boolean {
    return normalizeWarningSeverity(w.severity) === 'Critical' && !w.acknowledgedAt;
}

export function newLineKey(): string {
    return crypto.randomUUID();
}

export function toInput(item: PrescriptionItem): PrescriptionItemInput {
    return {
        id: item.id,
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        genericName: item.genericName ?? null,
        strength: item.strength ?? null,
        dosageForm: item.dosageForm ?? null,
        quantityPrescribed: item.quantityPrescribed,
        dosageInstructions: item.dosageInstructions,
        frequency: item.frequency,
        durationInDays: item.durationInDays,
        routeOfAdministration: item.routeOfAdministration ?? null,
        specialInstructions: item.specialInstructions ?? null,
        pricePerUnit: item.pricePerUnit,
        timingMorning: item.timingMorning,
        timingNoon: item.timingNoon,
        timingAfternoon: item.timingAfternoon,
        timingEvening: item.timingEvening,
        isPrn: item.isPrn,
        beforeAfterMeal: beforeAfterMealToNumber(item.beforeAfterMeal),
        unit: item.unit,
        refillCount: item.refillCount,
        isInsuranceCovered: item.isInsuranceCovered,
        isCatalogVerified: item.isCatalogVerified,
    };
}

export function toLine(item: PrescriptionItem): PrescriptionLine {
    return { key: item.id, input: toInput(item), stored: item.clinicalWarnings ?? [], checked: null, quantityDispensed: item.quantityDispensed };
}

export function lineTotal(input: PrescriptionItemInput): number {
    return input.quantityPrescribed * input.pricePerUnit;
}

export function formatAmount(amount: number): string {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount);
}

/** "Morning, Evening", "As needed" or an empty string when the prescriber set no timing. */
export function timingLabel(input: PrescriptionItemInput): string {
    const parts = [
        input.timingMorning && 'Morning',
        input.timingNoon && 'Noon',
        input.timingAfternoon && 'Afternoon',
        input.timingEvening && 'Evening',
        input.isPrn && 'As needed',
    ].filter(Boolean) as string[];
    return parts.join(', ');
}

export function mealLabel(value: number): string {
    const meal = BEFORE_AFTER_MEALS[value];
    return meal === 'Before' ? 'Before meals' : meal === 'After' ? 'After meals' : '';
}
