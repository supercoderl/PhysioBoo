export type BedStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
export type BedType = 'Standard' | 'ICU' | 'Isolation' | 'Pediatric' | 'Surgical Recovery';

export interface Bed {
  id: string;
  number: string;
  roomNumber?: string | null;
  wardId: string;
  wardName?: string | null;
  floor: number;
  bedType: BedType;
  status: BedStatus;
  isolationRequired?: boolean;
  patientId?: string | null;
  patientName?: string | null;
  patientNumber?: string | null;
  admissionDate?: string | null;
  expectedDischargeDate?: string | null;
  notes?: string | null;
}

export interface BedHistoryEntry {
  id: string;
  bedId: string;
  patientId: string;
  patientName: string;
  admissionDate: string;
  dischargeDate?: string | null;
  assignedBy?: string | null;
}

export interface AssignPatientRequest {
  patientId: string;
  expectedDischargeDate?: string | null;
  notes?: string | null;
}

export interface DischargeRequest {
  dischargeDate?: string | null;
  notes?: string | null;
}
