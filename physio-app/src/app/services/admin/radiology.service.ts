import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  CriticalFindingAlert,
  ImagingOrderRow,
  QueueEntry,
  QueueStatus,
  RadiologyDashboardTrend,
  RadiologyPatientStudySummary,
  RadiologyReport,
  RadiologyReportTemplate,
  RadiologyStats,
  ScheduleSlot,
  StudyRecord,
} from "../../shared/types/radiology.types";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class RadiologyService {
  // #region Inject Services 
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // #region Methods
  getStats() {
    return this.httpSrv.getOr<RadiologyStats>(BASE_API.RADIOLOGY.STATS, MOCK.stats, LoadingKeys.RADIOLOGY.STATS);
  }

  getTrends() {
    return this.httpSrv.getOr<RadiologyDashboardTrend>(BASE_API.RADIOLOGY.TRENDS, MOCK.trends, LoadingKeys.RADIOLOGY.TRENDS);
  }

  getAlerts() {
    return this.httpSrv.getOr<CriticalFindingAlert[]>(BASE_API.RADIOLOGY.ALERTS, MOCK.alerts, LoadingKeys.RADIOLOGY.ALERTS);
  }

  acknowledgeAlert(alertId: string) {
    return this.httpSrv.postOr<string>(BASE_API.RADIOLOGY.ALERT_ACKNOWLEDGE(alertId), {}, alertId, LoadingKeys.RADIOLOGY.ACKNOWLEDGE);
  }

  getOrders() {
    return this.httpSrv.getOr<PaginationData<ImagingOrderRow>>(BASE_API.RADIOLOGY.ORDERS_SEARCH, MOCK.orders(), LoadingKeys.RADIOLOGY.ORDERS_SEARCH);
  }

  getScheduleSlots() {
    return this.httpSrv.getOr<PaginationData<ScheduleSlot>>(BASE_API.RADIOLOGY.SCHEDULE_SEARCH, MOCK.scheduleSlots(), LoadingKeys.RADIOLOGY.SCHEDULE_SEARCH);
  }

  rescheduleSlot(slotId: string, scheduledTime: string, roomName: string) {
    return this.httpSrv.patchOr<ScheduleSlot>(BASE_API.RADIOLOGY.SCHEDULE_RESCHEDULE(slotId), { scheduledTime, roomName }, null as any, LoadingKeys.RADIOLOGY.SCHEDULE_RESCHEDULE);
  }

  cancelSlot(slotId: string, reason: string) {
    return this.httpSrv.postOr<ScheduleSlot>(BASE_API.RADIOLOGY.SCHEDULE_CANCEL(slotId), { reason }, null as any, LoadingKeys.RADIOLOGY.SCHEDULE_CANCEL);
  }

  reassignTechnician(slotId: string, technicianName: string) {
    return this.httpSrv.patchOr<ScheduleSlot>(BASE_API.RADIOLOGY.SCHEDULE_REASSIGN(slotId), { technicianName }, null as any, LoadingKeys.RADIOLOGY.SCHEDULE_REASSIGN);
  }

  getQueue() {
    return this.httpSrv.getOr<QueueEntry[]>(BASE_API.RADIOLOGY.QUEUE, MOCK.queue(), LoadingKeys.RADIOLOGY.QUEUE);
  }

  advanceQueueEntry(entryId: string, status: QueueStatus) {
    return this.httpSrv.patchOr<QueueEntry>(BASE_API.RADIOLOGY.QUEUE_ADVANCE(entryId), { status }, null as any, LoadingKeys.RADIOLOGY.QUEUE_ADVANCE);
  }

  getStudies() {
    return this.httpSrv.getOr<PaginationData<StudyRecord>>(BASE_API.RADIOLOGY.STUDIES_SEARCH, MOCK.studies(), LoadingKeys.RADIOLOGY.STUDIES_SEARCH);
  }

  getStudyDetail(studyId: string) {
    return this.httpSrv.getOr<StudyRecord>(BASE_API.RADIOLOGY.STUDY_DETAIL(studyId), MOCK.studies().items.find(s => s.id === studyId) ?? MOCK.studies().items[0], LoadingKeys.RADIOLOGY.STUDY_DETAIL);
  }

  getReport(orderId: string) {
    return this.httpSrv.getOr<RadiologyReport>(BASE_API.RADIOLOGY.REPORT_DETAIL(orderId), MOCK.report(orderId), LoadingKeys.RADIOLOGY.REPORT_DETAIL);
  }

  saveReportDraft(orderId: string, report: Partial<RadiologyReport>) {
    return this.httpSrv.patchOr<RadiologyReport>(BASE_API.RADIOLOGY.REPORT_DETAIL(orderId), report, { ...MOCK.report(orderId), ...report }, LoadingKeys.RADIOLOGY.REPORT_SAVE);
  }

  getReportTemplates() {
    return this.httpSrv.getOr<RadiologyReportTemplate[]>(BASE_API.RADIOLOGY.REPORT_TEMPLATES, MOCK.templates, LoadingKeys.RADIOLOGY.REPORT_TEMPLATES);
  }

  approveReport(orderId: string) {
    return this.httpSrv.postOr<RadiologyReport>(BASE_API.RADIOLOGY.REPORT_APPROVE(orderId), {}, null as any, LoadingKeys.RADIOLOGY.REPORT_APPROVE);
  }

  rejectReport(orderId: string, reason: string) {
    return this.httpSrv.postOr<RadiologyReport>(BASE_API.RADIOLOGY.REPORT_REJECT(orderId), { reason }, null as any, LoadingKeys.RADIOLOGY.REPORT_REJECT);
  }

  returnReportForRevision(orderId: string, reason: string) {
    return this.httpSrv.postOr<RadiologyReport>(BASE_API.RADIOLOGY.REPORT_RETURN_FOR_REVISION(orderId), { reason }, null as any, LoadingKeys.RADIOLOGY.REPORT_RETURN_FOR_REVISION);
  }

  getPatientSummary(patientId: string) {
    return this.httpSrv.getOr<RadiologyPatientStudySummary>(BASE_API.RADIOLOGY.PATIENT_SUMMARY(patientId), MOCK.patientSummary(patientId), LoadingKeys.RADIOLOGY.PATIENT_SUMMARY);
  }

  getPatientHistory(patientId: string) {
    return this.httpSrv.getOr<PaginationData<ImagingOrderRow>>(BASE_API.RADIOLOGY.PATIENT_HISTORY(patientId), MOCK.orders(), LoadingKeys.RADIOLOGY.PATIENT_HISTORY);
  }
  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const MOCK = {
  stats: <RadiologyStats>{
    totalOrders: 162,
    waitingForScheduling: 14,
    scheduledStudies: 22,
    inProgress: 9,
    pendingReporting: 18,
    pendingVerification: 7,
    completedStudies: 92,
    criticalFindings: 3,
    averageTatHours: 5.4,
  },

  trends: <RadiologyDashboardTrend>{
    imagingVolume: [
      { label: 'Mon', value: 118 }, { label: 'Tue', value: 134 }, { label: 'Wed', value: 142 },
      { label: 'Thu', value: 139 }, { label: 'Fri', value: 162 }, { label: 'Sat', value: 81 }, { label: 'Sun', value: 64 },
    ],
    turnaroundTime: [
      { label: 'Mon', value: 4.9 }, { label: 'Tue', value: 5.2 }, { label: 'Wed', value: 5.6 },
      { label: 'Thu', value: 5.1 }, { label: 'Fri', value: 5.4 }, { label: 'Sat', value: 4.3 }, { label: 'Sun', value: 4.0 },
    ],
    modalityUtilization: [
      { label: 'X-Ray', value: 58 }, { label: 'CT', value: 34 }, { label: 'MRI', value: 21 },
      { label: 'Ultrasound', value: 29 }, { label: 'Mammography', value: 12 }, { label: 'PET', value: 8 },
    ],
    pendingReportsByStatus: [
      { label: 'Reporting', value: 11 }, { label: 'Pending Verification', value: 7 }, { label: 'Returned', value: 2 },
    ],
    criticalFindingRate: 1.9,
    radiologistWorkload: [
      { label: 'Dr. Wilson', value: 28 }, { label: 'Dr. Martinez', value: 24 },
      { label: 'Dr. Lee', value: 19 }, { label: 'Dr. Chen', value: 16 },
    ],
    equipmentUtilization: [
      { label: 'CT Room 1', value: 82 }, { label: 'MRI Room 1', value: 74 },
      { label: 'X-Ray Room A', value: 91 }, { label: 'Ultrasound Room 2', value: 65 },
    ],
  },

  alerts: <CriticalFindingAlert[]>[
    { id: 'ra-1', type: 'CriticalFinding', severity: 'Critical', description: 'Large intracranial hemorrhage identified on Brain CT', patientName: 'Jane Smith', orderNumber: 'RAD-2026-00231', acknowledged: false, notified: true, raisedAt: hoursFromNow(-0.4) },
    { id: 'ra-2', type: 'UrgentFinding', severity: 'High', description: 'Suspected pneumothorax on Chest X-Ray', patientName: 'John Doe', orderNumber: 'RAD-2026-00228', acknowledged: false, notified: true, raisedAt: hoursFromNow(-1.1) },
    { id: 'ra-3', type: 'IncidentalFinding', severity: 'Warning', description: 'Incidental 1.2cm renal cyst noted on Abdominal CT', patientName: 'Robert Brown', orderNumber: 'RAD-2026-00219', acknowledged: false, notified: false, raisedAt: hoursFromNow(-2.5) },
    { id: 'ra-4', type: 'FollowUpRequired', severity: 'Warning', description: 'Follow-up MRI recommended in 6 months for spine lesion', patientName: 'Sarah Johnson', orderNumber: 'RAD-2026-00205', acknowledged: false, notified: false, raisedAt: hoursFromNow(-4) },
  ],

  orders: (): PaginationData<ImagingOrderRow> => ({
    ...PaginationDataWithInit<ImagingOrderRow>(),
    items: [
      { id: 'o-1', orderNumber: 'RAD-2026-00231', patientName: 'Jane Smith', mrn: 'PAT-2026-000211', visitNumber: 'VN-2026-009031', departmentName: 'Emergency', wardName: 'ED Bay 1', examinations: [{ id: 'e-1', examinationName: 'Brain CT', modalityName: 'CT', bodyPart: 'Brain' }], orderingDoctorName: 'Dr. Johnson', priority: 'Stat', scheduledTime: hoursFromNow(-1), status: 'ImageUploaded', reportStatus: 'PendingVerification', radiologistName: 'Dr. Wilson', technicianName: 'Tech. Brown', orderTime: hoursFromNow(-1.5) },
      { id: 'o-2', orderNumber: 'RAD-2026-00228', patientName: 'John Doe', mrn: 'PAT-2026-000198', visitNumber: 'VN-2026-009012', departmentName: 'Emergency', wardName: 'ED Bay 3', examinations: [{ id: 'e-2', examinationName: 'Chest X-Ray', modalityName: 'X-Ray', bodyPart: 'Chest' }], orderingDoctorName: 'Dr. Smith', priority: 'Urgent', scheduledTime: hoursFromNow(-2), status: 'ImagingCompleted', reportStatus: 'Reporting', radiologistName: 'Dr. Martinez', technicianName: 'Tech. Anderson', orderTime: hoursFromNow(-2.5) },
      { id: 'o-3', orderNumber: 'RAD-2026-00219', patientName: 'Robert Brown', mrn: 'PAT-2026-000176', visitNumber: 'VN-2026-008980', departmentName: 'Internal Medicine', wardName: 'Internal Medicine A', examinations: [{ id: 'e-3', examinationName: 'Abdominal CT', modalityName: 'CT', bodyPart: 'Abdomen' }], orderingDoctorName: 'Dr. Williams', priority: 'Routine', scheduledTime: hoursFromNow(-6), status: 'ImageUploaded', reportStatus: 'Verified', radiologistName: 'Dr. Martinez', technicianName: 'Tech. Davis', orderTime: hoursFromNow(-8) },
      { id: 'o-4', orderNumber: 'RAD-2026-00237', patientName: 'Emily Davis', mrn: 'PAT-2026-000224', visitNumber: 'VN-2026-009044', departmentName: 'Outpatient', wardName: '—', examinations: [{ id: 'e-4', examinationName: 'Pelvic Ultrasound', modalityName: 'Ultrasound', bodyPart: 'Pelvis' }], orderingDoctorName: 'Dr. Taylor', priority: 'Routine', scheduledTime: hoursFromNow(1), status: 'Scheduled', reportStatus: 'NotStarted', radiologistName: null, technicianName: 'Tech. Garcia', orderTime: hoursFromNow(-0.3) },
      { id: 'o-5', orderNumber: 'RAD-2026-00239', patientName: 'Michael Wilson', mrn: 'PAT-2026-000229', visitNumber: 'VN-2026-009050', departmentName: 'Outpatient', wardName: '—', examinations: [{ id: 'e-5', examinationName: 'Screening Mammography', modalityName: 'Mammography', bodyPart: 'Breast' }], orderingDoctorName: 'Dr. Anderson', priority: 'Routine', scheduledTime: null, status: 'Ordered', reportStatus: 'NotStarted', radiologistName: null, technicianName: null, orderTime: hoursFromNow(-0.1) },
      { id: 'o-6', orderNumber: 'RAD-2026-00205', patientName: 'Sarah Johnson', mrn: 'PAT-2026-000150', visitNumber: 'VN-2026-008900', departmentName: 'Surgery', wardName: 'Surgical Ward', examinations: [{ id: 'e-6', examinationName: 'Spine CT', modalityName: 'CT', bodyPart: 'Spine' }], orderingDoctorName: 'Dr. Lee', priority: 'Stat', scheduledTime: hoursFromNow(-10), status: 'ImageUploaded', reportStatus: 'Released', radiologistName: 'Dr. Wilson', technicianName: 'Tech. Miller', orderTime: hoursFromNow(-12) },
      { id: 'o-7', orderNumber: 'RAD-2026-00241', patientName: 'David Martinez', mrn: 'PAT-2026-000235', visitNumber: 'VN-2026-009060', departmentName: 'Oncology', wardName: 'Oncology Day Unit', examinations: [{ id: 'e-7', examinationName: 'PET-CT Scan', modalityName: 'PET', bodyPart: 'Whole Body' }], orderingDoctorName: 'Dr. Chen', priority: 'Urgent', scheduledTime: hoursFromNow(3), status: 'Scheduled', reportStatus: 'NotStarted', radiologistName: null, technicianName: 'Tech. Nguyen', orderTime: hoursFromNow(-0.2) },
    ],
    totalCount: 7,
  }),

  scheduleSlots: (): PaginationData<ScheduleSlot> => ({
    ...PaginationDataWithInit<ScheduleSlot>(),
    items: [
      { id: 'sl-1', orderId: 'o-4', orderNumber: 'RAD-2026-00237', patientName: 'Emily Davis', examinationName: 'Pelvic Ultrasound', modalityName: 'Ultrasound', roomName: 'Ultrasound Room 2', technicianName: 'Tech. Garcia', scheduledTime: hoursFromNow(1), estimatedDurationMinutes: 30, preparationInstructions: 'Full bladder required', status: 'Scheduled' },
      { id: 'sl-2', orderId: 'o-7', orderNumber: 'RAD-2026-00241', patientName: 'David Martinez', examinationName: 'PET-CT Scan', modalityName: 'PET', roomName: 'PET Suite', technicianName: 'Tech. Nguyen', scheduledTime: hoursFromNow(3), estimatedDurationMinutes: 90, preparationInstructions: 'Fasting 6 hours prior', status: 'Scheduled' },
      { id: 'sl-3', orderId: 'o-5', orderNumber: 'RAD-2026-00239', patientName: 'Michael Wilson', examinationName: 'Screening Mammography', modalityName: 'Mammography', roomName: 'Mammography Room', technicianName: null, scheduledTime: hoursFromNow(5), estimatedDurationMinutes: 20, preparationInstructions: null, status: 'Ordered' },
    ],
    totalCount: 3,
  }),

  queue: (): QueueEntry[] => [
    { id: 'q-1', orderId: 'o-2', orderNumber: 'RAD-2026-00228', patientName: 'John Doe', examinationName: 'Chest X-Ray', modalityName: 'X-Ray', priority: 'Urgent', roomName: 'X-Ray Room A', status: 'Completed', calledAt: hoursFromNow(-2.4) },
    { id: 'q-2', orderId: 'o-1', orderNumber: 'RAD-2026-00231', patientName: 'Jane Smith', examinationName: 'Brain CT', modalityName: 'CT', priority: 'Stat', roomName: 'CT Room 1', status: 'Completed', calledAt: hoursFromNow(-1.3) },
    { id: 'q-3', orderId: 'o-4', orderNumber: 'RAD-2026-00237', patientName: 'Emily Davis', examinationName: 'Pelvic Ultrasound', modalityName: 'Ultrasound', priority: 'Routine', roomName: 'Ultrasound Room 2', status: 'Waiting', calledAt: null },
    { id: 'q-4', orderId: 'o-7', orderNumber: 'RAD-2026-00241', patientName: 'David Martinez', examinationName: 'PET-CT Scan', modalityName: 'PET', priority: 'Urgent', roomName: 'PET Suite', status: 'Waiting', calledAt: null },
  ],

  studies: (): PaginationData<StudyRecord> => ({
    ...PaginationDataWithInit<StudyRecord>(),
    items: [
      {
        id: 'st-1', orderId: 'o-1', orderNumber: 'RAD-2026-00231', patientName: 'Jane Smith', mrn: 'PAT-2026-000211', examinationName: 'Brain CT', modalityName: 'CT', bodyPart: 'Brain', technique: 'Non-contrast axial CT', studyDate: hoursFromNow(-1), imagesCount: 64, dicomStudyUid: '1.2.840.10008.5.1.4.1.1.2.1', isCritical: true, comparisonStudyIds: [],
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-1.5) }, { stage: 'Scheduled', occurredAt: hoursFromNow(-1.4) }, { stage: 'Arrived', occurredAt: hoursFromNow(-1.2) }, { stage: 'ImagingStarted', occurredAt: hoursFromNow(-1.1) }, { stage: 'ImagingCompleted', occurredAt: hoursFromNow(-0.9) }, { stage: 'ImageUploaded', occurredAt: hoursFromNow(-0.8) }, { stage: 'Reporting', occurredAt: null }, { stage: 'Verified', occurredAt: null }, { stage: 'Released', occurredAt: null }]
      },
      {
        id: 'st-2', orderId: 'o-2', orderNumber: 'RAD-2026-00228', patientName: 'John Doe', mrn: 'PAT-2026-000198', examinationName: 'Chest X-Ray', modalityName: 'X-Ray', bodyPart: 'Chest', technique: 'PA and lateral views', studyDate: hoursFromNow(-2), imagesCount: 2, dicomStudyUid: '1.2.840.10008.5.1.4.1.1.1.1', isCritical: false, comparisonStudyIds: [],
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-2.5) }, { stage: 'Scheduled', occurredAt: hoursFromNow(-2.4) }, { stage: 'Arrived', occurredAt: hoursFromNow(-2.2) }, { stage: 'ImagingStarted', occurredAt: hoursFromNow(-2.1) }, { stage: 'ImagingCompleted', occurredAt: hoursFromNow(-2) }, { stage: 'ImageUploaded', occurredAt: hoursFromNow(-1.9) }, { stage: 'Reporting', occurredAt: hoursFromNow(-1.5) }, { stage: 'Verified', occurredAt: null }, { stage: 'Released', occurredAt: null }]
      },
      {
        id: 'st-3', orderId: 'o-3', orderNumber: 'RAD-2026-00219', patientName: 'Robert Brown', mrn: 'PAT-2026-000176', examinationName: 'Abdominal CT', modalityName: 'CT', bodyPart: 'Abdomen', technique: 'Contrast-enhanced axial CT', studyDate: hoursFromNow(-6), imagesCount: 120, dicomStudyUid: '1.2.840.10008.5.1.4.1.1.2.2', isCritical: false, comparisonStudyIds: [],
        timeline: [{ stage: 'Ordered', occurredAt: hoursFromNow(-8) }, { stage: 'Scheduled', occurredAt: hoursFromNow(-7.8) }, { stage: 'Arrived', occurredAt: hoursFromNow(-6.5) }, { stage: 'ImagingStarted', occurredAt: hoursFromNow(-6.3) }, { stage: 'ImagingCompleted', occurredAt: hoursFromNow(-6) }, { stage: 'ImageUploaded', occurredAt: hoursFromNow(-5.8) }, { stage: 'Reporting', occurredAt: hoursFromNow(-5) }, { stage: 'Verified', occurredAt: hoursFromNow(-3) }, { stage: 'Released', occurredAt: hoursFromNow(-2.5) }]
      },
    ],
    totalCount: 3,
  }),

  templates: <RadiologyReportTemplate[]>[
    { id: 'tpl-1', name: 'Normal Chest X-Ray', modalityName: 'X-Ray', isFavorite: true, clinicalIndication: 'Routine screening', technique: 'PA and lateral views', findings: 'Lungs are clear. No focal consolidation, effusion, or pneumothorax. Cardiomediastinal silhouette normal.', impression: 'No acute cardiopulmonary abnormality.', recommendations: 'None.' },
    { id: 'tpl-2', name: 'Normal Brain CT', modalityName: 'CT', isFavorite: true, clinicalIndication: 'Head trauma evaluation', technique: 'Non-contrast axial CT of the brain', findings: 'No acute intracranial hemorrhage, mass effect, or midline shift. Ventricles normal in size.', impression: 'No acute intracranial abnormality.', recommendations: 'Clinical correlation advised.' },
    { id: 'tpl-3', name: 'Normal Abdominal Ultrasound', modalityName: 'Ultrasound', isFavorite: false, clinicalIndication: 'Abdominal pain', technique: 'Real-time grayscale ultrasound of the abdomen', findings: 'Liver, gallbladder, pancreas, spleen, and kidneys unremarkable.', impression: 'No sonographic abnormality.', recommendations: 'None.' },
  ],

  report: (orderId: string): RadiologyReport => ({
    id: `rep-${orderId}`,
    orderId,
    orderNumber: 'RAD-2026-00228',
    patientName: 'John Doe',
    clinicalIndication: 'Shortness of breath, rule out pneumothorax',
    technique: 'PA and lateral chest radiographs',
    findings: '',
    impression: '',
    recommendations: '',
    attachments: [],
    reportingRadiologistName: 'Dr. Martinez',
    verifyingRadiologistName: null,
    status: 'Reporting',
    lastSavedAt: null,
    verifiedAt: null,
  }),

  patientSummary: (patientId: string): RadiologyPatientStudySummary => ({
    patientId,
    fullName: 'Jane Smith',
    mrn: 'PAT-2026-000211',
    visitNumber: 'VN-2026-009031',
    departmentName: 'Emergency',
  }),
};
