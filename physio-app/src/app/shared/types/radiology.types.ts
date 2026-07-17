export type RadiologyPriority = 'Routine' | 'Urgent' | 'Stat';
export type ImagingOrderStatus = 'Ordered' | 'Scheduled' | 'Arrived' | 'InProgress' | 'ImagingCompleted' | 'ImageUploaded' | 'Cancelled';
export type ReportStatus = 'NotStarted' | 'Reporting' | 'PendingVerification' | 'Verified' | 'Released' | 'Rejected' | 'ReturnedForRevision';
export type QueueStatus = 'Waiting' | 'Called' | 'InProgress' | 'Completed' | 'Cancelled';
export type RadiologyAlertType = 'CriticalFinding' | 'UrgentFinding' | 'IncidentalFinding' | 'FollowUpRequired' | 'EquipmentDowntime';
export type RadiologyAlertSeverity = 'Information' | 'Warning' | 'High' | 'Critical';
export type StudyTimelineStage = 'Ordered' | 'Scheduled' | 'Arrived' | 'ImagingStarted' | 'ImagingCompleted' | 'ImageUploaded' | 'Reporting' | 'Verified' | 'Released';

export interface ImagingExamination {
  id: string;
  examinationName: string;
  modalityName: string;
  bodyPart: string;
}

export interface ImagingOrderRow {
  id: string;
  orderNumber: string;
  patientName: string;
  mrn: string;
  visitNumber: string;
  departmentName: string;
  wardName: string;
  examinations: ImagingExamination[];
  orderingDoctorName: string;
  priority: RadiologyPriority;
  scheduledTime: string | null;
  status: ImagingOrderStatus;
  reportStatus: ReportStatus;
  radiologistName: string | null;
  technicianName: string | null;
  orderTime: string;
}

export interface ScheduleSlot {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  examinationName: string;
  modalityName: string;
  roomName: string;
  technicianName: string | null;
  scheduledTime: string;
  estimatedDurationMinutes: number;
  preparationInstructions: string | null;
  status: ImagingOrderStatus;
}

export interface QueueEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  examinationName: string;
  modalityName: string;
  priority: RadiologyPriority;
  roomName: string;
  status: QueueStatus;
  calledAt: string | null;
}

export interface StudyTimelineEvent {
  stage: StudyTimelineStage;
  occurredAt: string | null;
}

export interface StudyRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  mrn: string;
  examinationName: string;
  modalityName: string;
  bodyPart: string;
  technique: string | null;
  studyDate: string | null;
  imagesCount: number;
  dicomStudyUid: string | null;
  isCritical: boolean;
  timeline: StudyTimelineEvent[];
  comparisonStudyIds: string[];
}

export interface RadiologyReportTemplate {
  id: string;
  name: string;
  modalityName: string;
  isFavorite: boolean;
  clinicalIndication: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations: string;
}

export interface RadiologyReport {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  clinicalIndication: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations: string;
  attachments: string[];
  reportingRadiologistName: string | null;
  verifyingRadiologistName: string | null;
  status: ReportStatus;
  lastSavedAt: string | null;
  verifiedAt: string | null;
}

export interface CriticalFindingAlert {
  id: string;
  type: RadiologyAlertType;
  severity: RadiologyAlertSeverity;
  description: string;
  patientName: string | null;
  orderNumber: string | null;
  acknowledged: boolean;
  notified: boolean;
  raisedAt: string;
}

export interface RadiologyStats {
  totalOrders: number;
  waitingForScheduling: number;
  scheduledStudies: number;
  inProgress: number;
  pendingReporting: number;
  pendingVerification: number;
  completedStudies: number;
  criticalFindings: number;
  averageTatHours: number;
}

export interface RadiologyDashboardTrendPoint {
  label: string;
  value: number;
}

export interface RadiologyDashboardTrend {
  imagingVolume: RadiologyDashboardTrendPoint[];
  turnaroundTime: RadiologyDashboardTrendPoint[];
  modalityUtilization: RadiologyDashboardTrendPoint[];
  pendingReportsByStatus: RadiologyDashboardTrendPoint[];
  criticalFindingRate: number;
  radiologistWorkload: RadiologyDashboardTrendPoint[];
  equipmentUtilization: RadiologyDashboardTrendPoint[];
}

export interface RadiologyPatientStudySummary {
  patientId: string;
  fullName: string;
  mrn: string;
  visitNumber: string;
  departmentName: string;
}

export interface ImagingOrderFilter {
  search?: string | null;
  department?: string | null;
  ward?: string | null;
  modality?: string | null;
  examinationType?: string | null;
  priority?: RadiologyPriority | null;
  status?: ImagingOrderStatus | null;
  reportStatus?: ReportStatus | null;
  radiologist?: string | null;
  technician?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}
