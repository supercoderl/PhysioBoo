import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import {
  LabCriticalAlert,
  LabDashboardTrend,
  LabOrderRow,
  LabPatientResultSummary,
  LabResultEntry,
  LabSample,
  LabStats,
} from "../../shared/types/laboratory.types";
import { LoadingKeys } from "../../shared/types/loading";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // Methods
  getStats() {
    return this.httpSrv.getOr<LabStats>(BASE_API.LABORATORY.STATS, MOCK.stats, LoadingKeys.LABORATORY.STATS);
  }

  getTrends() {
    return this.httpSrv.getOr<LabDashboardTrend>(BASE_API.LABORATORY.TRENDS, MOCK.trends, LoadingKeys.LABORATORY.TRENDS);
  }

  getAlerts() {
    return this.httpSrv.getOr<LabCriticalAlert[]>(BASE_API.LABORATORY.ALERTS, MOCK.alerts, LoadingKeys.LABORATORY.ALERTS);
  }

  acknowledgeAlert(alertId: string) {
    return this.httpSrv.postOr<string>(BASE_API.LABORATORY.ALERT_ACKNOWLEDGE(alertId), {}, alertId, LoadingKeys.LABORATORY.ALERT_ACKNOWLEDGE);
  }

  getOrders() {
    return this.httpSrv.getOr<PaginationData<LabOrderRow>>(BASE_API.LABORATORY.ORDERS_SEARCH, MOCK.orders(), LoadingKeys.LABORATORY.ORDERS);
  }

  getSamples() {
    return this.httpSrv.getOr<PaginationData<LabSample>>(BASE_API.LABORATORY.SAMPLES_SEARCH, MOCK.samples(), LoadingKeys.LABORATORY.SAMPLES);
  }

  markSampleCollected(sampleId: string, collectorName: string, containerType: string) {
    return this.httpSrv.patchOr<LabSample>(BASE_API.LABORATORY.SAMPLE_COLLECT(sampleId), { collectorName, containerType }, null as any, LoadingKeys.LABORATORY.SAMPLES_COLLECT);
  }

  recollectSample(sampleId: string, reason: string) {
    return this.httpSrv.postOr<LabSample>(BASE_API.LABORATORY.SAMPLE_RECOLLECT(sampleId), { reason }, null as any, LoadingKeys.LABORATORY.SAMPLES_RECOLLECT);
  }

  rejectSample(sampleId: string, reason: string) {
    return this.httpSrv.postOr<LabSample>(BASE_API.LABORATORY.SAMPLE_REJECT(sampleId), { reason }, null as any, LoadingKeys.LABORATORY.SAMPLES_REJECT);
  }

  getResults() {
    return this.httpSrv.getOr<PaginationData<LabResultEntry>>(BASE_API.LABORATORY.RESULTS_SEARCH, MOCK.results(), LoadingKeys.LABORATORY.RESULTS_SEARCH);
  }

  updateResultValue(resultId: string, value: string, comments?: string) {
    return this.httpSrv.patchOr<LabResultEntry>(BASE_API.LABORATORY.RESULT_UPDATE(resultId), { value, comments }, null as any, LoadingKeys.LABORATORY.RESULT_UPDATE);
  }

  approveResult(resultId: string) {
    return this.httpSrv.postOr<LabResultEntry>(BASE_API.LABORATORY.RESULT_APPROVE(resultId), {}, null as any, LoadingKeys.LABORATORY.RESULT_APPROVE);
  }

  rejectResult(resultId: string, reason: string) {
    return this.httpSrv.postOr<LabResultEntry>(BASE_API.LABORATORY.RESULT_REJECT(resultId), { reason }, null as any, LoadingKeys.LABORATORY.RESULT_REJECT);
  }

  returnResultForReview(resultId: string, reason: string) {
    return this.httpSrv.postOr<LabResultEntry>(BASE_API.LABORATORY.RESULT_RETURN_FOR_REVIEW(resultId), { reason }, null as any, LoadingKeys.LABORATORY.RESULT_RETURN_FOR_REVIEW);
  }

  getPatientSummary(patientId: string) {
    return this.httpSrv.getOr<LabPatientResultSummary>(BASE_API.LABORATORY.PATIENT_SUMMARY(patientId), MOCK.patientSummary(patientId), LoadingKeys.LABORATORY.PATIENT_SUMMARY);
  }

  getPatientHistory(patientId: string) {
    return this.httpSrv.getOr<PaginationData<LabOrderRow>>(BASE_API.LABORATORY.PATIENT_HISTORY(patientId), MOCK.orders(), LoadingKeys.LABORATORY.PATIENT_HISTORY);
  }
  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const MOCK = {
  stats: <LabStats>{
    totalOrders: 184,
    pendingCollection: 12,
    collectedSamples: 28,
    inProcessing: 34,
    pendingVerification: 9,
    completedTests: 96,
    criticalResults: 3,
    averageTatHours: 4.2,
  },

  trends: <LabDashboardTrend>{
    dailyOrders: [
      { label: 'Mon', value: 142 }, { label: 'Tue', value: 158 }, { label: 'Wed', value: 171 },
      { label: 'Thu', value: 165 }, { label: 'Fri', value: 184 }, { label: 'Sat', value: 96 }, { label: 'Sun', value: 78 },
    ],
    turnaroundTime: [
      { label: 'Mon', value: 3.8 }, { label: 'Tue', value: 4.1 }, { label: 'Wed', value: 4.6 },
      { label: 'Thu', value: 4.3 }, { label: 'Fri', value: 4.2 }, { label: 'Sat', value: 3.5 }, { label: 'Sun', value: 3.2 },
    ],
    pendingSamplesByStage: [
      { label: 'Not Collected', value: 12 }, { label: 'In Transit', value: 6 },
      { label: 'Received', value: 10 }, { label: 'Quality Check', value: 4 },
    ],
    testCategories: [
      { label: 'Hematology', value: 38 }, { label: 'Biochemistry', value: 52 },
      { label: 'Microbiology', value: 21 }, { label: 'Immunology', value: 17 }, { label: 'Pathology', value: 9 },
    ],
    criticalResultRate: 3.1,
    technicianWorkload: [
      { label: 'Lab Tech Mike', value: 42 }, { label: 'Lab Tech Anna', value: 37 },
      { label: 'Lab Tech Huy', value: 31 }, { label: 'Lab Tech Linh', value: 26 },
    ],
  },

  alerts: <LabCriticalAlert[]>[
    { id: 'la-1', type: 'PanicValue', severity: 'Critical', description: 'Potassium 7.2 mmol/L (panic high)', suggestedAction: 'Notify ordering physician immediately', patientName: 'Nguyen Thi Mai Anh', orderNumber: 'LAB-2026-00871', acknowledged: false, raisedAt: hoursFromNow(-0.5) },
    { id: 'la-2', type: 'Critical', severity: 'Critical', description: 'Hemoglobin 5.8 g/dL (critical low)', suggestedAction: 'Recommend immediate transfusion evaluation', patientName: 'Tran Van Hung', orderNumber: 'LAB-2026-00865', acknowledged: false, raisedAt: hoursFromNow(-1.2) },
    { id: 'la-3', type: 'DeltaCheck', severity: 'High', description: 'WBC delta +180% vs. last result', suggestedAction: 'Verify sample identity before release', patientName: 'Le Thi Hoa', orderNumber: 'LAB-2026-00859', acknowledged: false, raisedAt: hoursFromNow(-2) },
    { id: 'la-4', type: 'SampleDelayed', severity: 'Warning', description: 'Blood culture sample in transit 3h+ without receipt', suggestedAction: 'Contact courier / collecting ward', patientName: null, orderNumber: 'LAB-2026-00842', acknowledged: false, raisedAt: hoursFromNow(-3) },
  ],

  orders: (): PaginationData<LabOrderRow> => ({
    ...PaginationDataWithInit<LabOrderRow>(),
    items: [
      { id: 'o-1', orderNumber: 'LAB-2026-00871', patientName: 'Nguyen Thi Mai Anh', mrn: 'PAT-2026-000142', visitNumber: 'VN-2026-008831', departmentName: 'Internal Medicine', wardName: 'Internal Medicine A', tests: [{ id: 't-1', testName: 'Electrolyte Panel', categoryName: 'Biochemistry', sampleType: 'Blood' }], orderingDoctorName: 'Dr. Le Hoang Nam', priority: 'Stat', collectionStatus: 'Received', labStatus: 'Completed', verificationStatus: 'PendingVerification', orderTime: hoursFromNow(-1) },
      { id: 'o-2', orderNumber: 'LAB-2026-00865', patientName: 'Tran Van Hung', mrn: 'PAT-2026-000098', visitNumber: 'VN-2026-008790', departmentName: 'Emergency', wardName: 'ED Bay 3', tests: [{ id: 't-2', testName: 'Complete Blood Count', categoryName: 'Hematology', sampleType: 'Blood' }], orderingDoctorName: 'Dr. Tran Bich Thuy', priority: 'Stat', collectionStatus: 'Received', labStatus: 'Completed', verificationStatus: 'PendingVerification', orderTime: hoursFromNow(-2) },
      { id: 'o-3', orderNumber: 'LAB-2026-00859', patientName: 'Le Thi Hoa', mrn: 'PAT-2026-000076', visitNumber: 'VN-2026-008765', departmentName: 'Internal Medicine', wardName: 'Internal Medicine B', tests: [{ id: 't-3', testName: 'CBC + Differential', categoryName: 'Hematology', sampleType: 'Blood' }], orderingDoctorName: 'Dr. Le Hoang Nam', priority: 'Urgent', collectionStatus: 'Received', labStatus: 'QualityCheck', verificationStatus: 'PendingVerification', orderTime: hoursFromNow(-3) },
      { id: 'o-4', orderNumber: 'LAB-2026-00842', patientName: 'Pham Quoc Bao', mrn: 'PAT-2026-000051', visitNumber: 'VN-2026-008700', departmentName: 'Surgery', wardName: 'Surgical Ward', tests: [{ id: 't-4', testName: 'Blood Culture', categoryName: 'Microbiology', sampleType: 'Blood' }], orderingDoctorName: 'Dr. Tran Bich Thuy', priority: 'Urgent', collectionStatus: 'InTransit', labStatus: 'Ordered', verificationStatus: 'PendingVerification', orderTime: hoursFromNow(-4) },
      { id: 'o-5', orderNumber: 'LAB-2026-00880', patientName: 'Vo Thi Lan', mrn: 'PAT-2026-000160', visitNumber: 'VN-2026-008850', departmentName: 'Outpatient', wardName: '—', tests: [{ id: 't-5', testName: 'Lipid Panel', categoryName: 'Biochemistry', sampleType: 'Blood' }], orderingDoctorName: 'Dr. Nguyen Van Phuc', priority: 'Routine', collectionStatus: 'NotCollected', labStatus: 'Ordered', verificationStatus: 'PendingVerification', orderTime: hoursFromNow(-0.2) },
      { id: 'o-6', orderNumber: 'LAB-2026-00877', patientName: 'Hoang Minh Duc', mrn: 'PAT-2026-000155', visitNumber: 'VN-2026-008844', departmentName: 'Pediatrics', wardName: 'Pediatrics A', tests: [{ id: 't-6', testName: 'Urinalysis', categoryName: 'Biochemistry', sampleType: 'Urine' }], orderingDoctorName: 'Dr. Pham Thi Ngoc', priority: 'Routine', collectionStatus: 'Collected', labStatus: 'Processing', verificationStatus: 'PendingVerification', orderTime: hoursFromNow(-0.8) },
      { id: 'o-7', orderNumber: 'LAB-2026-00820', patientName: 'Dang Thi Thu', mrn: 'PAT-2026-000040', visitNumber: 'VN-2026-008650', departmentName: 'Internal Medicine', wardName: 'Internal Medicine A', tests: [{ id: 't-7', testName: 'Liver Function Panel', categoryName: 'Biochemistry', sampleType: 'Blood' }], orderingDoctorName: 'Dr. Le Hoang Nam', priority: 'Routine', collectionStatus: 'Received', labStatus: 'Completed', verificationStatus: 'Verified', orderTime: hoursFromNow(-8) },
    ],
    totalCount: 7,
  }),

  samples: (): PaginationData<LabSample> => ({
    ...PaginationDataWithInit<LabSample>(),
    items: [
      { id: 's-1', orderId: 'o-1', orderNumber: 'LAB-2026-00871', patientName: 'Nguyen Thi Mai Anh', testName: 'Electrolyte Panel', barcode: 'BC-871001', sampleType: 'Blood', containerType: 'Lithium Heparin Tube', collectionTime: hoursFromNow(-0.9), collectorName: 'Lab Tech Mike', collectionStatus: 'Received',
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-1) }, { stage: 'Collected', occurredAt: hoursFromNow(-0.9) }, { stage: 'Received', occurredAt: hoursFromNow(-0.7) }, { stage: 'Processing', occurredAt: hoursFromNow(-0.5) }, { stage: 'QualityCheck', occurredAt: hoursFromNow(-0.3) }, { stage: 'Completed', occurredAt: hoursFromNow(-0.1) }, { stage: 'Verified', occurredAt: null }, { stage: 'ReportReleased', occurredAt: null }] },
      { id: 's-2', orderId: 'o-4', orderNumber: 'LAB-2026-00842', patientName: 'Pham Quoc Bao', testName: 'Blood Culture', barcode: 'BC-842001', sampleType: 'Blood', containerType: 'Blood Culture Bottle', collectionTime: hoursFromNow(-3.8), collectorName: 'Lab Tech Anna', collectionStatus: 'InTransit',
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-4) }, { stage: 'Collected', occurredAt: hoursFromNow(-3.8) }, { stage: 'Received', occurredAt: null }, { stage: 'Processing', occurredAt: null }, { stage: 'QualityCheck', occurredAt: null }, { stage: 'Completed', occurredAt: null }, { stage: 'Verified', occurredAt: null }, { stage: 'ReportReleased', occurredAt: null }] },
      { id: 's-3', orderId: 'o-5', orderNumber: 'LAB-2026-00880', patientName: 'Vo Thi Lan', testName: 'Lipid Panel', barcode: 'BC-880001', sampleType: 'Blood', containerType: 'Serum Separator Tube', collectionTime: null, collectorName: null, collectionStatus: 'NotCollected',
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-0.2) }, { stage: 'Collected', occurredAt: null }, { stage: 'Received', occurredAt: null }, { stage: 'Processing', occurredAt: null }, { stage: 'QualityCheck', occurredAt: null }, { stage: 'Completed', occurredAt: null }, { stage: 'Verified', occurredAt: null }, { stage: 'ReportReleased', occurredAt: null }] },
      { id: 's-4', orderId: 'o-6', orderNumber: 'LAB-2026-00877', patientName: 'Hoang Minh Duc', testName: 'Urinalysis', barcode: 'BC-877001', sampleType: 'Urine', containerType: 'Sterile Urine Container', collectionTime: hoursFromNow(-0.8), collectorName: 'Lab Tech Huy', collectionStatus: 'Collected',
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-0.9) }, { stage: 'Collected', occurredAt: hoursFromNow(-0.8) }, { stage: 'Received', occurredAt: hoursFromNow(-0.6) }, { stage: 'Processing', occurredAt: hoursFromNow(-0.4) }, { stage: 'QualityCheck', occurredAt: null }, { stage: 'Completed', occurredAt: null }, { stage: 'Verified', occurredAt: null }, { stage: 'ReportReleased', occurredAt: null }] },
    ],
    totalCount: 4,
  }),

  results: (): PaginationData<LabResultEntry> => ({
    ...PaginationDataWithInit<LabResultEntry>(),
    items: [
      { id: 'r-1', orderId: 'o-1', orderNumber: 'LAB-2026-00871', patientName: 'Nguyen Thi Mai Anh', mrn: 'PAT-2026-000142', testName: 'Potassium', value: '7.2', unit: 'mmol/L', referenceRange: '3.5 - 5.1', flag: 'HH', comments: null, attachments: [], verifyingTechnicianName: 'Lab Tech Mike', verifyingPathologistName: null, verificationStatus: 'PendingVerification', verifiedAt: null },
      { id: 'r-2', orderId: 'o-2', orderNumber: 'LAB-2026-00865', patientName: 'Tran Van Hung', mrn: 'PAT-2026-000098', testName: 'Hemoglobin', value: '5.8', unit: 'g/dL', referenceRange: '12.0 - 16.0', flag: 'LL', comments: null, attachments: [], verifyingTechnicianName: 'Lab Tech Anna', verifyingPathologistName: null, verificationStatus: 'PendingVerification', verifiedAt: null },
      { id: 'r-3', orderId: 'o-3', orderNumber: 'LAB-2026-00859', patientName: 'Le Thi Hoa', mrn: 'PAT-2026-000076', testName: 'White Blood Cell Count', value: '24.6', unit: 'x10^9/L', referenceRange: '4.0 - 11.0', flag: 'H', comments: 'Delta check flagged vs. last result', attachments: [], verifyingTechnicianName: 'Lab Tech Huy', verifyingPathologistName: null, verificationStatus: 'PendingVerification', verifiedAt: null },
      { id: 'r-4', orderId: 'o-6', orderNumber: 'LAB-2026-00877', patientName: 'Hoang Minh Duc', mrn: 'PAT-2026-000155', testName: 'Urine Protein', value: '', unit: 'mg/dL', referenceRange: 'Negative', flag: 'N', comments: null, attachments: [], verifyingTechnicianName: null, verifyingPathologistName: null, verificationStatus: 'PendingVerification', verifiedAt: null },
      { id: 'r-5', orderId: 'o-7', orderNumber: 'LAB-2026-00820', patientName: 'Dang Thi Thu', mrn: 'PAT-2026-000040', testName: 'ALT', value: '32', unit: 'U/L', referenceRange: '7 - 56', flag: 'N', comments: null, attachments: [], verifyingTechnicianName: 'Lab Tech Mike', verifyingPathologistName: 'Dr. Bui Thi Lan', verificationStatus: 'Verified', verifiedAt: hoursFromNow(-7) },
    ],
    totalCount: 5,
  }),

  patientSummary: (patientId: string): LabPatientResultSummary => ({
    patientId,
    fullName: 'Nguyen Thi Mai Anh',
    mrn: 'PAT-2026-000142',
    visitNumber: 'VN-2026-008831',
    departmentName: 'Internal Medicine',
  }),
};
