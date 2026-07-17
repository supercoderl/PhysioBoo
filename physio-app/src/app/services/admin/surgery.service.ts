import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  ChecklistItemStatus,
  EquipmentItem,
  OperatingRoom,
  OperatingRoomStatus,
  PreOpChecklistItem,
  SurgeryCase,
  SurgeryCriticalAlert,
  SurgeryDashboardTrend,
  SurgeryPatientSummary,
  SurgeryRow,
  SurgeryStats,
  SurgeryTimelineStage,
  SurgicalTeamMember,
} from "../../shared/types/surgery.types";
import { HttpService } from "../common/http.service";

/**
 * Surgery (ORMS) data layer. Every method calls the planned REST endpoint (see
 * docs/surgery-redesign.md §13) and falls back to bundled mock data when the
 * call fails (404 while backend is being implemented). When the backend lands,
 * no caller changes are needed — the live response simply wins.
 */
@Injectable({ providedIn: 'root' })
export class SurgeryService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion
  constructor(private http: HttpClient) { }

  // #region Methods
  getStats() {
    return this.httpSrv.getOr<SurgeryStats>(BASE_API.SURGERY.STATS, MOCK.stats, LoadingKeys.SURGERY.STATS);
  }

  getTrends() {
    return this.httpSrv.getOr<SurgeryDashboardTrend>(BASE_API.SURGERY.TRENDS, MOCK.trends, LoadingKeys.SURGERY.TRENDS);
  }

  getAlerts() {
    return this.httpSrv.getOr<SurgeryCriticalAlert[]>(BASE_API.SURGERY.ALERTS, MOCK.alerts, LoadingKeys.SURGERY.ALERTS);
  }

  acknowledgeAlert(alertId: string) {
    return this.httpSrv.postOr<string>(BASE_API.SURGERY.ALERT_ACKNOWLEDGE(alertId), {}, alertId, LoadingKeys.SURGERY.ACKNOWLEDGE);
  }

  getCases() {
    return this.httpSrv.getOr<PaginationData<SurgeryRow>>(BASE_API.SURGERY.CASES_SEARCH, MOCK.cases(), LoadingKeys.SURGERY.CASES_SEARCH);
  }

  getCaseDetail(surgeryId: string) {
    return this.httpSrv.getOr<SurgeryCase>(BASE_API.SURGERY.CASE_DETAIL(surgeryId), MOCK.caseDetail(surgeryId), LoadingKeys.SURGERY.CASE_DETAIL);
  }

  cancelCase(surgeryId: string, reason: string) {
    return this.httpSrv.postOr<SurgeryRow>(BASE_API.SURGERY.CASE_CANCEL(surgeryId), { reason }, null as any, LoadingKeys.SURGERY.CASE_CANCEL);
  }

  getRooms() {
    return this.httpSrv.getOr<OperatingRoom[]>(BASE_API.SURGERY.ROOMS, MOCK.rooms, LoadingKeys.SURGERY.ROOMS);
  }

  updateRoomStatus(roomId: string, status: OperatingRoomStatus) {
    return this.httpSrv.patchOr<OperatingRoom>(BASE_API.SURGERY.ROOM_STATUS(roomId), { status }, null as any, LoadingKeys.SURGERY.ROOM_STATUS);
  }

  updateChecklistItem(surgeryId: string, itemId: string, status: ChecklistItemStatus, signedBy: string) {
    return this.httpSrv.patchOr<PreOpChecklistItem>(BASE_API.SURGERY.CHECKLIST_ITEM(surgeryId, itemId), { status, signedBy }, null as any, LoadingKeys.SURGERY.CHECKLIST_ITEM);
  }

  assignTeamMember(surgeryId: string, memberId: string, staffId: string, role: string) {
    return this.httpSrv.patchOr<SurgicalTeamMember>(BASE_API.SURGERY.TEAM_MEMBER(surgeryId, memberId), { staffId, role }, null as any, LoadingKeys.SURGERY.TEAM_MEMBER);
  }

  updateEquipmentItem(surgeryId: string, itemId: string, status: string, quantity?: number) {
    return this.httpSrv.patchOr<EquipmentItem>(BASE_API.SURGERY.EQUIPMENT_ITEM(surgeryId, itemId), { status, quantity }, null as any, LoadingKeys.SURGERY.EQUIPMENT_ITEM);
  }

  advanceTimelineStage(surgeryId: string, stage: SurgeryTimelineStage) {
    return this.httpSrv.postOr<string>(BASE_API.SURGERY.TIMELINE_STAGE(surgeryId, stage), {}, surgeryId, LoadingKeys.SURGERY.TIMELINE_STAGE);
  }

  updateIntraOp(surgeryId: string, payload: { notes?: string; complications?: string; bloodLossMl?: number; estimatedRemainingMinutes?: number }) {
    return this.httpSrv.patchOr<SurgeryCase>(BASE_API.SURGERY.INTRAOP_UPDATE(surgeryId), payload, null as any, LoadingKeys.SURGERY.INTRAOP_UPDATE);
  }

  updatePostOp(surgeryId: string, payload: { pacuBay?: string; recoveryStatus?: string; postOpNotes?: string; complications?: string; followUpOrders?: string }) {
    return this.httpSrv.patchOr<SurgeryCase>(BASE_API.SURGERY.POSTOP_UPDATE(surgeryId), payload, null as any, LoadingKeys.SURGERY.POSTOP_UPDATE);
  }

  dischargeCase(surgeryId: string) {
    return this.httpSrv.postOr<SurgeryRow>(BASE_API.SURGERY.DISCHARGE(surgeryId), {}, null as any, LoadingKeys.SURGERY.DISCHARGE);
  }

  getPatientSummary(patientId: string) {
    return this.httpSrv.getOr<SurgeryPatientSummary>(BASE_API.SURGERY.PATIENT_SUMMARY(patientId), MOCK.patientSummary(patientId), LoadingKeys.SURGERY.PATIENT_SUMMARY);
  }

  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const MOCK = {
  stats: <SurgeryStats>{
    totalScheduled: 18,
    ongoing: 3,
    completed: 7,
    delayed: 2,
    emergency: 1,
    availableRooms: 2,
    occupiedRooms: 4,
    averageDurationMinutes: 128,
    orUtilizationRate: 74,
  },

  trends: <SurgeryDashboardTrend>{
    orUtilizationByRoom: [
      { label: 'OR-1', value: 88 }, { label: 'OR-2', value: 64 }, { label: 'OR-3', value: 92 },
      { label: 'OR-4', value: 41 }, { label: 'OR-5', value: 76 }, { label: 'OR-6', value: 30 },
    ],
    surgeryVolume: [
      { label: 'Mon', value: 14 }, { label: 'Tue', value: 17 }, { label: 'Wed', value: 19 },
      { label: 'Thu', value: 16 }, { label: 'Fri', value: 18 }, { label: 'Sat', value: 9 }, { label: 'Sun', value: 5 },
    ],
    delayRate: 11.4,
    emergencyCases: [
      { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 }, { label: 'Wed', value: 1 },
      { label: 'Thu', value: 3 }, { label: 'Fri', value: 1 }, { label: 'Sat', value: 0 }, { label: 'Sun', value: 1 },
    ],
    procedureDistribution: [
      { label: 'General', value: 32 }, { label: 'Orthopedic', value: 24 }, { label: 'Cardiac', value: 9 },
      { label: 'Neurosurgery', value: 6 }, { label: 'ENT', value: 14 }, { label: 'Ophthalmic', value: 11 },
    ],
    averageDuration: [
      { label: 'Mon', value: 118 }, { label: 'Tue', value: 132 }, { label: 'Wed', value: 141 },
      { label: 'Thu', value: 124 }, { label: 'Fri', value: 128 }, { label: 'Sat', value: 96 }, { label: 'Sun', value: 88 },
    ],
    cancellationRate: 3.8,
  },

  alerts: <SurgeryCriticalAlert[]>[
    { id: 'sa-1', type: 'MissingConsent', severity: 'Critical', description: 'Surgical consent not signed for SUR-2026-0142', suggestedAction: 'Obtain signed consent before pre-op timeout', patientName: 'Nguyen Van Hai', surgeryNumber: 'SUR-2026-0142', acknowledged: false, raisedAt: hoursFromNow(-0.4) },
    { id: 'sa-2', type: 'Allergy', severity: 'High', description: 'Patient has documented Penicillin allergy — verify prophylactic antibiotic order', suggestedAction: 'Confirm alternative antibiotic with anesthesiologist', patientName: 'Tran Thi Be', surgeryNumber: 'SUR-2026-0138', acknowledged: false, raisedAt: hoursFromNow(-1) },
    { id: 'sa-3', type: 'OrConflict', severity: 'High', description: 'OR-2 has two overlapping bookings at 10:00', suggestedAction: 'Reassign one case to an available room', patientName: null, surgeryNumber: 'SUR-2026-0139', acknowledged: false, raisedAt: hoursFromNow(-0.8) },
    { id: 'sa-4', type: 'EquipmentMissing', severity: 'Warning', description: 'Cardiac bypass instrument set not yet sterilized', suggestedAction: 'Escalate to sterile processing department', patientName: 'Le Van Cuong', surgeryNumber: 'SUR-2026-0145', acknowledged: false, raisedAt: hoursFromNow(-2) },
    { id: 'sa-5', type: 'DelayedSurgery', severity: 'Warning', description: 'SUR-2026-0140 running 35 minutes behind schedule', suggestedAction: 'Notify downstream OR-3 cases of possible delay', patientName: 'Pham Thi Dao', surgeryNumber: 'SUR-2026-0140', acknowledged: false, raisedAt: hoursFromNow(-0.2) },
  ],

  rooms: <OperatingRoom[]>[
    { id: 'room-1', roomNumber: 'OR-1', roomType: 'General Surgery', status: 'InSurgery', currentSurgeryId: 'sur-1', currentProcedure: 'Appendectomy', surgeonName: 'Dr. Smith', patientName: 'John Doe', startTime: hoursFromNow(-0.7), estimatedFinishTime: hoursFromNow(0.3), equipmentReady: true },
    { id: 'room-2', roomNumber: 'OR-2', roomType: 'Cardiac Surgery', status: 'Preparing', currentSurgeryId: 'sur-2', currentProcedure: 'Coronary Artery Bypass', surgeonName: 'Dr. Williams', patientName: 'Robert Brown', startTime: null, estimatedFinishTime: null, equipmentReady: false },
    { id: 'room-3', roomNumber: 'OR-3', roomType: 'Orthopedic', status: 'InSurgery', currentSurgeryId: 'sur-3', currentProcedure: 'Total Knee Replacement', surgeonName: 'Dr. Johnson', patientName: 'Jane Smith', startTime: hoursFromNow(-1.5), estimatedFinishTime: hoursFromNow(1.5), equipmentReady: true },
    { id: 'room-4', roomNumber: 'OR-4', roomType: 'Neurosurgery', status: 'Maintenance', currentSurgeryId: null, currentProcedure: null, surgeonName: null, patientName: null, startTime: null, estimatedFinishTime: null, equipmentReady: false },
    { id: 'room-5', roomNumber: 'OR-5', roomType: 'General Surgery', status: 'Available', currentSurgeryId: null, currentProcedure: null, surgeonName: null, patientName: null, startTime: null, estimatedFinishTime: null, equipmentReady: true },
    { id: 'room-6', roomNumber: 'OR-6', roomType: 'ENT', status: 'Cleaning', currentSurgeryId: null, currentProcedure: null, surgeonName: null, patientName: null, startTime: null, estimatedFinishTime: null, equipmentReady: true },
  ],

  cases: (): PaginationData<SurgeryRow> => ({
    ...PaginationDataWithInit<SurgeryRow>(),
    items: [
      { id: 'sur-1', surgeryNumber: 'SUR-2026-0137', patientName: 'John Doe', mrn: 'PAT-2026-000142', procedure: 'Appendectomy', surgeryType: 'General', department: 'General Surgery', primarySurgeon: 'Dr. Smith', assistantSurgeon: 'Dr. Patel', anesthesiologist: 'Dr. Brown', operatingRoomNumber: 'OR-1', scheduledStart: hoursFromNow(-0.7), estimatedDurationMinutes: 60, priority: 'Emergency', status: 'InProgress' },
      { id: 'sur-2', surgeryNumber: 'SUR-2026-0145', patientName: 'Le Van Cuong', mrn: 'PAT-2026-000098', procedure: 'Coronary Artery Bypass', surgeryType: 'Cardiac', department: 'Cardiac Surgery', primarySurgeon: 'Dr. Williams', assistantSurgeon: 'Dr. Tran', anesthesiologist: 'Dr. Martinez', operatingRoomNumber: 'OR-2', scheduledStart: hoursFromNow(1), estimatedDurationMinutes: 240, priority: 'Urgent', status: 'PreOpReady' },
      { id: 'sur-3', surgeryNumber: 'SUR-2026-0136', patientName: 'Jane Smith', mrn: 'PAT-2026-000076', procedure: 'Total Knee Replacement', surgeryType: 'Orthopedic', department: 'Orthopedics', primarySurgeon: 'Dr. Johnson', assistantSurgeon: 'Dr. Davis', anesthesiologist: 'Dr. Davis', operatingRoomNumber: 'OR-3', scheduledStart: hoursFromNow(-1.5), estimatedDurationMinutes: 180, priority: 'Elective', status: 'InProgress' },
      { id: 'sur-4', surgeryNumber: 'SUR-2026-0142', patientName: 'Nguyen Van Hai', mrn: 'PAT-2026-000051', procedure: 'Craniotomy', surgeryType: 'Neurosurgery', department: 'Neurosurgery', primarySurgeon: 'Dr. Taylor', assistantSurgeon: 'Dr. Anderson', anesthesiologist: 'Dr. Garcia', operatingRoomNumber: 'OR-4', scheduledStart: hoursFromNow(3), estimatedDurationMinutes: 300, priority: 'Urgent', status: 'Scheduled' },
      { id: 'sur-5', surgeryNumber: 'SUR-2026-0138', patientName: 'Tran Thi Be', mrn: 'PAT-2026-000160', procedure: 'Rhinoplasty', surgeryType: 'Plastic', department: 'Plastic Surgery', primarySurgeon: 'Dr. Lee', assistantSurgeon: null, anesthesiologist: 'Dr. Garcia', operatingRoomNumber: 'OR-5', scheduledStart: hoursFromNow(0.3), estimatedDurationMinutes: 120, priority: 'Elective', status: 'PatientArrived' },
      { id: 'sur-6', surgeryNumber: 'SUR-2026-0130', patientName: 'Sarah Johnson', mrn: 'PAT-2026-000155', procedure: 'Cholecystectomy', surgeryType: 'General', department: 'General Surgery', primarySurgeon: 'Dr. Smith', assistantSurgeon: null, anesthesiologist: 'Dr. Brown', operatingRoomNumber: 'OR-1', scheduledStart: hoursFromNow(-6), estimatedDurationMinutes: 90, priority: 'Elective', status: 'Recovery' },
      { id: 'sur-7', surgeryNumber: 'SUR-2026-0127', patientName: 'David Martinez', mrn: 'PAT-2026-000040', procedure: 'Tonsillectomy', surgeryType: 'ENT', department: 'ENT', primarySurgeon: 'Dr. Chen', assistantSurgeon: null, anesthesiologist: 'Dr. Wilson', operatingRoomNumber: 'OR-6', scheduledStart: hoursFromNow(-8), estimatedDurationMinutes: 45, priority: 'Elective', status: 'Discharged' },
      { id: 'sur-8', surgeryNumber: 'SUR-2026-0139', patientName: 'Pham Thi Dao', mrn: 'PAT-2026-000031', procedure: 'Carotid Endarterectomy', surgeryType: 'Vascular', department: 'Vascular Surgery', primarySurgeon: 'Dr. Rodriguez', assistantSurgeon: 'Dr. Martinez', anesthesiologist: 'Dr. Martinez', operatingRoomNumber: 'OR-2', scheduledStart: hoursFromNow(-0.5), estimatedDurationMinutes: 150, priority: 'Urgent', status: 'Delayed' },
      { id: 'sur-9', surgeryNumber: 'SUR-2026-0124', patientName: 'Lisa Anderson', mrn: 'PAT-2026-000022', procedure: 'Cataract Surgery', surgeryType: 'Ophthalmic', department: 'Ophthalmology', primarySurgeon: 'Dr. Patel', assistantSurgeon: null, anesthesiologist: null, operatingRoomNumber: 'OR-5', scheduledStart: hoursFromNow(-26), estimatedDurationMinutes: 30, priority: 'Elective', status: 'Cancelled' },
    ],
    totalCount: 9,
  }),

  caseDetail: (surgeryId: string): SurgeryCase => {
    const row = MOCK.cases().items.find(c => c.id === surgeryId) ?? MOCK.cases().items[0];
    return {
      ...row,
      diagnosis: 'Acute appendicitis with localized peritonitis',
      surgicalHistory: ['Tonsillectomy (2014)'],
      allergies: ['Penicillin'],
      currentMedications: ['Paracetamol 500mg PRN', 'Cefazolin 1g IV pre-op'],
      consentStatus: 'Signed',
      riskAssessment: 'ASA Class II — moderate systemic disease, no functional limitation',
      team: [
        { id: 'tm-1', staffId: 'doc-1', name: row.primarySurgeon, role: 'PrimarySurgeon', availability: 'Assigned' },
        { id: 'tm-2', staffId: 'doc-2', name: row.assistantSurgeon ?? 'Unassigned', role: 'AssistantSurgeon', availability: row.assistantSurgeon ? 'Assigned' : 'Available' },
        { id: 'tm-3', staffId: 'doc-3', name: row.anesthesiologist ?? 'Unassigned', role: 'Anesthesiologist', availability: row.anesthesiologist ? 'Assigned' : 'Available' },
        { id: 'tm-4', staffId: 'staff-1', name: 'Nurse Hoa', role: 'ScrubNurse', availability: 'Assigned' },
        { id: 'tm-5', staffId: 'staff-2', name: 'Nurse Linh', role: 'CirculatingNurse', availability: 'Assigned' },
        { id: 'tm-6', staffId: 'staff-3', name: 'Tech Minh', role: 'Technician', availability: 'Assigned' },
      ],
      equipment: [
        { id: 'eq-1', equipmentId: 'inst-001', name: 'General Surgery Instrument Set', category: 'InstrumentSet', status: 'Reserved', quantity: 1 },
        { id: 'eq-2', equipmentId: 'cons-014', name: 'Surgical Gauze Pack', category: 'Consumable', status: 'Available', quantity: 12 },
        { id: 'eq-3', equipmentId: 'eq-022', name: 'Electrocautery Unit', category: 'Equipment', status: 'InUse', quantity: 1 },
        { id: 'eq-4', equipmentId: 'imp-007', name: 'Surgical Mesh Implant', category: 'Implant', status: 'Sterilizing', quantity: 1 },
      ],
      checklist: [
        { id: 'cl-1', label: 'Identity Verification', status: 'Completed', signedBy: 'Nurse Hoa', signedAt: hoursFromNow(-1) },
        { id: 'cl-2', label: 'Surgical Consent', status: 'Completed', signedBy: 'Dr. Smith', signedAt: hoursFromNow(-0.9) },
        { id: 'cl-3', label: 'Allergy Review', status: 'Completed', signedBy: 'Nurse Linh', signedAt: hoursFromNow(-0.8) },
        { id: 'cl-4', label: 'Site Marking', status: 'Completed', signedBy: 'Dr. Smith', signedAt: hoursFromNow(-0.7) },
        { id: 'cl-5', label: 'Laboratory Results Reviewed', status: 'Completed', signedBy: 'Dr. Smith', signedAt: hoursFromNow(-0.6) },
        { id: 'cl-6', label: 'Imaging Reviewed', status: 'Pending', signedBy: null, signedAt: null },
        { id: 'cl-7', label: 'Blood Availability Confirmed', status: 'NotApplicable', signedBy: null, signedAt: null },
        { id: 'cl-8', label: 'Implant Availability Confirmed', status: 'Pending', signedBy: null, signedAt: null },
        { id: 'cl-9', label: 'Equipment Ready', status: 'Completed', signedBy: 'Tech Minh', signedAt: hoursFromNow(-0.5) },
        { id: 'cl-10', label: 'Timeout Verification', status: 'Pending', signedBy: null, signedAt: null },
      ],
      timeline: [
        { stage: 'Scheduled', occurredAt: hoursFromNow(-3) },
        { stage: 'PatientArrived', occurredAt: hoursFromNow(-1.2) },
        { stage: 'PreOpCompleted', occurredAt: hoursFromNow(-0.9) },
        { stage: 'AnesthesiaStarted', occurredAt: hoursFromNow(-0.8) },
        { stage: 'SurgeryStarted', occurredAt: hoursFromNow(-0.7) },
        { stage: 'ProcedureCompleted', occurredAt: null },
        { stage: 'Recovery', occurredAt: null },
        { stage: 'DischargedFromOr', occurredAt: null },
      ],
      notes: 'Patient stable under general anesthesia. Laparoscopic approach in progress.',
      complications: null,
      bloodLossMl: 40,
      estimatedRemainingMinutes: 20,
      pacuBay: null,
      recoveryStatus: null,
      postOpNotes: null,
      followUpOrders: null,
    };
  },

  patientSummary: (patientId: string): SurgeryPatientSummary => ({
    patientId,
    fullName: 'John Doe',
    mrn: 'PAT-2026-000142',
    diagnosis: 'Acute appendicitis with localized peritonitis',
    allergies: ['Penicillin'],
    consentStatus: 'Signed',
    riskAssessment: 'ASA Class II — moderate systemic disease, no functional limitation',
  }),
};
