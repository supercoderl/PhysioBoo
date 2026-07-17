import { Injectable, inject } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import {
  AuditLogEntry,
  ClaimDocument,
  ClaimNote,
  ClaimPriority,
  ClaimTimelineEvent,
  CommunicationMessage,
  CreateInsuranceClaimRequest,
  InsuranceClaimCard,
  InsuranceClaimDetail,
  InsuranceClaimStats,
  InsuranceProviderNode,
  WorkflowStage,
} from "../../shared/types/insurance-claims.types";
import { LoadingKeys } from "../../shared/types/loading";
import { HttpService } from "../common/http.service";

/**
 * Insurance Claims data layer. Every method calls the planned REST endpoint (see
 * docs/insurance-claims-redesign.md §9) and falls back to bundled mock data when the
 * call fails (404 while backend is being implemented). When the backend lands,
 * no caller changes are needed — the live response simply wins.
 */
@Injectable({ providedIn: 'root' })
export class InsuranceClaimsService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // #region Methods
  getStats() {
    return this.httpSrv.getOr<InsuranceClaimStats>(BASE_API.INSURANCE_CLAIMS.STATS, MOCK.stats, LoadingKeys.INSURANCE_CLAIMS.STATS);
  }

  getProvidersTree() {
    return this.httpSrv.getOr<InsuranceProviderNode[]>(BASE_API.INSURANCE_CLAIMS.PROVIDERS_TREE, MOCK.providers, LoadingKeys.INSURANCE_CLAIMS.PROVIDERS_TREE);
  }

  getClaims() {
    return this.httpSrv.getOr<PaginationData<InsuranceClaimCard>>(BASE_API.INSURANCE_CLAIMS.CLAIMS_SEARCH, MOCK.claims(), LoadingKeys.INSURANCE_CLAIMS.CLAIMS_SEARCH);
  }

  getClaimDetail(claimId: string) {
    return this.httpSrv.getOr<InsuranceClaimDetail>(BASE_API.INSURANCE_CLAIMS.CLAIM_DETAIL(claimId), MOCK.claimDetail(claimId), LoadingKeys.INSURANCE_CLAIMS.CLAIM_DETAIL);
  }

  createClaim(payload: CreateInsuranceClaimRequest) {
    return this.httpSrv.postOr<InsuranceClaimDetail>(BASE_API.INSURANCE_CLAIMS.CLAIM_CREATE, payload, MOCK.claimDetail('new'), LoadingKeys.INSURANCE_CLAIMS.CLAIM_CREATE);
  }

  submitClaim(claimId: string, notes?: string) {
    return this.httpSrv.postOr<InsuranceClaimCard>(BASE_API.INSURANCE_CLAIMS.CLAIM_SUBMIT(claimId), { notes }, MOCK.cardById(claimId), LoadingKeys.INSURANCE_CLAIMS.CLAIM_SUBMIT);
  }

  approveClaim(claimId: string, approvedAmount: number, notes?: string) {
    return this.httpSrv.postOr<InsuranceClaimCard>(BASE_API.INSURANCE_CLAIMS.CLAIM_APPROVE(claimId), { approvedAmount, notes }, MOCK.cardById(claimId), LoadingKeys.INSURANCE_CLAIMS.CLAIM_APPROVE);
  }

  rejectClaim(claimId: string, reason: string) {
    return this.httpSrv.postOr<InsuranceClaimCard>(BASE_API.INSURANCE_CLAIMS.CLAIM_REJECT(claimId), { reason }, MOCK.cardById(claimId), LoadingKeys.INSURANCE_CLAIMS.CLAIM_REJECT);
  }

  appealClaim(claimId: string, groundsForAppeal: string) {
    return this.httpSrv.postOr<InsuranceClaimCard>(BASE_API.INSURANCE_CLAIMS.CLAIM_APPEAL(claimId), { groundsForAppeal }, MOCK.cardById(claimId), LoadingKeys.INSURANCE_CLAIMS.CLAIM_APPEAL);
  }

  settleClaim(claimId: string, settledAmount: number, settlementDate: string, method: string) {
    return this.httpSrv.postOr<InsuranceClaimCard>(BASE_API.INSURANCE_CLAIMS.CLAIM_SETTLE(claimId), { settledAmount, settlementDate, method }, MOCK.cardById(claimId), LoadingKeys.INSURANCE_CLAIMS.CLAIM_SETTLE);
  }

  uploadDocument(claimId: string, file: File, documentType: string) {
    const form = new FormData();
    form.append('claimId', claimId);
    form.append('documentType', documentType);
    form.append('file', file);
    return this.httpSrv.postOr<ClaimDocument>(BASE_API.INSURANCE_CLAIMS.UPLOAD, form, MOCK.newDocument(file.name), LoadingKeys.INSURANCE_CLAIMS.UPLOAD);
  }

  getTimeline(claimId: string) {
    return this.httpSrv.getOr<ClaimTimelineEvent[]>(BASE_API.INSURANCE_CLAIMS.TIMELINE(claimId), MOCK.claimDetail(claimId).timeline, LoadingKeys.INSURANCE_CLAIMS.TIMELINE);
  }

  getNotes(claimId: string) {
    return this.httpSrv.getOr<ClaimNote[]>(BASE_API.INSURANCE_CLAIMS.NOTES(claimId), MOCK.claimDetail(claimId).notes, LoadingKeys.INSURANCE_CLAIMS.NOTES);
  }

  addNote(claimId: string, message: string) {
    return this.httpSrv.postOr<ClaimNote>(BASE_API.INSURANCE_CLAIMS.NOTES(claimId), { message }, MOCK.newNote(message), LoadingKeys.INSURANCE_CLAIMS.NOTES);
  }

  getCommunication(claimId: string) {
    return this.httpSrv.getOr<CommunicationMessage[]>(BASE_API.INSURANCE_CLAIMS.COMMUNICATION(claimId), MOCK.claimDetail(claimId).communication, LoadingKeys.INSURANCE_CLAIMS.COMMUNICATION);
  }

  sendMessage(claimId: string, message: string) {
    return this.httpSrv.postOr<CommunicationMessage>(BASE_API.INSURANCE_CLAIMS.COMMUNICATION(claimId), { message, direction: 'Outbound' }, MOCK.newMessage(message), LoadingKeys.INSURANCE_CLAIMS.COMMUNICATION);
  }

  getAuditLogs(claimId: string) {
    return this.httpSrv.getOr<AuditLogEntry[]>(BASE_API.INSURANCE_CLAIMS.AUDIT_LOGS(claimId), MOCK.claimDetail(claimId).auditLogs, LoadingKeys.INSURANCE_CLAIMS.AUDIT_LOGS);
  }
  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

