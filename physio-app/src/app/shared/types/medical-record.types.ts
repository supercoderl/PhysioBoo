/**
 * EMR types. Each type mirrors a real server entity so the frontend never holds
 * a field the backend can't populate. Enum string literals match the server's
 * PascalCase enum names verbatim (System.Text.Json with JsonStringEnumConverter).
 */

import { Severity } from "../enums/severity";

// ─── Server enums (verbatim) ─────────────────────────────────────────────
export type RecordType = 'Consultation' | 'Diagnosis' | 'Treatment' | 'Surgery' | 'Discharge' | 'FollowUp' | 'Emergency';
export type PrescriptionStatus = 'Active' | 'Dispensed' | 'PartiallyDispensed' | 'Expired' | 'Cancelled';
export type LabOrderStatus = 'Ordered' | 'SampleCollected' | 'Processing' | 'Completed' | 'Cancelled' | 'ReportReady';
export type LabItemStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export type ImagingOrderStatus = 'Ordered' | 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'ReportPending';
export type ReportStatus = 'Draft' | 'Final' | 'Amended' | 'Cancelled';
export type CurrentStatus = 'Active' | 'Resolved' | 'Managed' | 'Cured' | 'InRemission';
export type AllergenType = 'Food' | 'Drug' | 'Environmental' | 'Contact' | 'Insect';
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'CheckedIn' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow' | 'Rescheduled';
export type LabPriority = 'Routine' | 'Urgent' | 'Stat' | 'Emergency';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded' | 'Waived';
export type BillType = 'Consultation' | 'Pharmacy' | 'Laboratory' | 'Radiology' | 'Procedure' | 'Admission' | 'Emergency' | 'Package';
export type PaymentMethod = 'Cash' | 'Card' | 'BankTransfer' | 'Insurance' | 'MobilePayment' | 'Other';
export type AccessLevel = 'Public' | 'Restricted' | 'Confidential';

// ─── Patient context (sticky header) ────────────────────────────────────
export type AdmissionStatus = 'Outpatient' | 'Admitted' | 'ED' | 'ICU' | 'Observation' | 'Discharged';

export interface RiskFlag {
  /** Derived on the server from PatientAllergy / Patient.RiskLevel / IsChronicPatient. */
  key: 'allergy' | 'critical' | 'chronic' | 'fall' | 'infection' | 'isolation';
  label: string;
  severity: Severity;
  note?: string | null;
}

