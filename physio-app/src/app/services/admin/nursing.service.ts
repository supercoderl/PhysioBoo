import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { Note } from "../../shared/types/note.types";
import {
  IntakeOutputEntry,
  MarEntry,
  NursingAlert,
  NursingAssignmentFilter,
  NursingPatient,
  NursingStats,
  NursingTask,
  ShiftCode,
  ShiftHandoverCard,
  VitalsReading,
} from "../../shared/types/nursing.types";
import { generateUUID } from "../../shared/utils/common";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class NursingService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // #region Methods
  getAssignments(filter: NursingAssignmentFilter) {
    const params = `?shift=${filter.shift}${filter.wardId ? `&wardId=${filter.wardId}` : ''}`;
    return this.httpSrv.getOr<NursingPatient[]>(`${BASE_API.NURSING.ASSIGNMENTS}${params}`, MOCK.assignments, LoadingKeys.NURSING.ASSIGNMENTS);
  }

  getStats(shift: ShiftCode) {
    return this.httpSrv.getOr<NursingStats>(`${BASE_API.NURSING.STATS}?shift=${shift}`, MOCK.stats, LoadingKeys.NURSING.STATS);
  }

  getAlerts(shift: ShiftCode) {
    return this.httpSrv.getOr<NursingAlert[]>(`${BASE_API.NURSING.ALERTS}?shift=${shift}`, MOCK.alerts, LoadingKeys.NURSING.ALERTS);
  }

  acknowledgeAlert(alertId: string) {
    return this.httpSrv.postOr<string>(BASE_API.NURSING.ALERT_ACKNOWLEDGE(alertId), {}, alertId, LoadingKeys.NURSING.ACKNOWLEDGE);
  }

  getPatient(patientId: string) {
    return this.httpSrv.getOr<NursingPatient>(BASE_API.NURSING.PATIENT(patientId), MOCK.assignments[0], LoadingKeys.NURSING.PATIENT);
  }

  getVitals(patientId: string) {
    return this.httpSrv.getOr<PaginationData<VitalsReading>>(BASE_API.NURSING.VITALS(patientId), MOCK.vitals(patientId), LoadingKeys.NURSING.VITALS);
  }

  addVitalsReading(patientId: string, reading: Omit<VitalsReading, 'id' | 'patientId'>) {
    return this.httpSrv.postOr<VitalsReading>(BASE_API.NURSING.VITALS(patientId), reading, { ...reading, id: generateUUID(), patientId }, LoadingKeys.NURSING.VITAL_ADD);
  }

  getMar(patientId: string) {
    return this.httpSrv.getOr<PaginationData<MarEntry>>(BASE_API.NURSING.MAR(patientId), MOCK.mar(patientId), LoadingKeys.NURSING.MAR);
  }

  updateMarStatus(marEntryId: string, status: MarEntry['status'], reason?: string) {
    return this.httpSrv.patchOr<MarEntry>(BASE_API.NURSING.MAR_UPDATE(marEntryId), { status, reason }, null as any, LoadingKeys.NURSING.MAR_UPDATE);
  }

  getIntakeOutput(patientId: string) {
    return this.httpSrv.getOr<PaginationData<IntakeOutputEntry>>(BASE_API.NURSING.IO(patientId), MOCK.io(patientId), LoadingKeys.NURSING.IO);
  }

  addIntakeOutputEntry(patientId: string, entry: Omit<IntakeOutputEntry, 'id' | 'patientId'>) {
    return this.httpSrv.postOr<IntakeOutputEntry>(BASE_API.NURSING.IO(patientId), entry, { ...entry, id: generateUUID(), patientId }, LoadingKeys.NURSING.IO_ADD);
  }

  getTasks(patientId: string) {
    return this.httpSrv.getOr<PaginationData<NursingTask>>(BASE_API.NURSING.TASKS(patientId), MOCK.tasks(patientId), LoadingKeys.NURSING.TASKS);
  }

  updateTaskStatus(taskId: string, status: NursingTask['status']) {
    return this.httpSrv.patchOr<NursingTask>(BASE_API.NURSING.TASK_UPDATE(taskId), { status }, null as any, LoadingKeys.NURSING.TASK_UPDATE);
  }

  getNotes(patientId: string) {
    return this.httpSrv.getOr<PaginationData<Note>>(BASE_API.NURSING.NOTES(patientId), MOCK.notes(), LoadingKeys.NURSING.NOTES);
  }

  addNote(patientId: string, content: string) {
    const note: Note = { id: generateUUID(), time: new Date().toISOString(), type: 'nursing', content, writtenBy: 'You' };
    return this.httpSrv.postOr<Note>(BASE_API.NURSING.NOTES(patientId), { content }, note, LoadingKeys.NURSING.NOTE_ADD);
  }

  getHandoverCards(outgoingShift: ShiftCode, wardId?: string | null) {
    const params = `?outgoingShift=${outgoingShift}${wardId ? `&wardId=${wardId}` : ''}`;
    return this.httpSrv.getOr<ShiftHandoverCard[]>(`${BASE_API.NURSING.HANDOVER}${params}`, MOCK.handover, LoadingKeys.NURSING.HANDOVER);
  }

  acknowledgeHandover(cardId: string, acknowledgedBy: string) {
    return this.httpSrv.postOr<ShiftHandoverCard>(BASE_API.NURSING.HANDOVER_ACKNOWLEDGE(cardId), { acknowledgedBy }, null as any, LoadingKeys.NURSING.HANDOVER_ACKNOWLEDGE);
  }
  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const MOCK = {
  assignments: <NursingPatient[]>[
    {
      id: 'na-1', patientId: 'pat-1001', patientName: 'Nguyen Thi Mai Anh', patientNumber: 'PAT-2026-000142',
      wardId: 'ward-1', wardName: 'Internal Medicine A', bedNumber: 'A-204', age: 39, gender: 'Female',
      primaryDoctorName: 'Dr. Le Hoang Nam', acuity: 'High',
      risk: { fallRisk: true, isolationRequired: false, isEmergency: false, hasAllergies: true },
      nextTaskLabel: 'Administer Amoxicillin 500mg', nextTaskDueAt: hoursFromNow(0.25), marDueCount: 2, lastVitalsAt: hoursFromNow(-1.5),
    },
    {
      id: 'na-2', patientId: 'pat-1002', patientName: 'Tran Van Hung', patientNumber: 'PAT-2026-000158',
      wardId: 'ward-1', wardName: 'Internal Medicine A', bedNumber: 'A-207', age: 67, gender: 'Male',
      primaryDoctorName: 'Dr. Tran Bich Thuy', acuity: 'Critical',
      risk: { fallRisk: true, isolationRequired: true, isolationType: 'Contact', isEmergency: false, hasAllergies: false },
      nextTaskLabel: 'Vitals round', nextTaskDueAt: hoursFromNow(-0.5), marDueCount: 1, lastVitalsAt: hoursFromNow(-4.2),
    },
    {
      id: 'na-3', patientId: 'pat-1003', patientName: 'Le Thi Kim Ngan', patientNumber: 'PAT-2026-000171',
      wardId: 'ward-2', wardName: 'Surgical Recovery', bedNumber: 'B-112', age: 28, gender: 'Female',
      primaryDoctorName: 'Dr. Pham Quoc Bao', acuity: 'Medium',
      risk: { fallRisk: false, isolationRequired: false, isEmergency: false, hasAllergies: false },
      nextTaskLabel: 'Dressing change', nextTaskDueAt: hoursFromNow(1.5), marDueCount: 0, lastVitalsAt: hoursFromNow(-0.5),
    },
    {
      id: 'na-4', patientId: 'pat-1004', patientName: 'Pham Minh Duc', patientNumber: 'PAT-2026-000183',
      wardId: 'ward-2', wardName: 'Surgical Recovery', bedNumber: 'B-118', age: 54, gender: 'Male',
      primaryDoctorName: 'Dr. Pham Quoc Bao', acuity: 'High',
      risk: { fallRisk: false, isolationRequired: false, isEmergency: true, hasAllergies: false },
      nextTaskLabel: 'Pain assessment', nextTaskDueAt: hoursFromNow(0.1), marDueCount: 1, lastVitalsAt: hoursFromNow(-0.3),
    },
  ],

  stats: <NursingStats>{ assignedPatients: 4, openTasks: 7, overdueTasks: 1, activeAlerts: 3 },

  alerts: <NursingAlert[]>[
    { id: 'al-1', patientId: 'pat-1002', patientName: 'Tran Van Hung', bedNumber: 'A-207', type: 'Emergency', severity: 'Critical', message: 'SpO2 dropped to 88% on last reading', raisedAt: hoursFromNow(-0.2), acknowledged: false },
    { id: 'al-2', patientId: 'pat-1002', patientName: 'Tran Van Hung', bedNumber: 'A-207', type: 'Isolation', severity: 'High', message: 'Contact isolation — PPE required before entry', raisedAt: hoursFromNow(-3), acknowledged: false },
    { id: 'al-3', patientId: 'pat-1001', patientName: 'Nguyen Thi Mai Anh', bedNumber: 'A-204', type: 'Allergy', severity: 'Medium', message: 'Penicillin allergy — verify before MAR administration', raisedAt: hoursFromNow(-5), acknowledged: false },
  ],

  vitals: (patientId: string): PaginationData<VitalsReading> => ({
    ...PaginationDataWithInit<VitalsReading>(),
    items: [
      { id: 'v-1', patientId, recordedAt: hoursFromNow(-6), recordedBy: 'NS Pham Quynh', bloodPressureSystolic: 128, bloodPressureDiastolic: 82, heartRate: 88, temperature: 37.1, respiratoryRate: 18, spo2: 97, isAbnormal: false },
      { id: 'v-2', patientId, recordedAt: hoursFromNow(-2), recordedBy: 'NS Pham Quynh', bloodPressureSystolic: 142, bloodPressureDiastolic: 90, heartRate: 96, temperature: 37.6, respiratoryRate: 20, spo2: 95, isAbnormal: true },
    ],
    totalCount: 2,
  }),

  mar: (patientId: string): PaginationData<MarEntry> => ({
    ...PaginationDataWithInit<MarEntry>(),
    items: [
      { id: 'm-1', patientId, medicationName: 'Amoxicillin', dosage: '500mg', route: 'Oral', scheduledAt: hoursFromNow(0.25), status: 'Due' },
      { id: 'm-2', patientId, medicationName: 'Paracetamol', dosage: '1g', route: 'IV', scheduledAt: hoursFromNow(-1), status: 'Given', givenAt: hoursFromNow(-0.9), givenBy: 'NS Pham Quynh' },
    ],
    totalCount: 2,
  }),

  io: (patientId: string): PaginationData<IntakeOutputEntry> => ({
    ...PaginationDataWithInit<IntakeOutputEntry>(),
    items: [
      { id: 'io-1', patientId, recordedAt: hoursFromNow(-3), recordedBy: 'NS Pham Quynh', direction: 'Intake', category: 'IV', volumeMl: 500 },
      { id: 'io-2', patientId, recordedAt: hoursFromNow(-2), recordedBy: 'NS Pham Quynh', direction: 'Output', category: 'Urine', volumeMl: 320 },
    ],
    totalCount: 2,
  }),

  tasks: (patientId: string): PaginationData<NursingTask> => ({
    ...PaginationDataWithInit<NursingTask>(),
    items: [
      { id: 't-1', patientId, label: 'Administer Amoxicillin 500mg', dueAt: hoursFromNow(0.25), status: 'Pending', assignedNurseName: 'NS Pham Quynh' },
      { id: 't-2', patientId, label: 'Vitals round', dueAt: hoursFromNow(-0.5), status: 'Overdue', assignedNurseName: 'NS Pham Quynh' },
      { id: 't-3', patientId, label: 'Reposition patient', dueAt: hoursFromNow(-2), status: 'Completed', assignedNurseName: 'NS Pham Quynh' },
    ],
    totalCount: 3,
  }),

  notes: (): PaginationData<Note> => ({
    ...PaginationDataWithInit<Note>(),
    items: [
      { id: 'n-1', time: hoursFromNow(-1), type: 'nursing', content: 'Patient resting comfortably, tolerating diet well.', writtenBy: 'NS Pham Quynh' },
      { id: 'n-2', time: hoursFromNow(-5), type: 'nursing', content: 'Mild dizziness reported on ambulation, fall precautions reinforced.', writtenBy: 'NS Pham Quynh' },
    ],
    totalCount: 2,
  }),

  handover: <ShiftHandoverCard[]>[
    {
      id: 'h-1', patientId: 'pat-1002', patientName: 'Tran Van Hung', bedNumber: 'A-207',
      situation: 'Stable but on contact isolation, SpO2 trending down today.',
      background: 'Admitted for pneumonia, day 3 of antibiotics.',
      assessment: 'SpO2 88% at 14:40, O2 supplementation increased to 4L/min.',
      recommendation: 'Recheck SpO2 within the hour, escalate to physician if below 90%.',
      outgoingShift: 'Day', incomingShift: 'Evening', acknowledged: false,
    },
  ],
};
