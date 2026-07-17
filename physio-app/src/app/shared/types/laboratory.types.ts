export type LabPriority = 'Routine' | 'Urgent' | 'Stat';
export type LabOrderStatus = 'Ordered' | 'Collected' | 'Received' | 'Processing' | 'QualityCheck' | 'Completed' | 'Cancelled';
export type SampleCollectionStatus = 'NotCollected' | 'Collected' | 'InTransit' | 'Received' | 'Rejected';
export type LabVerificationStatus = 'PendingVerification' | 'Verified' | 'Rejected' | 'ReturnedForReview';
export type LabResultFlag = 'N' | 'H' | 'L' | 'HH' | 'LL';
export type LabAlertType = 'PanicValue' | 'Critical' | 'DeltaCheck' | 'OutOfRange' | 'SampleRejected' | 'SampleDelayed' | 'EquipmentFailure';
export type LabAlertSeverity = 'Information' | 'Warning' | 'High' | 'Critical';

export interface LabOrderTest {
  id: string;
  testName: string;
  categoryName: string;
  sampleType: string;
}

export interface LabOrderRow {
  id: string;
  orderNumber: string;
  patientName: string;
  mrn: string;
  visitNumber: string;
  departmentName: string;
  wardName: string;
  tests: LabOrderTest[];
  orderingDoctorName: string;
  priority: LabPriority;
  collectionStatus: SampleCollectionStatus;
  labStatus: LabOrderStatus;
  verificationStatus: LabVerificationStatus;
  orderTime: string;
}

export interface LabSampleTimelineEvent {
  stage: 'Ordered' | 'Collected' | 'Received' | 'Processing' | 'QualityCheck' | 'Completed' | 'Verified' | 'ReportReleased';
  occurredAt: string | null;
}

export interface LabSample {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  testName: string;
  barcode: string;
  sampleType: string;
  containerType: string;
  collectionTime: string | null;
  collectorName: string | null;
  collectionStatus: SampleCollectionStatus;
  timeline: LabSampleTimelineEvent[];
}

export interface LabResultEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  mrn: string;
  testName: string;
  value: string;
  unit: string | null;
  referenceRange: string | null;
  flag: LabResultFlag;
  comments: string | null;
  attachments: string[];
  verifyingTechnicianName: string | null;
  verifyingPathologistName: string | null;
  verificationStatus: LabVerificationStatus;
  verifiedAt: string | null;
}

export interface LabCriticalAlert {
  id: string;
  type: LabAlertType;
  severity: LabAlertSeverity;
  description: string;
  suggestedAction: string;
  patientName: string | null;
  orderNumber: string | null;
  acknowledged: boolean;
  raisedAt: string;
}

export interface LabStats {
  totalOrders: number;
  pendingCollection: number;
  collectedSamples: number;
  inProcessing: number;
  pendingVerification: number;
  completedTests: number;
  criticalResults: number;
  averageTatHours: number;
}

export interface LabDashboardTrendPoint {
  label: string;
  value: number;
}

export interface LabDashboardTrend {
  dailyOrders: LabDashboardTrendPoint[];
  turnaroundTime: LabDashboardTrendPoint[];
  pendingSamplesByStage: LabDashboardTrendPoint[];
  testCategories: LabDashboardTrendPoint[];
  criticalResultRate: number;
  technicianWorkload: LabDashboardTrendPoint[];
}

export interface LabPatientResultSummary {
  patientId: string;
  fullName: string;
  mrn: string;
  visitNumber: string;
  departmentName: string;
}

export interface LabOrderFilter {
  search?: string | null;
  department?: string | null;
  ward?: string | null;
  category?: string | null;
  priority?: LabPriority | null;
  labStatus?: LabOrderStatus | null;
  collectionStatus?: SampleCollectionStatus | null;
  verificationStatus?: LabVerificationStatus | null;
  sampleType?: string | null;
  technician?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}
