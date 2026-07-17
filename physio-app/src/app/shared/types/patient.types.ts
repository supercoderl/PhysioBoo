import { PatientType, RiskLevel } from "../enums/patient";

/**
 * Mirrors server PhysioBoo.Application.ViewModels.Patients.PatientViewModel.
 * Field spellings (incl. the "Inssurance" typo) follow the server contract.
 */
export interface Patient {
  id: string;
  patientNumber: string;

  patientType: PatientType;
  riskLevel: RiskLevel;

  primaryDoctorId: string;
  preferredDoctorId: string | null;
  preferredHospitalId: string | null;
  preferredAppointmentTime: string | null;

  referredBy: string | null;
  referralHospitalId: string | null;

  inssuranceProvider: string | null;
  inssurancePolicyNumber: string | null;
  inssuranceExpiryDate: string | null;
  inssuranceCoverageAmount: number | null;

  isVip: boolean;
  isSeniorCitizen: boolean;
  isChronicPatient: boolean;

  medicalHistory: string | null;
  familyHistory: string | null;
  surgicalHistory: string | null;
  allergyInformation: string | null;
  currentMedications: string | null;
  lifestyleNotes: string | null;

  occupation: string | null;
  annualIncomeRange: string | null;

  communicationPreferences: string | null;

  consentForResearch: boolean;
  consentForMarketing: boolean;
  dataSharingConsent: boolean;

  registrationDate: string | null;
  lastVisitDate: string | null;
  nextFollowUpDate: string | null;

  totalVisits: number;
  totalAmountSpent: number;
  outstandingBalance: number;
  loyaltyPoints: number;
}

/** Mirrors server CreatePatientViewModel. */
export interface CreatePatientRequest {
  primaryDoctorId: string;
  referredBy: string | null;
  referralHospitalId: string | null;

  inssuranceProvider: string | null;
  inssurancePolicyNumber: string | null;
  inssuranceExpiryDate: string | null;
  inssuranceCoverageAmount: number | null;

  medicalHistory: string | null;
  familyHistory: string | null;
  surgicalHistory: string | null;
  allergyInformation: string | null;
  currentMedications: string | null;
  lifestyleNotes: string | null;

  occupation: string | null;
  annualIncomeRange: string | null;

  preferredHospitalId: string | null;
  preferredDoctorId: string | null;
  preferredAppointmentTime: string | null;
  communicationPreferences: string | null;
}

/** Mirrors server UpdatePatientViewModel. */
export interface UpdatePatientRequest {
  patientType: PatientType;
  primaryDoctorId: string;
  preferredHospitalId: string | null;
  preferredDoctorId: string | null;
  preferredAppointmentTime: string | null;

  inssuranceProvider: string | null;
  inssurancePolicyNumber: string | null;
  inssuranceExpiryDate: string | null;
  inssuranceCoverageAmount: number | null;

  isVip: boolean;
  isSeniorCitizen: boolean;
  isChronicPatient: boolean;
  riskLevel: RiskLevel;

  medicalHistory: string | null;
  familyHistory: string | null;
  surgicalHistory: string | null;
  allergyInformation: string | null;
  currentMedications: string | null;
  lifestyleNotes: string | null;

  occupation: string | null;
  annualIncomeRange: string | null;
  communicationPreferences: string | null;

  consentForResearch: boolean;
  consentForMarketing: boolean;
  dataSharingConsent: boolean;
}

export interface PaymentSummary {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  phone: string;
  address: string;
}

export interface PatientProfile {
  userId: string;
  patientNumber: string;
  patientType: PatientType;
  occupation: string | null;
  isVip: boolean;
  isSeniorCitizen: boolean;
  primaryDoctorId: string;
  lastVisitDate: Date | null;
  nextFollowUpDate: Date | null;
  totalVisits: number;
}
