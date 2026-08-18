import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
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

/**
 * Treatment Sheet data layer. Every method calls the planned REST endpoint (see
 * docs/treatment-sheet-redesign.md §13). Errors propagate to callers — the
 * global HTTP interceptor surfaces a toast automatically.
 */
@Injectable({ providedIn: 'root' })
export class TreatmentSheetService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // Methods
  getSummary(patientId: string) {
    return this.http.get<PagedResponse<TreatmentPatientSummary>>(BASE_API.TREATMENT_SHEET.SUMMARY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.SUMMARY }) });
  }

  getStats(patientId: string) {
    return this.http.get<PagedResponse<TreatmentStats>>(BASE_API.TREATMENT_SHEET.STATS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.STATS }) });
  }

  getAlerts(patientId: string) {
    return this.http.get<PagedResponse<ClinicalAlert[]>>(BASE_API.TREATMENT_SHEET.ALERTS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.ALERTS }) });
  }

  acknowledgeAlert(alertId: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.TREATMENT_SHEET.ALERT_ACKNOWLEDGE(alertId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.ACKNOWLEDGE }) });
  }

  getTimeline(patientId: string, filter: TreatmentTimelineFilter) {
    const params = `?range=${filter.range}${filter.from ? `&from=${filter.from}` : ''}${filter.to ? `&to=${filter.to}` : ''}`;
    return this.http.get<PagedResponse<TreatmentTimelineEntry[]>>(`${BASE_API.TREATMENT_SHEET.TIMELINE(patientId)}${params}`, { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.TIMELINE }) });
  }

  getOrders(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<TreatmentOrder>>>(BASE_API.TREATMENT_SHEET.ORDERS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.ORDERS }) });
  }

  updateOrderStatus(orderId: string, status: TreatmentOrder['status']) {
    return this.http.patch<PagedResponse<TreatmentOrder>>(BASE_API.TREATMENT_SHEET.ORDER_UPDATE(orderId), { status }, { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.ORDER_UPDATE }) });
  }

  getMedications(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<MedicationAdministration>>>(BASE_API.TREATMENT_SHEET.MEDICATIONS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.MEDICATIONS }) });
  }

  updateMedicationStatus(entryId: string, status: MedicationAdministration['status'], notes?: string) {
    return this.http.patch<PagedResponse<MedicationAdministration>>(BASE_API.TREATMENT_SHEET.MEDICATION_UPDATE(entryId), { status, notes }, { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.MEDICATION_UPDATE }) });
  }

  getProcedures(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<TreatmentProcedureRow>>>(BASE_API.TREATMENT_SHEET.PROCEDURES(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.PROCEDURES }) });
  }

  addProcedure(patientId: string, procedure: Omit<TreatmentProcedureRow, 'id'>) {
    return this.http.post<PagedResponse<TreatmentProcedureRow>>(BASE_API.TREATMENT_SHEET.PROCEDURES(patientId), procedure, { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.ADD_PROCEDURE }) });
  }

  getLabOrders(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<TreatmentLabOrderRow>>>(BASE_API.TREATMENT_SHEET.LABS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.LABS }) });
  }

  getImagingOrders(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<TreatmentImagingOrderRow>>>(BASE_API.TREATMENT_SHEET.IMAGING(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.IMAGING }) });
  }

  getNotes(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<TreatmentProgressNote>>>(BASE_API.TREATMENT_SHEET.NOTES(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.NOTES }) });
  }

  addNote(patientId: string, type: TreatmentProgressNote['type'], content: string) {
    return this.http.post<PagedResponse<TreatmentProgressNote>>(BASE_API.TREATMENT_SHEET.NOTES(patientId), { type, content }, { context: createHttpContext({ loadingKey: LoadingKeys.TREATMENT.ADD_NOTE }) });
  }

  // #endregion
}
