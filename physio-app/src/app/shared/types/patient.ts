import { PatientType, RiskLevel } from "../enums/patient";

export interface Patient {
  id: string;
  userId: string | null;
  patientNumber: string;
  fullName: string;
  dateOfBirth: Date | null;
  gender: string | null;
  bloodType: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  patientType: PatientType;
  riskLevel: RiskLevel;
  primaryDoctorId: string | null;
  occupation: string | null;
  isVip: boolean;
  isSeniorCitizen: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  totalVisits: number;
  totalAmountSpent: number;
  loyaltyPoints: number;
  lastVisitDate: Date | null;
  nextFollowUpDate: Date | null;
  isActive: boolean;
  createdAt: Date;
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