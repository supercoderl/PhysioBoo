import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { NursingNote } from "../../shared/types/nursing.types";
import {
  AddIntakeOutputRequest,
  AddVitalsRequest,
  CreateNursingAssignmentRequest,
  CreateNursingTaskRequest,
  IntakeOutputEntry,
  MarEntry,
  NursingAlert,
  NursingAssignmentFilter,
  NursingPatient,
  NursingStats,
  NursingTask,
  ScheduleMedicationRequest,
  ShiftCode,
  ShiftHandoverCard,
  VitalsReading,
} from "../../shared/types/nursing.types";

@Injectable({ providedIn: 'root' })
export class NursingService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getAssignments(filter: NursingAssignmentFilter) {
    const params = `?shift=${filter.shift}${filter.wardId ? `&wardId=${filter.wardId}` : ''}`;
    return this.http.get<PagedResponse<NursingPatient[]>>(`${BASE_API.NURSING.ASSIGNMENTS}${params}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.ASSIGNMENTS, skipErrorToast: true }) });
  }

  getStats(shift: ShiftCode) {
    return this.http.get<PagedResponse<NursingStats>>(`${BASE_API.NURSING.STATS}?shift=${shift}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.STATS, skipErrorToast: true }) });
  }

  getAlerts(shift: ShiftCode) {
    return this.http.get<PagedResponse<NursingAlert[]>>(`${BASE_API.NURSING.ALERTS}?shift=${shift}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.ALERTS, skipErrorToast: true }) });
  }

  acknowledgeAlert(alertId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.NURSING.ALERT_ACKNOWLEDGE(alertId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.ACKNOWLEDGE }) });
  }

  getPatient(patientId: string) {
    return this.http.get<PagedResponse<NursingPatient>>(BASE_API.NURSING.PATIENT(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.PATIENT, skipErrorToast: true }) });
  }

  getVitals(patientId: string, pageNumber = 1) {
    return this.http.get<PagedResponse<PaginationData<VitalsReading>>>(`${BASE_API.NURSING.VITALS(patientId)}?pageNumber=${pageNumber}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.VITALS, skipErrorToast: true }) });
  }

  addVitalsReading(patientId: string, reading: AddVitalsRequest) {
    return this.http.post<PagedResponse<VitalsReading>>(BASE_API.NURSING.VITALS(patientId), reading, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.VITAL_ADD }) });
  }

  getMar(patientId: string, pageNumber = 1) {
    return this.http.get<PagedResponse<PaginationData<MarEntry>>>(`${BASE_API.NURSING.MAR(patientId)}?pageNumber=${pageNumber}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.MAR, skipErrorToast: true }) });
  }

  updateMarStatus(marEntryId: string, status: MarEntry['status'], reason?: string) {
    return this.http.patch<PagedResponse<MarEntry>>(BASE_API.NURSING.MAR_UPDATE(marEntryId), { status, reason }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.MAR_UPDATE }) });
  }

  getIntakeOutput(patientId: string, pageNumber = 1) {
    return this.http.get<PagedResponse<PaginationData<IntakeOutputEntry>>>(`${BASE_API.NURSING.IO(patientId)}?pageNumber=${pageNumber}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.IO, skipErrorToast: true }) });
  }

  addIntakeOutputEntry(patientId: string, entry: AddIntakeOutputRequest) {
    return this.http.post<PagedResponse<IntakeOutputEntry>>(BASE_API.NURSING.IO(patientId), entry, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.IO_ADD }) });
  }

  getTasks(patientId: string, pageNumber = 1) {
    return this.http.get<PagedResponse<PaginationData<NursingTask>>>(`${BASE_API.NURSING.TASKS(patientId)}?pageNumber=${pageNumber}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.TASKS, skipErrorToast: true }) });
  }

  updateTaskStatus(taskId: string, status: NursingTask['status']) {
    return this.http.patch<PagedResponse<NursingTask>>(BASE_API.NURSING.TASK_UPDATE(taskId), { status }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.TASK_UPDATE }) });
  }

  // Management (no UI yet): assignments, tasks and scheduled doses are created through these.
  createAssignment(params: CreateNursingAssignmentRequest) {
    return this.http.post<PagedResponse<string>>(BASE_API.NURSING.ASSIGNMENTS, params);
  }

  deleteAssignment(assignmentId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.NURSING.ASSIGNMENT_BY_ID(assignmentId));
  }

  createTask(patientId: string, params: CreateNursingTaskRequest) {
    return this.http.post<PagedResponse<NursingTask>>(BASE_API.NURSING.TASKS(patientId), params);
  }

  scheduleMedication(patientId: string, params: ScheduleMedicationRequest) {
    return this.http.post<PagedResponse<MarEntry>>(BASE_API.NURSING.MAR(patientId), params);
  }

  getNotes(patientId: string, pageNumber = 1) {
    return this.http.get<PagedResponse<PaginationData<NursingNote>>>(`${BASE_API.NURSING.NOTES(patientId)}?pageNumber=${pageNumber}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.NOTES, skipErrorToast: true }) });
  }

  addNote(patientId: string, content: string) {
    return this.http.post<PagedResponse<NursingNote>>(BASE_API.NURSING.NOTES(patientId), { content }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.NOTE_ADD }) });
  }

  getHandoverCards(outgoingShift: ShiftCode, wardId?: string | null, quiet = false) {
    const params = `?outgoingShift=${outgoingShift}${wardId ? `&wardId=${wardId}` : ''}`;
    return this.http.get<PagedResponse<ShiftHandoverCard[]>>(`${BASE_API.NURSING.HANDOVER}${params}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.HANDOVER, skipErrorToast: quiet }) });
  }

  updateHandover(cardId: string, sbar: Pick<ShiftHandoverCard, 'situation' | 'background' | 'assessment' | 'recommendation'>) {
    return this.http.patch<PagedResponse<ShiftHandoverCard>>(BASE_API.NURSING.HANDOVER_UPDATE(cardId), sbar, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.HANDOVER_ACKNOWLEDGE }) });
  }

  /** The server records the signed-in user as the acknowledger; the body is required but its value is ignored. */
  acknowledgeHandover(cardId: string) {
    return this.http.post<PagedResponse<ShiftHandoverCard>>(BASE_API.NURSING.HANDOVER_ACKNOWLEDGE(cardId), { acknowledgedBy: null }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.HANDOVER_ACKNOWLEDGE }) });
  }
  // #endregion
}
