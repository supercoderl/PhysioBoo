export interface AdmissionForm {
  // Patient Information
  patientId: string;
  patientType: 'new' | 'existing';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Admission Details
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  referredBy: string;
  department: string;
  assignedDoctor: string;
  wardType: string;
  bedNumber: string;
  
  // Medical Information
  chiefComplaint: string;
  provisionalDiagnosis: string;
  allergies: string;
  currentMedications: string;
  medicalHistory: string;
  
  // Insurance
  hasInsurance: boolean;
  insuranceProvider: string;
  policyNumber: string;
}