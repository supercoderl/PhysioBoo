import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
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

@Injectable({ providedIn: 'root' })
export class NursingService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getAssignments(filter: NursingAssignmentFilter) {
    const params = `?shift=${filter.shift}${filter.wardId ? `&wardId=${filter.wardId}` : ''}`;
    return this.http.get<PagedResponse<NursingPatient[]>>(`${BASE_API.NURSING.ASSIGNMENTS}${params}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.ASSIGNMENTS }) });
  }

  getStats(shift: ShiftCode) {
    return this.http.get<PagedResponse<NursingStats>>(`${BASE_API.NURSING.STATS}?shift=${shift}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.STATS }) });
  }

  getAlerts(shift: ShiftCode) {
    return this.http.get<PagedResponse<NursingAlert[]>>(`${BASE_API.NURSING.ALERTS}?shift=${shift}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.ALERTS }) });
  }

  acknowledgeAlert(alertId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.NURSING.ALERT_ACKNOWLEDGE(alertId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.ACKNOWLEDGE }) });
  }

  getPatient(patientId: string) {
    return this.http.get<PagedResponse<NursingPatient>>(BASE_API.NURSING.PATIENT(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.PATIENT }) });
  }

  getVitals(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<VitalsReading>>>(BASE_API.NURSING.VITALS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.VITALS }) });
  }

  addVitalsReading(patientId: string, reading: Omit<VitalsReading, 'id' | 'patientId'>) {
    return this.http.post<PagedResponse<VitalsReading>>(BASE_API.NURSING.VITALS(patientId), reading, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.VITAL_ADD }) });
  }

  getMar(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<MarEntry>>>(BASE_API.NURSING.MAR(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.MAR }) });
  }

  updateMarStatus(marEntryId: string, status: MarEntry['status'], reason?: string) {
    return this.http.patch<PagedResponse<MarEntry>>(BASE_API.NURSING.MAR_UPDATE(marEntryId), { status, reason }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.MAR_UPDATE }) });
  }

  getIntakeOutput(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<IntakeOutputEntry>>>(BASE_API.NURSING.IO(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.IO }) });
  }

  addIntakeOutputEntry(patientId: string, entry: Omit<IntakeOutputEntry, 'id' | 'patientId'>) {
    return this.http.post<PagedResponse<IntakeOutputEntry>>(BASE_API.NURSING.IO(patientId), entry, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.IO_ADD }) });
  }

  getTasks(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<NursingTask>>>(BASE_API.NURSING.TASKS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.TASKS }) });
  }

  updateTaskStatus(taskId: string, status: NursingTask['status']) {
    return this.http.patch<PagedResponse<NursingTask>>(BASE_API.NURSING.TASK_UPDATE(taskId), { status }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.TASK_UPDATE }) });
  }

  getNotes(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<Note>>>(BASE_API.NURSING.NOTES(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.NOTES }) });
  }

  addNote(patientId: string, content: string) {
    return this.http.post<PagedResponse<Note>>(BASE_API.NURSING.NOTES(patientId), { content }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.NOTE_ADD }) });
  }

  getHandoverCards(outgoingShift: ShiftCode, wardId?: string | null) {
    const params = `?outgoingShift=${outgoingShift}${wardId ? `&wardId=${wardId}` : ''}`;
    return this.http.get<PagedResponse<ShiftHandoverCard[]>>(`${BASE_API.NURSING.HANDOVER}${params}`, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.HANDOVER }) });
  }

  acknowledgeHandover(cardId: string, acknowledgedBy: string) {
    return this.http.post<PagedResponse<ShiftHandoverCard>>(BASE_API.NURSING.HANDOVER_ACKNOWLEDGE(cardId), { acknowledgedBy }, { context: createHttpContext({ loadingKey: LoadingKeys.NURSING.HANDOVER_ACKNOWLEDGE }) });
  }
  // #endregion
}
