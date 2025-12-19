export interface Bed {
  id: string;
  number: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  patientName?: string;
  patientId?: string;
  admissionDate?: string;
  wardType: string;
}