const MOCK = {
  stats: <InsuranceClaimStats>{
    totalClaims: 62,
    pendingClaims: 27,
    approvedClaims: 21,
    rejectedClaims: 8,
    appealedClaims: 6,
    totalClaimAmount: 1_842_500_000,
    totalApprovedAmount: 1_204_300_000,
    avgApprovalVelocityDays: 6.4,
    missingDocumentsCount: 14,
    riskScoreAvg: 31,
    claimHealthScore: 78,
    approvalVelocityTrend: [8, 7, 9, 5, 6, 4, 6],
  },

  providers: <InsuranceProviderNode[]>[
    { id: 'prov-1', name: 'Bao Viet Insurance', claimCount: 22, pendingCount: 9 },
    { id: 'prov-2', name: 'PVI Insurance', claimCount: 15, pendingCount: 6 },
    { id: 'prov-3', name: 'Manulife Vietnam', claimCount: 11, pendingCount: 5 },
    { id: 'prov-4', name: 'AIA Vietnam', claimCount: 8, pendingCount: 4 },
    { id: 'prov-5', name: 'Prudential Vietnam', claimCount: 6, pendingCount: 3 },
  ],

  claims: (): PaginationData<InsuranceClaimCard> => ({
    ...PaginationDataWithInit<InsuranceClaimCard>(),
    items: RAW_CLAIMS,
    totalCount: RAW_CLAIMS.length,
  }),

  cardById: (claimId: string): InsuranceClaimCard =>
    RAW_CLAIMS.find(c => c.id === claimId) ?? RAW_CLAIMS[0],

  claimDetail: (claimId: string): InsuranceClaimDetail => {
    const card = RAW_CLAIMS.find(c => c.id === claimId) ?? RAW_CLAIMS[0];
    return {
      ...card,
      policyNumber: `POL-${card.mrn}`,
      coverage: {
        totalCoverage: 500_000_000,
        usedAmount: 125_000_000,
        availableAmount: 375_000_000,
        validUntil: daysFromNow(240),
      },
      diagnosis: 'Acute lower back pain with lumbar disc herniation (M51.2)',
      procedures: ['Physiotherapy session (30 min)', 'Spinal traction therapy', 'Therapeutic ultrasound'],
      hospitalNotes: 'Patient responded well to conservative treatment; continuing 6-session physiotherapy plan.',
      invoice: {
        subtotal: card.claimAmount * 0.94,
        discount: card.claimAmount * 0.02,
        tax: card.claimAmount * 0.08,
        total: card.claimAmount,
        lineItems: [
          { id: 'li-1', description: 'Physiotherapy session x6', quantity: 6, unitPrice: 350_000, amount: 2_100_000 },
          { id: 'li-2', description: 'Spinal traction therapy x3', quantity: 3, unitPrice: 420_000, amount: 1_260_000 },
          { id: 'li-3', description: 'Therapeutic ultrasound x4', quantity: 4, unitPrice: 180_000, amount: 720_000 },
        ],
      },
      documents: [
        { id: 'doc-1', name: 'Claim Form.pdf', type: 'ClaimForm', status: 'Verified', required: true, uploadedAt: daysFromNow(-4), uploadedBy: 'Front Desk', sizeKb: 220, previewUrl: null },
        { id: 'doc-2', name: 'Medical Report.pdf', type: 'MedicalReport', status: 'Verified', required: true, uploadedAt: daysFromNow(-4), uploadedBy: 'Dr. Tran', sizeKb: 512, previewUrl: null },
        { id: 'doc-3', name: 'Hospital Invoice.pdf', type: 'PDF', status: 'Uploaded', required: true, uploadedAt: daysFromNow(-3), uploadedBy: 'Cashier', sizeKb: 180, previewUrl: null },
        { id: 'doc-4', name: 'X-Ray Scan.jpg', type: 'Scan', status: card.missingDocumentsCount > 0 ? 'Missing' : 'Uploaded', required: true, uploadedAt: null, uploadedBy: null, sizeKb: null, previewUrl: null },
        { id: 'doc-5', name: 'ID Card Copy.jpg', type: 'Image', status: 'Uploaded', required: false, uploadedAt: daysFromNow(-4), uploadedBy: 'Front Desk', sizeKb: 96, previewUrl: null },
      ],
      timeline: [
        { id: 'tl-1', type: 'Created', occurredAt: daysFromNow(-5), actor: 'Front Desk', note: 'Claim case opened' },
        { id: 'tl-2', type: 'Submitted', occurredAt: daysFromNow(-3), actor: 'Claims Processor', note: null },
        { id: 'tl-3', type: 'InsurerViewed', occurredAt: daysFromNow(-2), actor: card.providerName, note: null },
        { id: 'tl-4', type: 'DocumentsRequested', occurredAt: daysFromNow(-1), actor: card.providerName, note: 'Requesting updated X-ray scan' },
      ],
      communication: [
        { id: 'cm-1', direction: 'Outbound', from: 'Claims Processor', message: 'Submitted claim with supporting documents.', sentAt: daysFromNow(-3) },
        { id: 'cm-2', direction: 'Inbound', from: card.providerName, message: 'Please provide the updated X-ray scan to proceed with review.', sentAt: daysFromNow(-1) },
      ],
      notes: [
        { id: 'nt-1', author: 'Claims Processor', message: 'Patient confirmed X-ray was taken at partner clinic; requesting copy.', createdAt: daysFromNow(-1) },
      ],
      auditLogs: [
        { id: 'al-1', action: 'Claim created', actor: 'Front Desk', occurredAt: daysFromNow(-5), details: null },
        { id: 'al-2', action: 'Documents attached', actor: 'Front Desk', occurredAt: daysFromNow(-4), details: '3 documents' },
        { id: 'al-3', action: 'Claim submitted', actor: 'Claims Processor', occurredAt: daysFromNow(-3), details: null },
      ],
    };
  },

  newDocument: (name: string): ClaimDocument => ({
    id: `doc-${Date.now()}`, name, type: 'PDF', status: 'Uploaded', required: false,
    uploadedAt: new Date().toISOString(), uploadedBy: 'You', sizeKb: 128, previewUrl: null,
  }),

  newNote: (message: string): ClaimNote => ({
    id: `nt-${Date.now()}`, author: 'You', message, createdAt: new Date().toISOString(),
  }),

  newMessage: (message: string): CommunicationMessage => ({
    id: `cm-${Date.now()}`, direction: 'Outbound', from: 'You', message, sentAt: new Date().toISOString(),
  }),
};

