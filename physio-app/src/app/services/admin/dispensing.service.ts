import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import {
  BatchOption,
  DispenseItemStatus,
  DispenseMedicationItem,
  DispenseMedicineDetail,
  DispenseQueueItem,
  DispenseQueueStats,
  DispenseQueueStatus,
  DispenseSummary,
  DispenseWorkspace,
} from "../../shared/types/dispensing.types";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class DispensingService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // Methods
  getQueue(search?: string, status?: DispenseQueueStatus | null) {
    return this.http.get<PagedResponse<PaginationData<DispenseQueueItem>>>(BASE_API.DISPENSING.QUEUE, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.QUEUE }) });
  }

  getStats() {
    return this.http.get<PagedResponse<DispenseQueueStats>>(BASE_API.DISPENSING.STATS, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.STATS }) });
  }

  getWorkspace(queueId: string) {
    return this.http.get<PagedResponse<DispenseWorkspace>>(BASE_API.DISPENSING.WORKSPACE(queueId), { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.WORKSPACE }) });
  }

  acknowledgeAlert(workspaceId: string, alertId: string, note?: string) {
    return this.http.post<PagedResponse<{ alertId: string }>>(BASE_API.DISPENSING.ALERT_ACKNOWLEDGE(workspaceId, alertId), { note }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.ALERT_ACKNOWLEDGE }) });
  }

  updateItem(workspaceId: string, itemId: string, patch: { qtyToDispense?: number; status?: DispenseItemStatus; batchNo?: string }) {
    return this.http.patch<PagedResponse<DispenseMedicationItem | null>>(BASE_API.DISPENSING.ITEM_UPDATE(workspaceId, itemId), patch, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.ITEM_UPDATE }) });
  }

  replaceItem(workspaceId: string, itemId: string, alternativeMedicineId: string, reason: string) {
    return this.http.post<PagedResponse<DispenseMedicationItem | null>>(BASE_API.DISPENSING.ITEM_REPLACE(workspaceId, itemId), { alternativeMedicineId, reason }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.ITEM_REPLACE }) });
  }

  reserveItem(workspaceId: string, itemId: string, note?: string) {
    return this.http.post<PagedResponse<DispenseMedicationItem | null>>(BASE_API.DISPENSING.ITEM_RESERVE(workspaceId, itemId), { note }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.ITEM_RESERVE }) });
  }

  scanItem(workspaceId: string, itemId: string, barcode: string) {
    return this.http.post<PagedResponse<{ matched: boolean }>>(BASE_API.DISPENSING.ITEM_SCAN(workspaceId, itemId), { barcode }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.ITEM_SCAN }) });
  }

  getBatches(medicineId: string) {
    return this.http.get<PagedResponse<BatchOption[]>>(BASE_API.DISPENSING.MEDICINE_BATCHES(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.MEDICINE_BATCHES }) });
  }

  getMedicineDetail(medicineId: string) {
    return this.http.get<PagedResponse<DispenseMedicineDetail>>(BASE_API.DISPENSING.MEDICINE_DETAIL(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.MEDICINE_DETAIL }) });
  }

  holdPrescription(workspaceId: string, reason: string) {
    return this.http.post<PagedResponse<{ workspaceId: string }>>(BASE_API.DISPENSING.HOLD(workspaceId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.HOLD }) });
  }

  cancelPrescription(workspaceId: string, reason: string) {
    return this.http.post<PagedResponse<{ workspaceId: string }>>(BASE_API.DISPENSING.CANCEL(workspaceId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.CANCEL }) });
  }

  completeDispensing(workspaceId: string, pharmacistNotes?: string) {
    return this.http.post<PagedResponse<DispenseSummary>>(BASE_API.DISPENSING.COMPLETE(workspaceId), { pharmacistNotes }, { context: createHttpContext({ loadingKey: LoadingKeys.DISPENSING.COMPLETE }) });
  }

  // #endregion
}
