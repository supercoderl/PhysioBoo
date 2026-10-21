/**
 * Prescription workspace types, mirroring PrescriptionDraftViewModel and its request models.
 * ClinicalWarning* are also used by the dispensing screens, which keep their own warning shape.
 * Enums travel as numbers (the API has no JSON enum converter); the normalise* helpers accept numbers or names.
 */

export type ClinicalWarningSeverity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';

export type ClinicalWarningType =
    | 'DrugInteraction'
    | 'DuplicateMedication'
    | 'AllergyWarning'
    | 'Contraindication'
    | 'HighDose'
    | 'LowDose'
    | 'PregnancyWarning'
    | 'PediatricWarning'
    | 'RenalAdjustment'
    | 'LiverAdjustment';

export interface ClinicalWarning {
    id: string;
    type: ClinicalWarningType;
    severity: ClinicalWarningSeverity;
    message: string;
    recommendation?: string | null;
    acknowledged: boolean;
}

export type PrescriptionStatus = 'Draft' | 'Issued' | 'Dispensed' | 'PartiallyDispensed' | 'Expired' | 'Cancelled';
export type BeforeAfterMeal = 'Before' | 'After' | 'None';

/** Server enum order: PrescriptionStatus, BeforeAfterMeal. */
export const PRESCRIPTION_STATUSES: PrescriptionStatus[] = ['Draft', 'Issued', 'Dispensed', 'PartiallyDispensed', 'Expired', 'Cancelled'];
export const BEFORE_AFTER_MEALS: BeforeAfterMeal[] = ['Before', 'After', 'None'];

/** Warning as stored on a prescription item (ClinicalWarningViewModel). */
export interface StoredClinicalWarning {
    id: string;
    type: number | string;
    severity: number | string;
    message: string;
    recommendedAction?: string | null;
    acknowledgedBy?: string | null;
    acknowledgedAt?: string | null;
}

export interface PrescriptionItem {
    id: string;
    medicineId: string;
    medicineName: string;
    genericName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    quantityPrescribed: number;
    quantityDispensed: number;
    dosageInstructions: string;
    frequency: string;
    durationInDays: number;
    routeOfAdministration?: string | null;
    specialInstructions?: string | null;
    pricePerUnit: number;
    totalPrice: number;
    isControlledSubstance: boolean;
    timingMorning: boolean;
    timingNoon: boolean;
    timingAfternoon: boolean;
    timingEvening: boolean;
    isPrn: boolean;
    beforeAfterMeal: number | BeforeAfterMeal;
    unit: string;
    refillCount: number;
    isInsuranceCovered: boolean;
    isCatalogVerified: boolean;
    clinicalWarnings: StoredClinicalWarning[];
}

export interface Prescription {
    id: string;
    prescriptionNumber: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    appointmentId: string;
    medicalRecordId: string;
    status: number | PrescriptionStatus;
    prescriptionDate: string;
    diagnosis?: string | null;
    instructions?: string | null;
    totalAmount: number;
    validUntil?: string | null;
    refillCount: number;
    maxRefills: number;
    reasonCancel?: string | null;
    cancelledAt?: string | null;
    issuedAt?: string | null;
    items: PrescriptionItem[];
}

/** One line of the editable item list. `id` is null for a line that has not been saved yet. */
export interface PrescriptionItemInput {
    id: string | null;
    medicineId: string;
    medicineName: string;
    genericName: string | null;
    strength: string | null;
    dosageForm: string | null;
    quantityPrescribed: number;
    dosageInstructions: string;
    frequency: string;
    durationInDays: number;
    routeOfAdministration: string | null;
    specialInstructions: string | null;
    pricePerUnit: number;
    timingMorning: boolean;
    timingNoon: boolean;
    timingAfternoon: boolean;
    timingEvening: boolean;
    isPrn: boolean;
    /** Sent as the enum number: 0 Before, 1 After, 2 None. */
    beforeAfterMeal: number;
    unit: string;
    refillCount: number;
    isInsuranceCovered: boolean;
    isCatalogVerified: boolean;
}

export interface UpdatePrescriptionRequest {
    id: string;
    diagnosis: string | null;
    instructions: string | null;
    items: PrescriptionItemInput[];
}

export interface CdsCheckRequest {
    patientId: string;
    excludePrescriptionId: string | null;
    items: {
        itemKey: string;
        medicineId: string;
        medicineName: string;
        genericName: string | null;
        dosageInstructions: string;
        frequency: string;
        durationInDays: number;
    }[];
}

/** Warning returned by the check endpoint (ClinicalWarningViewModel, not yet stored). */
export type CdsCheckResult = Record<string, StoredClinicalWarning[]>;

/** Medicine search row (MedicineStockViewModel); carries no strength, form, unit or price. */
export interface MedicineSearchResult {
    id: string;
    name: string;
    genericName?: string | null;
    currentStock: number;
    status: string;
    category?: string | null;
}

/** Row of GET /api/medical-records/{patientId}/prescriptions (PrescriptionViewModel). */
export interface PatientPrescriptionRow {
    id: string;
    prescriptionNumber: string;
    prescriptionDate: string;
    doctorName: string;
    diagnosis?: string | null;
    status: number | PrescriptionStatus;
    totalAmount: number;
    prescriptionItemRows: { id: string; medicineName: string }[];
}

export function normalizePrescriptionStatus(value: number | string): PrescriptionStatus {
    return typeof value === 'number' ? (PRESCRIPTION_STATUSES[value] ?? 'Draft') : (value as PrescriptionStatus);
}

export function beforeAfterMealToNumber(value: number | string): number {
    const index = typeof value === 'number' ? value : BEFORE_AFTER_MEALS.indexOf(value as BeforeAfterMeal);
    return index < 0 || index >= BEFORE_AFTER_MEALS.length ? 2 : index;
}

/** Server Severity: 1 Mild, 2 Moderate, 3 Severe, 4 Critical. */
export type WarningSeverityName = 'Mild' | 'Moderate' | 'Severe' | 'Critical';
const WARNING_SEVERITIES: Record<number, WarningSeverityName> = { 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Critical' };

export function normalizeWarningSeverity(value: number | string): WarningSeverityName {
    return typeof value === 'number' ? (WARNING_SEVERITIES[value] ?? 'Mild') : (value as WarningSeverityName);
}

const WARNING_TYPES = ['Drug interaction', 'Duplicate medication', 'Allergy', 'Contraindication', 'High dose', 'Low dose', 'Pregnancy', 'Pediatric', 'Renal adjustment', 'Liver adjustment'];

export function warningTypeLabel(value: number | string): string {
    return typeof value === 'number' ? (WARNING_TYPES[value] ?? 'Warning') : String(value);
}
