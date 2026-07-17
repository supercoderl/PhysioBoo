export type SurgeryPriority = 'Elective' | 'Urgent' | 'Emergency';
export type SurgeryStatus =
  | 'Scheduled' | 'PatientArrived' | 'PreOpReady' | 'AnesthesiaStarted'
  | 'InProgress' | 'ProcedureCompleted' | 'Recovery' | 'Discharged'
  | 'Delayed' | 'Cancelled';
export type OperatingRoomStatus = 'Available' | 'Preparing' | 'Ready' | 'InSurgery' | 'Cleaning' | 'Maintenance' | 'Closed';
export type SurgicalTeamRole = 'PrimarySurgeon' | 'AssistantSurgeon' | 'Anesthesiologist' | 'ScrubNurse' | 'CirculatingNurse' | 'Technician';
export type TeamMemberAvailability = 'Assigned' | 'Available' | 'Unavailable';
export type EquipmentCategory = 'Equipment' | 'InstrumentSet' | 'Implant' | 'Consumable';
export type EquipmentStatus = 'Available' | 'Reserved' | 'InUse' | 'Sterilizing' | 'Missing';
export type ChecklistItemStatus = 'Pending' | 'Completed' | 'NotApplicable';
export type SurgeryTimelineStage =
  | 'Scheduled' | 'PatientArrived' | 'PreOpCompleted' | 'AnesthesiaStarted'
  | 'SurgeryStarted' | 'ProcedureCompleted' | 'Recovery' | 'DischargedFromOr';
export type SurgeryAlertType =
  | 'MissingConsent' | 'Allergy' | 'EquipmentMissing' | 'DelayedSurgery'
  | 'CriticalLabResult' | 'CriticalImagingFinding' | 'BloodNotAvailable' | 'OrConflict';
export type SurgeryAlertSeverity = 'Information' | 'Warning' | 'High' | 'Critical';
export type ConsentStatus = 'NotObtained' | 'Pending' | 'Signed';

export interface SurgicalTeamMember {
  id: string;
  staffId: string;
  name: string;
  role: SurgicalTeamRole;
  availability: TeamMemberAvailability;
}

export interface EquipmentItem {
  id: string;
  equipmentId: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  quantity: number;
}

export interface PreOpChecklistItem {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  signedBy: string | null;
  signedAt: string | null;
}

export interface SurgeryTimelineEvent {
  stage: SurgeryTimelineStage;
  occurredAt: string | null;
}

export interface OperatingRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  status: OperatingRoomStatus;
  currentSurgeryId: string | null;
  currentProcedure: string | null;
  surgeonName: string | null;
  patientName: string | null;
  startTime: string | null;
  estimatedFinishTime: string | null;
  equipmentReady: boolean;
}

export interface SurgeryRow {
  id: string;
  surgeryNumber: string;
  patientName: string;
  mrn: string;
  procedure: string;
  surgeryType: string;
  department: string;
  primarySurgeon: string;
  assistantSurgeon: string | null;
  anesthesiologist: string | null;
  operatingRoomNumber: string;
  scheduledStart: string;
  estimatedDurationMinutes: number;
  priority: SurgeryPriority;
  status: SurgeryStatus;
}

export interface SurgeryCase extends SurgeryRow {
  diagnosis: string;
  surgicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  consentStatus: ConsentStatus;
  riskAssessment: string;
  team: SurgicalTeamMember[];
  equipment: EquipmentItem[];
  checklist: PreOpChecklistItem[];
  timeline: SurgeryTimelineEvent[];
  notes: string | null;
  complications: string | null;
  bloodLossMl: number | null;
  estimatedRemainingMinutes: number | null;
  pacuBay: string | null;
  recoveryStatus: string | null;
  postOpNotes: string | null;
  followUpOrders: string | null;
}

export interface SurgeryStats {
  totalScheduled: number;
  ongoing: number;
  completed: number;
  delayed: number;
  emergency: number;
  availableRooms: number;
  occupiedRooms: number;
  averageDurationMinutes: number;
  orUtilizationRate: number;
}

export interface SurgeryDashboardTrendPoint {
  label: string;
  value: number;
}

export interface SurgeryDashboardTrend {
  orUtilizationByRoom: SurgeryDashboardTrendPoint[];
  surgeryVolume: SurgeryDashboardTrendPoint[];
  delayRate: number;
  emergencyCases: SurgeryDashboardTrendPoint[];
  procedureDistribution: SurgeryDashboardTrendPoint[];
  averageDuration: SurgeryDashboardTrendPoint[];
  cancellationRate: number;
}

export interface SurgeryPatientSummary {
  patientId: string;
  fullName: string;
  mrn: string;
  diagnosis: string;
  allergies: string[];
  consentStatus: ConsentStatus;
  riskAssessment: string;
}

export interface SurgeryCriticalAlert {
  id: string;
  type: SurgeryAlertType;
  severity: SurgeryAlertSeverity;
  description: string;
  suggestedAction: string;
  patientName: string | null;
  surgeryNumber: string | null;
  acknowledged: boolean;
  raisedAt: string;
}

export interface SurgeryFilter {
  search?: string | null;
  operatingRoom?: string | null;
  department?: string | null;
  surgeon?: string | null;
  assistantSurgeon?: string | null;
  anesthesiologist?: string | null;
  surgeryType?: string | null;
  priority?: SurgeryPriority | null;
  status?: SurgeryStatus | null;
  emergencyOnly?: boolean | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}
