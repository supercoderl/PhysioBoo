import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
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

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // Methods
  getStats() {
    return this.http.get<PagedResponse<LabStats>>(BASE_API.LABORATORY.STATS, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.STATS }) });
  }

  getTrends() {
    return this.http.get<PagedResponse<LabDashboardTrend>>(BASE_API.LABORATORY.TRENDS, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.TRENDS }) });
  }

  getAlerts() {
    return this.http.get<PagedResponse<LabCriticalAlert[]>>(BASE_API.LABORATORY.ALERTS, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.ALERTS }) });
  }

  acknowledgeAlert(alertId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.LABORATORY.ALERT_ACKNOWLEDGE(alertId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.ALERT_ACKNOWLEDGE }) });
  }

  getOrders() {
    return this.http.get<PagedResponse<PaginationData<LabOrderRow>>>(BASE_API.LABORATORY.ORDERS_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.ORDERS }) });
  }

  getSamples() {
    return this.http.get<PagedResponse<PaginationData<LabSample>>>(BASE_API.LABORATORY.SAMPLES_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.SAMPLES }) });
  }

  markSampleCollected(sampleId: string, collectorName: string, containerType: string) {
    return this.http.patch<PagedResponse<LabSample>>(BASE_API.LABORATORY.SAMPLE_COLLECT(sampleId), { collectorName, containerType }, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.SAMPLES_COLLECT }) });
  }

  recollectSample(sampleId: string, reason: string) {
    return this.http.post<PagedResponse<LabSample>>(BASE_API.LABORATORY.SAMPLE_RECOLLECT(sampleId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.SAMPLES_RECOLLECT }) });
  }

  rejectSample(sampleId: string, reason: string) {
    return this.http.post<PagedResponse<LabSample>>(BASE_API.LABORATORY.SAMPLE_REJECT(sampleId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.SAMPLES_REJECT }) });
  }

  getResults() {
    return this.http.get<PagedResponse<PaginationData<LabResultEntry>>>(BASE_API.LABORATORY.RESULTS_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.RESULTS_SEARCH }) });
  }

  updateResultValue(resultId: string, value: string, comments?: string) {
    return this.http.patch<PagedResponse<LabResultEntry>>(BASE_API.LABORATORY.RESULT_UPDATE(resultId), { value, comments }, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.RESULT_UPDATE }) });
  }

  approveResult(resultId: string) {
    return this.http.post<PagedResponse<LabResultEntry>>(BASE_API.LABORATORY.RESULT_APPROVE(resultId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.RESULT_APPROVE }) });
  }

  rejectResult(resultId: string, reason: string) {
    return this.http.post<PagedResponse<LabResultEntry>>(BASE_API.LABORATORY.RESULT_REJECT(resultId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.RESULT_REJECT }) });
  }

  returnResultForReview(resultId: string, reason: string) {
    return this.http.post<PagedResponse<LabResultEntry>>(BASE_API.LABORATORY.RESULT_RETURN_FOR_REVIEW(resultId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.RESULT_RETURN_FOR_REVIEW }) });
  }

  getPatientSummary(patientId: string) {
    return this.http.get<PagedResponse<LabPatientResultSummary>>(BASE_API.LABORATORY.PATIENT_SUMMARY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.PATIENT_SUMMARY }) });
  }

  getPatientHistory(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<LabOrderRow>>>(BASE_API.LABORATORY.PATIENT_HISTORY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.LABORATORY.PATIENT_HISTORY }) });
  }
  // #endregion
}