const stage = (s: WorkflowStage) => s;
const priority = (p: ClaimPriority) => p;

const RAW_CLAIMS: InsuranceClaimCard[] = [
  { id: 'clm-1', claimNumber: 'CLM-2026-000142', patientName: 'Nguyen Van Hai', patientId: 'pat-1', mrn: 'PAT-2026-000142', providerId: 'prov-1', providerName: 'Bao Viet Insurance', claimAmount: 12_500_000, hospital: 'PhysioBoo Central Clinic', department: 'Rehabilitation', doctorName: 'Dr. Tran Minh', priority: priority('High'), submissionDate: daysFromNow(-3), currentStage: stage('InsuranceReview'), progressPercent: 62, status: 'UnderReview', missingDocumentsCount: 1, riskScore: 24, approvalVelocityDays: null, updatedAt: daysFromNow(-1) },
  { id: 'clm-2', claimNumber: 'CLM-2026-000138', patientName: 'Le Thi Bich', patientId: 'pat-2', mrn: 'PAT-2026-000138', providerId: 'prov-2', providerName: 'PVI Insurance', claimAmount: 4_200_000, hospital: 'PhysioBoo Central Clinic', department: 'Orthopedic Rehab', doctorName: 'Dr. Pham Quoc', priority: priority('Normal'), submissionDate: daysFromNow(-9), currentStage: stage('HospitalResponse'), progressPercent: 40, status: 'Rejected', missingDocumentsCount: 0, riskScore: 68, approvalVelocityDays: 5, updatedAt: daysFromNow(-2) },
  { id: 'clm-3', claimNumber: 'CLM-2026-000151', patientName: 'Tran Van Duc', patientId: 'pat-3', mrn: 'PAT-2026-000151', providerId: 'prov-3', providerName: 'Manulife Vietnam', claimAmount: 8_900_000, hospital: 'PhysioBoo Central Clinic', department: 'Sports Medicine', doctorName: 'Dr. Ngo Thi Lan', priority: priority('Urgent'), submissionDate: daysFromNow(-1), currentStage: stage('DocumentCollection'), progressPercent: 25, status: 'WaitingDocuments', missingDocumentsCount: 3, riskScore: 41, approvalVelocityDays: null, updatedAt: daysFromNow(0) },
  { id: 'clm-4', claimNumber: 'CLM-2026-000129', patientName: 'Pham Thi Hoa', patientId: 'pat-4', mrn: 'PAT-2026-000129', providerId: 'prov-1', providerName: 'Bao Viet Insurance', claimAmount: 15_600_000, hospital: 'PhysioBoo Central Clinic', department: 'Neuro Rehab', doctorName: 'Dr. Tran Minh', priority: priority('Normal'), submissionDate: daysFromNow(-14), currentStage: stage('Settlement'), progressPercent: 100, status: 'Settled', missingDocumentsCount: 0, riskScore: 12, approvalVelocityDays: 7, updatedAt: daysFromNow(-1) },
  { id: 'clm-5', claimNumber: 'CLM-2026-000147', patientName: 'Vo Thanh Long', patientId: 'pat-5', mrn: 'PAT-2026-000147', providerId: 'prov-4', providerName: 'AIA Vietnam', claimAmount: 6_300_000, hospital: 'PhysioBoo Central Clinic', department: 'Rehabilitation', doctorName: 'Dr. Ngo Thi Lan', priority: priority('Low'), submissionDate: daysFromNow(-6), currentStage: stage('Coding'), progressPercent: 35, status: 'Draft', missingDocumentsCount: 0, riskScore: 18, approvalVelocityDays: null, updatedAt: daysFromNow(-3) },
  { id: 'clm-6', claimNumber: 'CLM-2026-000119', patientName: 'Dang Thi Mai', patientId: 'pat-6', mrn: 'PAT-2026-000119', providerId: 'prov-2', providerName: 'PVI Insurance', claimAmount: 21_000_000, hospital: 'PhysioBoo Central Clinic', department: 'Orthopedic Rehab', doctorName: 'Dr. Pham Quoc', priority: priority('High'), submissionDate: daysFromNow(-20), currentStage: stage('HospitalResponse'), progressPercent: 80, status: 'Appealed', missingDocumentsCount: 0, riskScore: 55, approvalVelocityDays: 12, updatedAt: daysFromNow(-4) },
  { id: 'clm-7', claimNumber: 'CLM-2026-000133', patientName: 'Bui Van Kien', patientId: 'pat-7', mrn: 'PAT-2026-000133', providerId: 'prov-5', providerName: 'Prudential Vietnam', claimAmount: 3_100_000, hospital: 'PhysioBoo Central Clinic', department: 'Sports Medicine', doctorName: 'Dr. Ngo Thi Lan', priority: priority('Normal'), submissionDate: daysFromNow(-11), currentStage: stage('Settlement'), progressPercent: 100, status: 'Approved', missingDocumentsCount: 0, riskScore: 9, approvalVelocityDays: 6, updatedAt: daysFromNow(-5) },
  { id: 'clm-8', claimNumber: 'CLM-2026-000155', patientName: 'Ho Thi Ngoc', patientId: 'pat-8', mrn: 'PAT-2026-000155', providerId: 'prov-1', providerName: 'Bao Viet Insurance', claimAmount: 9_800_000, hospital: 'PhysioBoo Central Clinic', department: 'Neuro Rehab', doctorName: 'Dr. Tran Minh', priority: priority('Urgent'), submissionDate: daysFromNow(0), currentStage: stage('Verification'), progressPercent: 10, status: 'Draft', missingDocumentsCount: 2, riskScore: 33, approvalVelocityDays: null, updatedAt: daysFromNow(0) },
  { id: 'clm-9', claimNumber: 'CLM-2026-000108', patientName: 'Nguyen Thi Tam', patientId: 'pat-9', mrn: 'PAT-2026-000108', providerId: 'prov-3', providerName: 'Manulife Vietnam', claimAmount: 5_400_000, hospital: 'PhysioBoo Central Clinic', department: 'Rehabilitation', doctorName: 'Dr. Pham Quoc', priority: priority('Low'), submissionDate: daysFromNow(-25), currentStage: stage('HospitalResponse'), progressPercent: 65, status: 'NeedCorrection', missingDocumentsCount: 1, riskScore: 47, approvalVelocityDays: null, updatedAt: daysFromNow(-6) },
];
