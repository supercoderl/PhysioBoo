/**
 * Rich prescription-workspace types for the enterprise Prescription redesign.
 * Kept separate from shared/types/medication.ts and shared/types/prescription.ts
 * (used by treatment-sheet, print-template, prescription-dispense) so those
 * pages keep working against the thinner legacy shape.
 */

export type PrescriptionRxStatus = 'Draft' | 'Issued' | 'Cancelled' | 'Expired';

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

export type StockStatus = 'InStock' | 'Low' | 'OutOfStock';
export type RxMedicationStatus = 'Active' | 'Held' | 'Discontinued';
export type DoseTiming = 'morning' | 'noon' | 'afternoon' | 'evening';

export interface RxMedicationItem {
    id: string;
    medicineId: string | null;
    name: string;
    genericName?: string | null;
    brandName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    route?: string | null;
    dose: string;
    frequency: string;
    timing: Partial<Record<DoseTiming, boolean>>;
    beforeMeal: boolean;
    afterMeal: boolean;
    prn: boolean;
    durationDays: number;
    quantity: number;
    unit: string;
    refillCount: number;
    instructions?: string | null;
    pharmacyNotes?: string | null;
    insuranceCovered: boolean;
    stockStatus: StockStatus;
    isControlledSubstance: boolean;
    isAntibiotic: boolean;
    isHighAlert: boolean;
    isOtc: boolean;
    isPrescriptionOnly: boolean;
    isCustomMedication: boolean;
    status: RxMedicationStatus;
    unitPrice: number;
    warnings: ClinicalWarning[];
}

export interface RxRiskFlags {
    drugAllergy: boolean;
    pregnancy: boolean;
    pediatric: boolean;
    elderly: boolean;
    highRisk: boolean;
    controlledRestricted: boolean;
}

export interface RxPatientSummary {
    patientId: string;
    avatarUrl?: string | null;
    fullName: string;
    gender: string;
    ageYears: number;
    dateOfBirth: string;
    heightCm?: number | null;
    weightKg?: number | null;
    bloodType?: string | null;
    phone?: string | null;
    insuranceProvider?: string | null;
    insuranceCovered: boolean;
    allergies: string[];
    chronicConditions: string[];
    primaryDiagnosis?: string | null;
    flags: RxRiskFlags;
}

export interface RxDiagnosisEntry {
    code: string;
    description: string;
}

export interface PrescriptionDoctor {
    doctorId: string;
    fullName: string;
    department: string;
    licenseNumber: string;
    avatarUrl?: string | null;
}

export interface PrescriptionSummaryTotals {
    totalMedications: number;
    totalQuantity: number;
    totalDailyDoses: number;
    estimatedCost: number;
    insuranceCoverageAmount: number;
    insuranceCoveragePercent: number;
    patientPayment: number;
    currency: string;
}

export interface PrescriptionDraft {
    id: string;
    prescriptionNumber: string;
    status: PrescriptionRxStatus;
    createdAt: string;
    visitId: string;
    queueNumber: string;
    doctor: PrescriptionDoctor;
    patient: RxPatientSummary;
    primaryDiagnosis: RxDiagnosisEntry | null;
    secondaryDiagnoses: RxDiagnosisEntry[];
    clinicalNotes: string;
    symptoms: string;
    doctorNotes: string;
    items: RxMedicationItem[];
}

export interface MedicineCatalogItem {
    id: string;
    name: string;
    genericName: string;
    brandName: string;
    strength: string;
    dosageForm: string;
    route: string;
    stock: number;
    stockStatus: StockStatus;
    insuranceCovered: boolean;
    unitPrice: number;
    isControlledSubstance: boolean;
    isAntibiotic: boolean;
    isHighAlert: boolean;
    isOtc: boolean;
    isPrescriptionOnly: boolean;
}

export interface FavoriteMedication {
    id: string;
    medicineId: string;
    name: string;
    strength: string;
    dose: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    unit: string;
}

export interface PrescriptionTemplate {
    id: string;
    name: string;
    description: string;
    itemCount: number;
    items: Omit<RxMedicationItem, 'id' | 'warnings'>[];
}

export interface RecentPrescriptionSummary {
    id: string;
    prescriptionNumber: string;
    date: string;
    status: PrescriptionRxStatus;
    medicationNames: string[];
}
