import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
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

/**
 * Surgery (ORMS) data layer. Every method calls the planned REST endpoint (see
 * docs/surgery-redesign.md §13). Errors propagate to callers — the global HTTP
 * interceptor surfaces a toast automatically.
 */
@Injectable({ providedIn: 'root' })
export class SurgeryService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getStats() {
    return this.http.get<PagedResponse<SurgeryStats>>(BASE_API.SURGERY.STATS, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.STATS }) });
  }

  getTrends() {
    return this.http.get<PagedResponse<SurgeryDashboardTrend>>(BASE_API.SURGERY.TRENDS, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.TRENDS }) });
  }

  getAlerts() {
    return this.http.get<PagedResponse<SurgeryCriticalAlert[]>>(BASE_API.SURGERY.ALERTS, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.ALERTS }) });
  }

  acknowledgeAlert(alertId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.SURGERY.ALERT_ACKNOWLEDGE(alertId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.ACKNOWLEDGE }) });
  }

  getCases() {
    return this.http.get<PagedResponse<PaginationData<SurgeryRow>>>(BASE_API.SURGERY.CASES_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.CASES_SEARCH }) });
  }

  getCaseDetail(surgeryId: string) {
    return this.http.get<PagedResponse<SurgeryCase>>(BASE_API.SURGERY.CASE_DETAIL(surgeryId), { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.CASE_DETAIL }) });
  }

  cancelCase(surgeryId: string, reason: string) {
    return this.http.post<PagedResponse<SurgeryRow>>(BASE_API.SURGERY.CASE_CANCEL(surgeryId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.CASE_CANCEL }) });
  }

  getRooms() {
    return this.http.get<PagedResponse<OperatingRoom[]>>(BASE_API.SURGERY.ROOMS, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.ROOMS }) });
  }

  updateRoomStatus(roomId: string, status: OperatingRoomStatus) {
    return this.http.patch<PagedResponse<OperatingRoom>>(BASE_API.SURGERY.ROOM_STATUS(roomId), { status }, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.ROOM_STATUS }) });
  }

  updateChecklistItem(surgeryId: string, itemId: string, status: ChecklistItemStatus, signedBy: string) {
    return this.http.patch<PagedResponse<PreOpChecklistItem>>(BASE_API.SURGERY.CHECKLIST_ITEM(surgeryId, itemId), { status, signedBy }, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.CHECKLIST_ITEM }) });
  }

  assignTeamMember(surgeryId: string, memberId: string, staffId: string, role: string) {
    return this.http.patch<PagedResponse<SurgicalTeamMember>>(BASE_API.SURGERY.TEAM_MEMBER(surgeryId, memberId), { staffId, role }, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.TEAM_MEMBER }) });
  }

  updateEquipmentItem(surgeryId: string, itemId: string, status: string, quantity?: number) {
    return this.http.patch<PagedResponse<EquipmentItem>>(BASE_API.SURGERY.EQUIPMENT_ITEM(surgeryId, itemId), { status, quantity }, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.EQUIPMENT_ITEM }) });
  }

  advanceTimelineStage(surgeryId: string, stage: SurgeryTimelineStage) {
    return this.http.post<PagedResponse<string>>(BASE_API.SURGERY.TIMELINE_STAGE(surgeryId, stage), {}, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.TIMELINE_STAGE }) });
  }

  updateIntraOp(surgeryId: string, payload: { notes?: string; complications?: string; bloodLossMl?: number; estimatedRemainingMinutes?: number }) {
    return this.http.patch<PagedResponse<SurgeryCase>>(BASE_API.SURGERY.INTRAOP_UPDATE(surgeryId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.INTRAOP_UPDATE }) });
  }

  updatePostOp(surgeryId: string, payload: { pacuBay?: string; recoveryStatus?: string; postOpNotes?: string; complications?: string; followUpOrders?: string }) {
    return this.http.patch<PagedResponse<SurgeryCase>>(BASE_API.SURGERY.POSTOP_UPDATE(surgeryId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.POSTOP_UPDATE }) });
  }

  dischargeCase(surgeryId: string) {
    return this.http.post<PagedResponse<SurgeryRow>>(BASE_API.SURGERY.DISCHARGE(surgeryId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.DISCHARGE }) });
  }

  getPatientSummary(patientId: string) {
    return this.http.get<PagedResponse<SurgeryPatientSummary>>(BASE_API.SURGERY.PATIENT_SUMMARY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.SURGERY.PATIENT_SUMMARY }) });
  }

  // #endregion
}
