/** Ported (trimmed to the read-only rows the Patient "Records" tab displays) from physio-app's medical-record.types.ts. */

export interface HistoricalSummary {
    pastMedicalHistory?: string | null;
    familyHistory?: string | null;
    socialHistory?: string | null;
    reviewOfSystems?: string | null;
    lastUpdatedAt?: string | null;
}

export interface PrescriptionItemRow {
    medicineName: string;
    dosage?: string | null;
    frequency?: string | null;
    duration?: string | null;
    instructions?: string | null;
}

export interface PrescriptionRow {
    id: string;
    prescriptionNumber: string;
    prescriptionDate: string;
    doctorName: string;
    diagnosis?: string | null;
    instructions?: string | null;
    status: string;
    validUntil?: string | null;
    totalAmount: number;
    items: PrescriptionItemRow[];
}

export interface LabResultRow {
    id: string;
    labOrderId: string;
    panelName?: string | null;
    testName: string;
    resultValue?: string | null;
    resultUnit?: string | null;
    referenceRange?: string | null;
    abnormalFlag?: string | null;
    isCritical: boolean;
    status: string;
    resultedAt?: string | null;
    orderingDoctorName: string;
}

export interface LabReportRow {
    id: string;
    reportNumber: string;
    labOrderId: string;
    reportedAt: string;
    overallImpression?: string | null;
    isFinal: boolean;
    reportPdfUrl?: string | null;
}

export interface ImagingStudyRow {
    orderId: string;
    reportId?: string | null;
    orderNumber: string;
    modalityName: string;
    bodyPart?: string | null;
    studyDate?: string | null;
    orderStatus: string;
    reportStatus?: string | null;
    impression?: string | null;
    isCritical: boolean;
    isNormal: boolean;
}

export interface BillRow {
    id: string;
    billNumber: string;
    billDate: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
}

export interface PaymentRow {
    id: string;
    paidAt: string;
    amount: number;
    method: string;
}

export interface BillingSummary {
    currency: string;
    totalCharges: number;
    totalPayments: number;
    insurancePaid: number;
    outstandingBalance: number;
    bills: BillRow[];
    recentPayments: PaymentRow[];
}
