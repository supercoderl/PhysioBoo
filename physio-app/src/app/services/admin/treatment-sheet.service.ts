import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  ClinicalAlert,
  MedicationAdministration,
  TreatmentImagingOrderRow,
  TreatmentLabOrderRow,
  TreatmentOrder,
  TreatmentPatientSummary,
  TreatmentProcedureRow,
  TreatmentProgressNote,
  TreatmentStats,
  TreatmentTimelineEntry,
  TreatmentTimelineFilter,
} from "../../shared/types/treatment-sheet.types";
import { generateUUID } from "../../shared/utils/common";
import { HttpService } from "../common/http.service";

/**
 * Treatment Sheet data layer. Every method calls the planned REST endpoint (see
 * docs/treatment-sheet-redesign.md §13) and falls back to bundled mock data when
 * the call fails (404 while backend is being implemented). When the backend
 * lands, no caller changes are needed — the live response simply wins.
 */
@Injectable({ providedIn: 'root' })
export class TreatmentSheetService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // Methods
  getSummary(patientId: string) {
    return this.httpSrv.getOr<TreatmentPatientSummary>(BASE_API.TREATMENT_SHEET.SUMMARY(patientId), MOCK.summary(patientId), LoadingKeys.TREATMENT.SUMMARY);
  }

  getStats(patientId: string) {
    return this.httpSrv.getOr<TreatmentStats>(BASE_API.TREATMENT_SHEET.STATS(patientId), MOCK.stats, LoadingKeys.TREATMENT.STATS);
  }

  getAlerts(patientId: string) {
    return this.httpSrv.getOr<ClinicalAlert[]>(BASE_API.TREATMENT_SHEET.ALERTS(patientId), MOCK.alerts, LoadingKeys.TREATMENT.ALERTS);
  }

  acknowledgeAlert(alertId: string) {
    return this.httpSrv.postOr<string>(BASE_API.TREATMENT_SHEET.ALERT_ACKNOWLEDGE(alertId), {}, alertId, LoadingKeys.TREATMENT.ACKNOWLEDGE);
  }

  getTimeline(patientId: string, filter: TreatmentTimelineFilter) {
    const params = `?range=${filter.range}${filter.from ? `&from=${filter.from}` : ''}${filter.to ? `&to=${filter.to}` : ''}`;
    return this.httpSrv.getOr<TreatmentTimelineEntry[]>(`${BASE_API.TREATMENT_SHEET.TIMELINE(patientId)}${params}`, MOCK.timeline(patientId), LoadingKeys.TREATMENT.TIMELINE);
  }

  getOrders(patientId: string) {
    return this.httpSrv.getOr<PaginationData<TreatmentOrder>>(BASE_API.TREATMENT_SHEET.ORDERS(patientId), MOCK.orders(patientId), LoadingKeys.TREATMENT.ORDERS);
  }

  updateOrderStatus(orderId: string, status: TreatmentOrder['status']) {
    return this.httpSrv.patchOr<TreatmentOrder>(BASE_API.TREATMENT_SHEET.ORDER_UPDATE(orderId), { status }, null as any, LoadingKeys.TREATMENT.ORDER_UPDATE);
  }

  getMedications(patientId: string) {
    return this.httpSrv.getOr<PaginationData<MedicationAdministration>>(BASE_API.TREATMENT_SHEET.MEDICATIONS(patientId), MOCK.medications(patientId), LoadingKeys.TREATMENT.MEDICATIONS);
  }

  updateMedicationStatus(entryId: string, status: MedicationAdministration['status'], notes?: string) {
    return this.httpSrv.patchOr<MedicationAdministration>(BASE_API.TREATMENT_SHEET.MEDICATION_UPDATE(entryId), { status, notes }, null as any, LoadingKeys.TREATMENT.MEDICATION_UPDATE);
  }

  getProcedures(patientId: string) {
    return this.httpSrv.getOr<PaginationData<TreatmentProcedureRow>>(BASE_API.TREATMENT_SHEET.PROCEDURES(patientId), MOCK.procedures(patientId), LoadingKeys.TREATMENT.PROCEDURES);
  }

  addProcedure(patientId: string, procedure: Omit<TreatmentProcedureRow, 'id'>) {
    return this.httpSrv.postOr<TreatmentProcedureRow>(BASE_API.TREATMENT_SHEET.PROCEDURES(patientId), procedure, { ...procedure, id: generateUUID() }, LoadingKeys.TREATMENT.ADD_PROCEDURE);
  }

  getLabOrders(patientId: string) {
    return this.httpSrv.getOr<PaginationData<TreatmentLabOrderRow>>(BASE_API.TREATMENT_SHEET.LABS(patientId), MOCK.labs(patientId), LoadingKeys.TREATMENT.LABS);
  }

  getImagingOrders(patientId: string) {
    return this.httpSrv.getOr<PaginationData<TreatmentImagingOrderRow>>(BASE_API.TREATMENT_SHEET.IMAGING(patientId), MOCK.imaging(patientId), LoadingKeys.TREATMENT.IMAGING);
  }

  getNotes(patientId: string) {
    return this.httpSrv.getOr<PaginationData<TreatmentProgressNote>>(BASE_API.TREATMENT_SHEET.NOTES(patientId), MOCK.notes(), LoadingKeys.TREATMENT.NOTES);
  }

  addNote(patientId: string, type: TreatmentProgressNote['type'], content: string) {
    const note: TreatmentProgressNote = { id: generateUUID(), type, content, authorName: 'You', writtenAt: new Date().toISOString() };
    return this.httpSrv.postOr<TreatmentProgressNote>(BASE_API.TREATMENT_SHEET.NOTES(patientId), { type, content }, note, LoadingKeys.TREATMENT.ADD_NOTE);
  }

  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const MOCK = {
  summary: (patientId: string): TreatmentPatientSummary => ({
    patientId,
    fullName: 'Nguyen Thi Mai Anh',
    avatarUrl: null,
    mrn: 'PAT-2026-000142',
    visitNumber: 'VN-2026-008831',
    bedNumber: 'A-204',
    wardName: 'Internal Medicine A',
    departmentName: 'Internal Medicine',
    admissionDate: hoursFromNow(-72),
    primaryDiagnosis: 'Community-acquired pneumonia',
    allergies: ['Penicillin', 'Shellfish'],
    isolationStatus: null,
    attendingDoctorName: 'Dr. Le Hoang Nam',
  }),

  stats: <TreatmentStats>{
    activeOrders: 6, completedOrders: 14, pendingOrders: 2,
    medicationDue: 3, criticalAlerts: 1, pendingLabs: 2, pendingImaging: 1,
  },

  alerts: <ClinicalAlert[]>[
    { id: 'al-1', type: 'Allergy', severity: 'Critical', message: 'Penicillin allergy on file — verify before administering Amoxicillin', raisedAt: hoursFromNow(-1), acknowledged: false },
    { id: 'al-2', type: 'AbnormalLab', severity: 'High', message: 'WBC 14.8 x10^9/L (high) — flagged on latest CBC panel', raisedAt: hoursFromNow(-3), acknowledged: false },
    { id: 'al-3', type: 'PendingCriticalOrder', severity: 'Warning', message: 'Chest X-ray ordered 4h ago, not yet scheduled', raisedAt: hoursFromNow(-4), acknowledged: false },
  ],

  timeline: (patientId: string): TreatmentTimelineEntry[] => [
    { id: 'tl-1', category: 'DoctorOrder', title: 'Order: IV Ceftriaxone 1g BID', occurredAt: hoursFromNow(-6), actorName: 'Dr. Le Hoang Nam', status: 'Active' },
    { id: 'tl-2', category: 'MedicationOrder', title: 'Administered Paracetamol 1g IV', occurredAt: hoursFromNow(-5), actorName: 'NS Pham Quynh', status: 'Given' },
    { id: 'tl-3', category: 'LabOrder', title: 'CBC panel collected', detail: 'Sample sent to laboratory', occurredAt: hoursFromNow(-4.5), actorName: 'Lab Tech Mike', status: 'Collected' },
    { id: 'tl-4', category: 'NursingActivity', title: 'Vitals round', detail: 'BP 128/82, HR 88, Temp 37.1°C', occurredAt: hoursFromNow(-3), actorName: 'NS Pham Quynh', status: 'Completed' },
    { id: 'tl-5', category: 'ImagingOrder', title: 'Chest X-ray ordered', occurredAt: hoursFromNow(-4), actorName: 'Dr. Le Hoang Nam', status: 'Ordered' },
    { id: 'tl-6', category: 'ProgressNote', title: 'Doctor progress note added', detail: 'Chest X-ray shows improvement, continue antibiotics', occurredAt: hoursFromNow(-2), actorName: 'Dr. Le Hoang Nam', status: null },
    { id: 'tl-7', category: 'Procedure', title: 'Wound dressing change', occurredAt: hoursFromNow(-1), actorName: 'NS Pham Quynh', status: 'Completed' },
    { id: 'tl-8', category: 'CompletedTask', title: 'Discharge education reviewed', occurredAt: hoursFromNow(-0.5), actorName: 'NS Pham Quynh', status: 'Completed' },
  ],

  orders: (patientId: string): PaginationData<TreatmentOrder> => ({
    ...PaginationDataWithInit<TreatmentOrder>(),
    items: [
      { id: 'o-1', orderType: 'Medication', orderName: 'IV Ceftriaxone 1g', priority: 'Routine', frequency: 'BID', startTime: hoursFromNow(-6), endTime: hoursFromNow(48), orderingDoctorName: 'Dr. Le Hoang Nam', status: 'Active' },
      { id: 'o-2', orderType: 'Lab', orderName: 'CBC Panel', priority: 'Routine', frequency: 'Once', startTime: hoursFromNow(-5), orderingDoctorName: 'Dr. Le Hoang Nam', status: 'Completed' },
      { id: 'o-3', orderType: 'Imaging', orderName: 'Chest X-ray', priority: 'Urgent', frequency: 'Once', startTime: hoursFromNow(-4), orderingDoctorName: 'Dr. Le Hoang Nam', status: 'Pending' },
      { id: 'o-4', orderType: 'Nursing', orderName: 'Vitals every 4 hours', priority: 'Routine', frequency: 'Q4H', startTime: hoursFromNow(-6), orderingDoctorName: 'Dr. Le Hoang Nam', status: 'Active' },
      { id: 'o-5', orderType: 'Procedure', orderName: 'Wound dressing change', priority: 'Routine', frequency: 'Daily', startTime: hoursFromNow(-1), orderingDoctorName: 'Dr. Tran Bich Thuy', status: 'Active' },
      { id: 'o-6', orderType: 'Doctor', orderName: 'Cardiology consult', priority: 'Stat', frequency: 'Once', startTime: hoursFromNow(-0.5), orderingDoctorName: 'Dr. Le Hoang Nam', status: 'Pending' },
    ],
    totalCount: 6,
  }),

  medications: (patientId: string): PaginationData<MedicationAdministration> => ({
    ...PaginationDataWithInit<MedicationAdministration>(),
    items: [
      { id: 'm-1', medicationName: 'Amoxicillin', dose: '500mg', route: 'Oral', frequency: '3x daily', scheduledTime: hoursFromNow(0.25), status: 'Scheduled' },
      { id: 'm-2', medicationName: 'Paracetamol', dose: '1g', route: 'IV', frequency: 'Q6H', scheduledTime: hoursFromNow(-1), status: 'Given', administeredByName: 'NS Pham Quynh' },
      { id: 'm-3', medicationName: 'Ceftriaxone', dose: '1g', route: 'IV', frequency: 'BID', scheduledTime: hoursFromNow(-5), status: 'Given', administeredByName: 'NS Pham Quynh' },
      { id: 'm-4', medicationName: 'Salbutamol Inhaler', dose: '2 puffs', route: 'Inhalation', frequency: 'PRN', scheduledTime: hoursFromNow(-3), status: 'Missed', notes: 'Patient asleep, redosed next round' },
    ],
    totalCount: 4,
  }),

  procedures: (patientId: string): PaginationData<TreatmentProcedureRow> => ({
    ...PaginationDataWithInit<TreatmentProcedureRow>(),
    items: [
      { id: 'p-1', name: 'Wound Dressing Change', status: 'Completed', department: 'Internal Medicine A', scheduledTime: hoursFromNow(-1), completionTime: hoursFromNow(-0.8), performerName: 'NS Pham Quynh' },
      { id: 'p-2', name: 'Blood Sample Collection', status: 'Completed', department: 'Laboratory', scheduledTime: hoursFromNow(-5), completionTime: hoursFromNow(-4.8), performerName: 'Lab Tech Mike' },
      { id: 'p-3', name: 'Chest Physiotherapy', status: 'Scheduled', department: 'Internal Medicine A', scheduledTime: hoursFromNow(2) },
    ],
    totalCount: 3,
  }),

  labs: (patientId: string): PaginationData<TreatmentLabOrderRow> => ({
    ...PaginationDataWithInit<TreatmentLabOrderRow>(),
    items: [
      { id: 'l-1', testName: 'Complete Blood Count', sampleStatus: 'Received', resultStatus: 'Final', isCritical: false, orderedAt: hoursFromNow(-5) },
      { id: 'l-2', testName: 'C-Reactive Protein', sampleStatus: 'InTransit', resultStatus: 'Pending', isCritical: false, orderedAt: hoursFromNow(-4) },
      { id: 'l-3', testName: 'Blood Culture', sampleStatus: 'NotCollected', resultStatus: 'Pending', isCritical: true, orderedAt: hoursFromNow(-1) },
    ],
    totalCount: 3,
  }),

  imaging: (patientId: string): PaginationData<TreatmentImagingOrderRow> => ({
    ...PaginationDataWithInit<TreatmentImagingOrderRow>(),
    items: [
      { id: 'i-1', studyName: 'Chest X-ray (PA view)', status: 'Ordered', reportAvailable: false, imagesAvailable: false, scheduledTime: hoursFromNow(2) },
      { id: 'i-2', studyName: 'Abdominal Ultrasound', status: 'Completed', reportAvailable: true, imagesAvailable: true, scheduledTime: hoursFromNow(-24) },
    ],
    totalCount: 2,
  }),

  notes: (): PaginationData<TreatmentProgressNote> => ({
    ...PaginationDataWithInit<TreatmentProgressNote>(),
    items: [
      { id: 'n-1', type: 'Doctor', content: 'Chest X-ray shows improvement. Continue current antibiotic regimen. Patient responding well to treatment.', authorName: 'Dr. Le Hoang Nam', writtenAt: hoursFromNow(-2) },
      { id: 'n-2', type: 'Nursing', content: 'Patient alert and oriented. Complaining of mild chest discomfort. Vital signs stable.', authorName: 'NS Pham Quynh', writtenAt: hoursFromNow(-6) },
      { id: 'n-3', type: 'Consultation', content: 'Cardiology review pending — no acute ECG changes noted on admission tracing.', authorName: 'Dr. Tran Bich Thuy', writtenAt: hoursFromNow(-8) },
    ],
    totalCount: 3,
  }),
};
