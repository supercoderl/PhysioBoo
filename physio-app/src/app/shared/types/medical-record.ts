export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  doctor: string;
  notes: string;
  prescriptions: string[];
}