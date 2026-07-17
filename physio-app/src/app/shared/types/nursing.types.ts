export type ShiftCode = 'Day' | 'Evening' | 'Night';

export type AcuityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlertType = 'FallRisk' | 'Isolation' | 'Emergency' | 'Allergy' | 'AbnormalVitals';

export type TaskStatus = 'Pending' | 'Overdue' | 'Completed' | 'Cancelled';

export type MarStatus = 'Due' | 'Given' | 'Missed' | 'Held';

export interface NursingRiskFlags {
  fallRisk: boolean;
  isolationRequired: boolean;
  isolationType?: string | null;
  isEmergency: boolean;
  hasAllergies: boolean;
}

export interface NursingPatient {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  avatarUrl?: string | null;
  wardId: string;
  wardName: string;
  bedNumber: string;
  age: number;
  gender: string;
  primaryDoctorName?: string | null;
  acuity: AcuityLevel;
  risk: NursingRiskFlags;
  nextTaskLabel?: string | null;
  nextTaskDueAt?: string | null;
  marDueCount: number;
  lastVitalsAt?: string | null;
}

export interface NursingStats {
  assignedPatients: number;
  openTasks: number;
  overdueTasks: number;
  activeAlerts: number;
}

export interface NursingAlert {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  raisedAt: string;
  acknowledged: boolean;
}

export interface VitalsReading {
  id: string;
  patientId: string;
  recordedAt: string;
  recordedBy: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  spo2: number;
  isAbnormal: boolean;
}

export interface MarEntry {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  route: string;
  scheduledAt: string;
  status: MarStatus;
  givenAt?: string | null;
  givenBy?: string | null;
  reason?: string | null;
}

export type IntakeOutputCategory = 'Oral' | 'IV' | 'Urine' | 'Drain' | 'Other';

export interface IntakeOutputEntry {
  id: string;
  patientId: string;
  recordedAt: string;
  recordedBy: string;
  direction: 'Intake' | 'Output';
  category: IntakeOutputCategory;
  volumeMl: number;
  notes?: string | null;
}

export interface NursingTask {
  id: string;
  patientId: string;
  label: string;
  dueAt: string;
  status: TaskStatus;
  assignedNurseName: string;
}

export interface ShiftHandoverCard {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  outgoingShift: ShiftCode;
  incomingShift: ShiftCode;
  acknowledged: boolean;
  acknowledgedBy?: string | null;
}

export interface NursingAssignmentFilter {
  shift: ShiftCode;
  wardId?: string | null;
  search?: string | null;
  riskFlag?: 'FallRisk' | 'Isolation' | 'Emergency' | null;
  taskState?: 'Overdue' | 'DueSoon' | null;
}
