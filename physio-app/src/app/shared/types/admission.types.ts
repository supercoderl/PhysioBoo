export type AdmissionType = 'Emergency' | 'Scheduled' | 'Transfer' | 'Outpatient';
export type AdmissionRecordStatus = 'Admitted' | 'Discharged' | 'Cancelled';

/** Mirrors server PhysioBoo.Application.ViewModels.Admissions.AdmissionViewModel. */
export interface Admission {
  id: string;
  admissionNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  admissionType: AdmissionType;
  status: AdmissionRecordStatus;
  admittedAt: string;
  departmentId: string;
  departmentName: string | null;
  doctorId: string;
  doctorName: string | null;
  referredBy: string | null;
  chiefComplaint: string;
  provisionalDiagnosis: string;
  allergies: string | null;
  currentMedications: string | null;
  medicalHistory: string | null;
  hasInsurance: boolean;
  insuranceProvider: string | null;
  policyNumber: string | null;
  bedId: string | null;
  bedNumber: string | null;
  wardName: string | null;
  dischargedAt: string | null;
  dischargeNotes: string | null;
}

/** Existing patients only. When bedId is set the bed is assigned in the same transaction. */
export interface CreateAdmissionRequest {
  patientId: string;
  admissionType: AdmissionType;
  admittedAt: string;
  departmentId: string;
  doctorId: string;
  referredBy: string | null;
  bedId: string | null;
  expectedDischargeDate: string | null;
  chiefComplaint: string;
  provisionalDiagnosis: string;
  allergies: string | null;
  currentMedications: string | null;
  medicalHistory: string | null;
  hasInsurance: boolean;
  insuranceProvider: string | null;
  policyNumber: string | null;
}

export interface UpdateAdmissionRequest {
  admissionType: AdmissionType;
  departmentId: string;
  doctorId: string;
  referredBy: string | null;
  chiefComplaint: string;
  provisionalDiagnosis: string;
  allergies: string | null;
  currentMedications: string | null;
  medicalHistory: string | null;
  hasInsurance: boolean;
  insuranceProvider: string | null;
  policyNumber: string | null;
}

export interface DischargeAdmissionRequest {
  dischargedAt?: string | null;
  notes?: string | null;
}
