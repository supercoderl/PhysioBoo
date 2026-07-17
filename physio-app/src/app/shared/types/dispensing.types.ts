/**
 * Clinical Dispensing Workspace types — see docs/prescription-dispense-redesign.md.
 * Kept separate from prescription-rx.ts (prescribing) and retail-pos.ts (retail checkout);
 * dispensing reuses ClinicalWarning from prescription-rx.ts so CDS warnings raised at
 * prescribing time carry through to dispensing.
 */
import { ClinicalWarning, ClinicalWarningSeverity } from "./prescription-rx.types";

export type DispenseQueueStatus =
    | 'Waiting'
    | 'Verifying'
    | 'Preparing'
    | 'Dispensing'
    | 'Completed'
    | 'Cancelled'
    | 'OnHold';

export type DispensePriority = 'Critical' | 'High' | 'Normal';

export type DispenseProgressStage =
    | 'Received'
    | 'ClinicalVerification'
    | 'InventoryPicking'
    | 'BarcodeValidation'
    | 'Packaging'
    | 'Ready'
    | 'Dispensed'
    | 'Completed';

export const DISPENSE_PROGRESS_STAGES: { stage: DispenseProgressStage; label: string }[] = [
    { stage: 'Received', label: 'Received' },
    { stage: 'ClinicalVerification', label: 'Clinical Verification' },
    { stage: 'InventoryPicking', label: 'Inventory Picking' },
    { stage: 'BarcodeValidation', label: 'Barcode Validation' },
    { stage: 'Packaging', label: 'Packaging' },
    { stage: 'Ready', label: 'Ready' },
    { stage: 'Dispensed', label: 'Dispensed' },
    { stage: 'Completed', label: 'Completed' },
];

export interface DispenseQueueItem {
    queueId: string;
    queueNumber: number;
    prescriptionNumber: string;
    patientId: string;
    patientName: string;
    mrn: string;
    wardOrClinic: string;
    priority: DispensePriority;
    prescribingDoctor: string;
    medicationCount: number;
    createdAt: string;
    status: DispenseQueueStatus;
}

export type DispenseItemStatus = 'NotPicked' | 'Picked' | 'Verified' | 'Dispensed' | 'OnHold' | 'Replaced' | 'Reserved';

export interface BatchOption {
    batchNo: string;
    expiryDate: string;
    quantityAvailable: number;
    location: string;
    isNearExpiry: boolean;
    isExpired: boolean;
}

export interface DispenseMedicineAlternative {
    id: string;
    name: string;
    manufacturer: string;
    stock: number;
}

export interface DispenseMedicationItem {
    id: string;
    medicineId: string;
    name: string;
    genericName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    route?: string | null;
    dose: string;
    frequency: string;
    durationDays: number;
    qtyPrescribed: number;
    qtyToDispense: number;
    unit: string;
    status: DispenseItemStatus;
    shelfLocation: string;
    batchNo: string;
    expiryDate: string;
    availableBatches: BatchOption[];
    isControlledSubstance: boolean;
    isHighAlert: boolean;
    warnings: ClinicalWarning[];
    alternatives: DispenseMedicineAlternative[];
}

export interface DispensePatientSummary {
    patientId: string;
    fullName: string;
    mrn: string;
    gender: string;
    ageYears: number;
    allergies: string[];
    allergyFreeText?: string | null;
    chronicConditions: string[];
    primaryDiagnosis?: string | null;
    insuranceProvider?: string | null;
    insuranceCovered: boolean;
    isPregnant: boolean;
    isPediatric: boolean;
    isElderly: boolean;
    isHighRisk: boolean;
}

export interface DispenseWorkspace {
    workspaceId: string;
    queueId: string;
    prescriptionNumber: string;
    status: DispenseQueueStatus;
    currentStage: DispenseProgressStage;
    prescribingDoctor: string;
    createdAt: string;
    dispensingStartedAt?: string | null;
    patient: DispensePatientSummary;
    items: DispenseMedicationItem[];
    pharmacistNotes: string;
}

export interface DispenseSummary {
    workspaceId: string;
    itemsDispensedCount: number;
    itemsRemainingCount: number;
    inventoryChangesCount: number;
    insuranceCoverageAmount: number;
    patientPaymentAmount: number;
    dispensingTimeSeconds: number;
    pharmacistName: string;
}

export interface DispenseQueueStats {
    pendingCount: number;
    inProgressCount: number;
    completedTodayCount: number;
    averageDispensingMinutes: number;
}

export interface DispenseMedicineDetail {
    medicineId: string;
    name: string;
    genericName: string;
    manufacturer: string;
    stockByLocation: { location: string; quantity: number }[];
    alternatives: DispenseMedicineAlternative[];
    interactionWarnings: string[];
    dispensingHistory: { date: string; quantity: number; pharmacist: string }[];
}

export function severityRank(severity: ClinicalWarningSeverity): number {
    switch (severity) {
        case 'Critical': return 4;
        case 'High': return 3;
        case 'Medium': return 2;
        case 'Low': return 1;
        default: return 0;
    }
}
