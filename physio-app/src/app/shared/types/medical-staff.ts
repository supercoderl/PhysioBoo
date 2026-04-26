import { EmploymentStatus } from "../enums/employment-status";

export interface MedicalSpecialty {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  description?: string | null;
  requiredQualifications?: string | null;
  averageConsultationDuration: number;
  isSurgical: boolean;
  isDiagnostic: boolean;
  parentSpecialtyId?: string | null;
  iconUrl?: string | null;
  createdAt: Date;
}

export interface Doctor {
  id: string;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  about: string | null;
  languagesSpoken: string[];
  isAvailableOnline: boolean;
  isAvailableHomeVisit: boolean;
  isAvailableEmergency: boolean;
  isFeature: boolean;
  isVerified: boolean;
  primarySpecialtyId: string | null;
  medicalLicenseNumber: string;
  medicalLicenseExpiry: Date;
  medicalLicenseIssuingAuthority: string | null;
  yearsOfExperience: number;
  yearsOfPractice: number;
  archivements: string | null;
  researchInterests: string | null;
  publicationsCount: number;
  conferencePresentations: number;
  consultationFeeMin: number;
  consultationFeeMax: number;
  followUpFee: number;
  emergencyConsultationFee: number;
  homeVisitFee: number;
  videoConsultationFee: number;
  consultationDuration: number;
  bufferTime: number;
  advanceBookingDays: number;
  cancellationPolicy: string | null;
  employeeId: string | null;
  employmentStatus: EmploymentStatus;
  joiningDate: Date | null;
  terminationDate: Date | null;
  bankAccountDetails: string | null;
  paymentMethods: string[];
  panNumber: string | null;
  gstin: string | null;
  totalPatientTreated: number;
  successRate: number;
  patientSatisfactionScore: number;
  averageRating: number;
  totalReviews: number;
  totalSurgeriesPerformed: number;
  verificationDate: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface DoctorProfile {
  userId: string;
  bio: string | null;
  about: string | null;
  languagesSpoken: string[];
  yearsOfExperience: number;
  consultationFeeMin: number;
  consultationFeeMax: number;
  averageRating: number;
  totalReviews: number;
}