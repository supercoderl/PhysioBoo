import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
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

@Injectable({ providedIn: 'root' })
export class RadiologyService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getStats() {
    return this.http.get<PagedResponse<RadiologyStats>>(BASE_API.RADIOLOGY.STATS, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.STATS }) });
  }

  getTrends() {
    return this.http.get<PagedResponse<RadiologyDashboardTrend>>(BASE_API.RADIOLOGY.TRENDS, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.TRENDS }) });
  }

  getAlerts() {
    return this.http.get<PagedResponse<CriticalFindingAlert[]>>(BASE_API.RADIOLOGY.ALERTS, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.ALERTS }) });
  }

  acknowledgeAlert(alertId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.RADIOLOGY.ALERT_ACKNOWLEDGE(alertId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.ACKNOWLEDGE }) });
  }

  getOrders() {
    return this.http.get<PagedResponse<PaginationData<ImagingOrderRow>>>(BASE_API.RADIOLOGY.ORDERS_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.ORDERS_SEARCH }) });
  }

  getScheduleSlots() {
    return this.http.get<PagedResponse<PaginationData<ScheduleSlot>>>(BASE_API.RADIOLOGY.SCHEDULE_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.SCHEDULE_SEARCH }) });
  }

  rescheduleSlot(slotId: string, scheduledTime: string, roomName: string) {
    return this.http.patch<PagedResponse<ScheduleSlot>>(BASE_API.RADIOLOGY.SCHEDULE_RESCHEDULE(slotId), { scheduledTime, roomName }, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.SCHEDULE_RESCHEDULE }) });
  }

  cancelSlot(slotId: string, reason: string) {
    return this.http.post<PagedResponse<ScheduleSlot>>(BASE_API.RADIOLOGY.SCHEDULE_CANCEL(slotId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.SCHEDULE_CANCEL }) });
  }

  reassignTechnician(slotId: string, technicianName: string) {
    return this.http.patch<PagedResponse<ScheduleSlot>>(BASE_API.RADIOLOGY.SCHEDULE_REASSIGN(slotId), { technicianName }, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.SCHEDULE_REASSIGN }) });
  }

  getQueue() {
    return this.http.get<PagedResponse<QueueEntry[]>>(BASE_API.RADIOLOGY.QUEUE, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.QUEUE }) });
  }

  advanceQueueEntry(entryId: string, status: QueueStatus) {
    return this.http.patch<PagedResponse<QueueEntry>>(BASE_API.RADIOLOGY.QUEUE_ADVANCE(entryId), { status }, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.QUEUE_ADVANCE }) });
  }

  getStudies() {
    return this.http.get<PagedResponse<PaginationData<StudyRecord>>>(BASE_API.RADIOLOGY.STUDIES_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.STUDIES_SEARCH }) });
  }

  getStudyDetail(studyId: string) {
    return this.http.get<PagedResponse<StudyRecord>>(BASE_API.RADIOLOGY.STUDY_DETAIL(studyId), { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.STUDY_DETAIL }) });
  }

  getReport(orderId: string) {
    return this.http.get<PagedResponse<RadiologyReport>>(BASE_API.RADIOLOGY.REPORT_DETAIL(orderId), { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.REPORT_DETAIL }) });
  }

  saveReportDraft(orderId: string, report: Partial<RadiologyReport>) {
    return this.http.patch<PagedResponse<RadiologyReport>>(BASE_API.RADIOLOGY.REPORT_DETAIL(orderId), report, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.REPORT_SAVE }) });
  }

  getReportTemplates() {
    return this.http.get<PagedResponse<RadiologyReportTemplate[]>>(BASE_API.RADIOLOGY.REPORT_TEMPLATES, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.REPORT_TEMPLATES }) });
  }

  approveReport(orderId: string) {
    return this.http.post<PagedResponse<RadiologyReport>>(BASE_API.RADIOLOGY.REPORT_APPROVE(orderId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.REPORT_APPROVE }) });
  }

  rejectReport(orderId: string, reason: string) {
    return this.http.post<PagedResponse<RadiologyReport>>(BASE_API.RADIOLOGY.REPORT_REJECT(orderId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.REPORT_REJECT }) });
  }

  returnReportForRevision(orderId: string, reason: string) {
    return this.http.post<PagedResponse<RadiologyReport>>(BASE_API.RADIOLOGY.REPORT_RETURN_FOR_REVISION(orderId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.REPORT_RETURN_FOR_REVISION }) });
  }

  getPatientSummary(patientId: string) {
    return this.http.get<PagedResponse<RadiologyPatientStudySummary>>(BASE_API.RADIOLOGY.PATIENT_SUMMARY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.PATIENT_SUMMARY }) });
  }

  getPatientHistory(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<ImagingOrderRow>>>(BASE_API.RADIOLOGY.PATIENT_HISTORY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.RADIOLOGY.PATIENT_HISTORY }) });
  }
  // #endregion
}
