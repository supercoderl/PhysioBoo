import { PatientType, RiskLevel } from "../enums/patient";

export interface Patient {
  id: string;
  patientNumber: string;
  patientType: PatientType;
  primaryDoctorId: string;
  totalVisits: number;
  totalAmountSpent: number;
  loyaltyPoints: number;
  riskLevel: RiskLevel;
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
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  photo: string;
  registrationDate: string;
}