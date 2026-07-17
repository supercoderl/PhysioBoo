export type AlertSeverityLevel = 'Information' | 'Warning' | 'High' | 'Critical';
export type ClinicalAlertType = 'Allergy' | 'DrugInteraction' | 'AbnormalLab' | 'CriticalVitals' | 'InfectionControl' | 'Isolation' | 'PendingCriticalOrder';

export type OrderType = 'Doctor' | 'Medication' | 'Procedure' | 'Lab' | 'Imaging' | 'Nursing';
export type OrderPriority = 'Routine' | 'Urgent' | 'Stat';
export type OrderStatus = 'Active' | 'Pending' | 'Completed' | 'Cancelled' | 'OnHold';

export type AdministrationStatus = 'Scheduled' | 'Given' | 'Missed' | 'Refused' | 'Held';
export type ProcedureStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
export type SampleStatus = 'NotCollected' | 'Collected' | 'InTransit' | 'Received';
export type LabResultStatus = 'Pending' | 'Partial' | 'Final' | 'Critical';
export type ImagingOrderStatus = 'Ordered' | 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
export type ProgressNoteType = 'Doctor' | 'Nursing' | 'Consultation';

export type TimelineCategory = 'DoctorOrder' | 'MedicationOrder' | 'Procedure' | 'LabOrder' | 'ImagingOrder' | 'NursingActivity' | 'ProgressNote' | 'CompletedTask';
export type TimelineRangeKey = 'Today' | 'Last24Hours' | 'Last7Days' | 'Custom';

export interface TreatmentPatientSummary {
  patientId: string;
  fullName: string;
  avatarUrl?: string | null;
  mrn: string;
  visitNumber: string;
  bedNumber: string;
  wardName: string;
  departmentName: string;
  admissionDate: string;
  primaryDiagnosis?: string | null;
  allergies: string[];
  isolationStatus?: string | null;
  attendingDoctorName: string;
}

export interface TreatmentStats {
  activeOrders: number;
  completedOrders: number;
  pendingOrders: number;
  medicationDue: number;
  criticalAlerts: number;
  pendingLabs: number;
  pendingImaging: number;
}

export interface ClinicalAlert {
  id: string;
  type: ClinicalAlertType;
  severity: AlertSeverityLevel;
  message: string;
  raisedAt: string;
  acknowledged: boolean;
}

export interface TreatmentTimelineEntry {
  id: string;
  category: TimelineCategory;
  title: string;
  detail?: string | null;
  occurredAt: string;
  actorName?: string | null;
  status?: string | null;
}

export interface TreatmentOrder {
  id: string;
  orderType: OrderType;
  orderName: string;
  priority: OrderPriority;
  frequency?: string | null;
  startTime: string;
  endTime?: string | null;
  orderingDoctorName: string;
  status: OrderStatus;
}

export interface MedicationAdministration {
  id: string;
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  scheduledTime: string;
  status: AdministrationStatus;
  administeredByName?: string | null;
  notes?: string | null;
}

export interface TreatmentProcedureRow {
  id: string;
  name: string;
  status: ProcedureStatus;
  department: string;
  scheduledTime: string;
  completionTime?: string | null;
  performerName?: string | null;
}

export interface TreatmentLabOrderRow {
  id: string;
  testName: string;
  sampleStatus: SampleStatus;
  resultStatus: LabResultStatus;
  isCritical: boolean;
  orderedAt: string;
}

export interface TreatmentImagingOrderRow {
  id: string;
  studyName: string;
  status: ImagingOrderStatus;
  reportAvailable: boolean;
  imagesAvailable: boolean;
  scheduledTime?: string | null;
}

export interface TreatmentProgressNote {
  id: string;
  type: ProgressNoteType;
  content: string;
  authorName: string;
  writtenAt: string;
}

export interface TreatmentOrderFilter {
  search?: string | null;
  orderType?: OrderType | null;
  status?: OrderStatus | null;
  priority?: OrderPriority | null;
}

export interface TreatmentTimelineFilter {
  range: TimelineRangeKey;
  from?: string | null;
  to?: string | null;
}
