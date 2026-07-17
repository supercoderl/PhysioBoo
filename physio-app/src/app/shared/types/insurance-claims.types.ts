export type ClaimStatus =
  | 'Draft'
  | 'WaitingDocuments'
  | 'ReadyToSubmit'
  | 'Submitted'
  | 'UnderReview'
  | 'NeedCorrection'
  | 'Approved'
  | 'Rejected'
  | 'Appealed'
  | 'Settled';

export type ClaimPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type WorkflowStage =
  | 'Verification'
  | 'DocumentCollection'
  | 'Coding'
  | 'Submission'
  | 'InsuranceReview'
  | 'HospitalResponse'
  | 'Settlement';

export type ClaimQueueDensity = 'compact' | 'comfortable' | 'kanban' | 'timeline';

export type SmartFolder = 'pending' | 'rejected' | 'appealed' | 'approved' | 'archived';

export type DocumentType = 'PDF' | 'Image' | 'Scan' | 'MedicalReport' | 'ClaimForm';

export type DocumentStatus = 'Uploaded' | 'Missing' | 'Verified';

export type TimelineEventType =
  | 'Created'
  | 'Submitted'
  | 'InsurerViewed'
  | 'DocumentsRequested'
  | 'HospitalResponded'
  | 'Approved'
  | 'Rejected'
  | 'Appealed'
  | 'Settled';

export interface WorkflowStageInfo {
  key: WorkflowStage;
  label: string;
  order: number;
}

export const WORKFLOW_STAGES: WorkflowStageInfo[] = [
  { key: 'Verification', label: 'Verification', order: 1 },
  { key: 'DocumentCollection', label: 'Document Collection', order: 2 },
  { key: 'Coding', label: 'Coding', order: 3 },
  { key: 'Submission', label: 'Submission', order: 4 },
  { key: 'InsuranceReview', label: 'Insurance Review', order: 5 },
  { key: 'HospitalResponse', label: 'Hospital Response', order: 6 },
  { key: 'Settlement', label: 'Settlement', order: 7 },
];

export interface InsuranceClaimCard {
  id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  mrn: string;
  providerId: string;
  providerName: string;
  claimAmount: number;
  hospital: string;
  department: string;
  doctorName: string;
  priority: ClaimPriority;
  submissionDate: string | null;
  currentStage: WorkflowStage;
  progressPercent: number;
  status: ClaimStatus;
  missingDocumentsCount: number;
  riskScore: number;
  approvalVelocityDays: number | null;
  updatedAt: string;
}

export interface CoverageSummary {
  totalCoverage: number;
  usedAmount: number;
  availableAmount: number;
  validUntil: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  lineItems: InvoiceLineItem[];
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  required: boolean;
  uploadedAt: string | null;
  uploadedBy: string | null;
  sizeKb: number | null;
  previewUrl: string | null;
}

export interface ClaimTimelineEvent {
  id: string;
  type: TimelineEventType;
  occurredAt: string;
  actor: string;
  note: string | null;
}

export interface CommunicationMessage {
  id: string;
  direction: 'Outbound' | 'Inbound';
  from: string;
  message: string;
  sentAt: string;
}

export interface ClaimNote {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  occurredAt: string;
  details: string | null;
}

export interface InsuranceClaimDetail extends InsuranceClaimCard {
  policyNumber: string;
  coverage: CoverageSummary;
  diagnosis: string;
  procedures: string[];
  hospitalNotes: string | null;
  invoice: InvoiceSummary;
  documents: ClaimDocument[];
  timeline: ClaimTimelineEvent[];
  communication: CommunicationMessage[];
  notes: ClaimNote[];
  auditLogs: AuditLogEntry[];
}

export interface InsuranceProviderNode {
  id: string;
  name: string;
  claimCount: number;
  pendingCount: number;
}

export interface InsuranceClaimStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  appealedClaims: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  avgApprovalVelocityDays: number;
  missingDocumentsCount: number;
  riskScoreAvg: number;
  claimHealthScore: number;
  approvalVelocityTrend: number[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
}

export type ClaimActionMode = 'create' | 'submit' | 'upload' | 'approve' | 'reject' | 'appeal' | 'settle';

export interface CreateInsuranceClaimRequest {
  patientId: string;
  patientName: string;
  providerId: string;
  policyNumber: string;
  diagnosis: string;
  procedures: string[];
  claimAmount: number;
  department: string;
  doctorName: string;
  priority: ClaimPriority;
}