export interface CareTeamMember {
  userId: string;
  fullName: string;
  role: string;                      // 'Primary Physician' | 'Cardiologist' | 'Nurse'…
  department?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface PatientContext {
  patientId: string;
  mrn: string;                       // PatientNumber
  fullName: string;
  avatarUrl?: string | null;
  gender: string;
  dateOfBirth: string;               // ISO
  ageYears: number;
  bloodType?: string | null;
  phone?: string | null;
  email?: string | null;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  insuranceExpiryDate?: string | null;
  admissionStatus: AdmissionStatus;
  roomNumber?: string | null;
  admittedAt?: string | null;
  primaryDoctor?: CareTeamMember | null;
  careTeam: CareTeamMember[];
  riskFlags: RiskFlag[];
}

// ─── Clinical snapshot (KPI strip) ──────────────────────────────────────
export interface RecentLabAlert {
  labOrderItemId: string;
  testName: string;
  resultValue: string;
  resultUnit?: string | null;
  abnormalFlag?: string | null;     // 'H' | 'L' | 'HH' | 'LL'
  isCritical: boolean;
  resultedAt: string;
}

export interface UpcomingAppointment {
  appointmentId: string;
  scheduledAt: string;
  doctorName: string;
  department: string;
  status: AppointmentStatus;
}

export interface ClinicalSnapshot {
  activeDiagnosesCount: number;
  activeMedicationsCount: number;
  knownAllergiesCount: number;
  pendingOrdersCount: number;
  recentLabAlerts: RecentLabAlert[];
  upcomingAppointments: UpcomingAppointment[];
  outstandingBalance: number;
  currency: string;
}

// ─── Overview: demographics / contacts / history ────────────────────────
export interface PatientDemographics {
  patientId: string;
  fullName: string;
  preferredName?: string | null;
  gender: string;
  dateOfBirth: string;
  maritalStatus?: string | null;
  nationality?: string | null;
  preferredLanguage?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
}

/**
 * Derived from the most recent `MedicalRecord` for the patient — backend should
 * return the latest non-null string in each field across the patient's records.
 */
export interface HistoricalSummary {
  pastMedicalHistory?: string | null;
  familyHistory?: string | null;
  socialHistory?: string | null;
  reviewOfSystems?: string | null;
  lastUpdatedAt?: string | null;
  lastUpdatedByName?: string | null;
}

// ─── Allergies (PatientAllergy) ─────────────────────────────────────────
export interface PatientAllergy {
  id: string;
  allergenName: string;
  allergenType: AllergenType;
  reactionType?: string | null;
  severity: Severity;
  firstOccurrenceDate?: string | null;
  lastOccurrenceDate?: string | null;
  treatmentGiven?: string | null;
  notes?: string | null;
  isActive: boolean;
}

// ─── Encounters tab (Appointment) ───────────────────────────────────────
export interface EncounterRow {
  appointmentId: string;
  appointmentNumber: string;
  scheduledAt: string;
  endedAt?: string | null;
  status: AppointmentStatus;
  consultationType: string;                  // 'InPerson' | 'Telehealth'
  doctorName: string;
  departmentName: string;
  appointmentTypeName?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  followUpDate?: string | null;
  durationMinutes?: number | null;
  roomNumber?: string | null;
  totalAmount: number;
}

// ─── Diagnoses tab (PatientMedicalHistory) ──────────────────────────────
export interface DiagnosisRow {
  id: string;
  conditionName: string;
  conditionCategory?: string | null;
  icd10Code?: string | null;
  diagnosedDate?: string | null;
  diagnosedByName?: string | null;
  diagnosisHospitalName?: string | null;
  severity: Severity;
  currentStatus: CurrentStatus;
  treatmentSummary?: string | null;
  medicationsPrescribed?: string | null;
  followUpRequired: boolean;
  nextReviewDate?: string | null;
  notes?: string | null;
}

// ─── Prescriptions tab (Prescription + PrescriptionItem) ────────────────
export interface PrescriptionItemRow {
  id: string;
  medicineName: string;
  genericName?: string | null;
  strength?: string | null;
  dosageForm?: string | null;
  dosageInstructions: string;
  frequency: string;
  durationDays: number;
  routeOfAdministration?: string | null;
  quantityPrescribed: number;
  quantityDispensed: number;
  isControlledSubstance: boolean;
  specialInstructions?: string | null;
}

export interface PrescriptionRow {
  id: string;
  prescriptionNumber: string;
  prescriptionDate: string;
  doctorName: string;
  diagnosis?: string | null;
  instructions?: string | null;
  status: PrescriptionStatus;
  validUntil?: string | null;
  refillCount: number;
  maxRefills: number;
  totalAmount: number;
  items: PrescriptionItemRow[];
}

// ─── Laboratory tab (LabOrder + LabOrderItem + LabReport) ───────────────
export interface LabResultRow {
  id: string;                          // LabOrderItemId
  labOrderId: string;
  panelName?: string | null;           // grouping (LabTest.Category if available)
  testName: string;
  resultValue?: string | null;
  resultUnit?: string | null;
  referenceRange?: string | null;
  abnormalFlag?: string | null;        // 'H' | 'L' | 'HH' | 'LL' | 'N'
  isCritical: boolean;
  status: LabItemStatus;
  collectedAt?: string | null;
  resultedAt?: string | null;
  orderingDoctorName: string;
  verifiedByName?: string | null;
}

export interface LabReportRow {
  id: string;
  reportNumber: string;
  labOrderId: string;
  reportedAt: string;
  pathologistName?: string | null;
  overallImpression?: string | null;
  recommendations?: string | null;
  criticalValues?: string | null;
  isFinal: boolean;
  reportPdfUrl?: string | null;
}

// ─── Imaging tab (ImagingOrder + ImagingReport) ─────────────────────────
export interface ImagingStudyRow {
  orderId: string;
  reportId?: string | null;
  orderNumber: string;
  modalityName: string;                // 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET'
  bodyPart?: string | null;
  studyDate?: string | null;
  orderStatus: ImagingOrderStatus;
  reportStatus?: ReportStatus | null;
  radiologistName?: string | null;
  technique?: string | null;
  findings?: string | null;
  impression?: string | null;
  recommendations?: string | null;
  isCritical: boolean;
  isNormal: boolean;
  imagesCount: number;
  dicomStudyUid?: string | null;
  reportPdfUrl?: string | null;
  imagesUrl?: string | null;
}

// ─── Clinical Notes tab (MedicalRecord) ─────────────────────────────────
export interface ClinicalNoteRow {
  id: string;                          // MedicalRecord.Id
  recordNumber: string;
  recordType: RecordType;
  recordDate: string;
  doctorName: string;
  appointmentNumber?: string | null;
  chiefComplaint?: string | null;
  historyOfPresentIllness?: string | null;
  physicalExamination?: string | null;
  provisionalDiagnosis?: string | null;
  finalDiagnosis?: string | null;
  icd10Codes: string[];
  treatmentPlan?: string | null;
  followUpInstructions?: string | null;
  doctorNotes?: string | null;
  dischargeSummary?: string | null;
  isConfidential: boolean;
  accessLevel: AccessLevel;
}

// ─── Billing tab (Bill + Payment) ───────────────────────────────────────
export interface BillRow {
  id: string;
  billNumber: string;
  billDate: string;
  type: BillType;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
  dueDate?: string | null;
  currency: string;
  appointmentNumber?: string | null;
  insuranceClaimNumber?: string | null;
  insurancePaidAmount: number;
  patientCopayAmount: number;
}

export interface PaymentRow {
  id: string;
  paymentNumber: string;
  billNumber: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  receiptUrl?: string | null;
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

// ─── Legacy alias kept so older imports still compile ──────────────────
export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  doctor: string;
  notes: string;
  prescriptions: string[];
}
