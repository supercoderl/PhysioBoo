import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import {
  AdjustStockPayload,
  DisposeStockPayload,
  InventoryBatch,
  InventoryHistoryEntry,
  InventoryKpis,
  InventoryMedicine,
  InventoryMedicineDetail,
  InventorySearchQuery,
  InventoryZone,
  normalizeBatchStatus,
  ReceiveStockPayload,
  TransferStockPayload,
} from "../../shared/types/inventory-management.types";
import { LoadingKeys } from "../../shared/types/loading";

/** A batch as the API sends it: the lifecycle status is the enum's number. */
type RawBatch = Omit<InventoryBatch, 'status'> & { status: number | string };

@Injectable({ providedIn: 'root' })
export class InventoryManagementService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Reads
  getKpis() {
    return this.http.get<PagedResponse<InventoryKpis>>(BASE_API.INVENTORY.KPIS, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.KPIS }) });
  }

  /** The API requires both paging parameters; `search` and `categoryId` are only sent when set. */
  searchMedicines(query: InventorySearchQuery) {
    let params = new HttpParams().set('pageNumber', query.pageNumber).set('pageSize', query.pageSize);
    if (query.search.trim()) params = params.set('search', query.search.trim());
    if (query.categoryId) params = params.set('categoryId', query.categoryId);

    return this.http.get<PagedResponse<PaginationData<InventoryMedicine>>>(BASE_API.INVENTORY.MEDICINES_SEARCH, {
      params,
      context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINES_SEARCH }),
    });
  }

  getMedicineDetail(medicineId: string) {
    return this.http.get<PagedResponse<InventoryMedicineDetail | null>>(BASE_API.INVENTORY.MEDICINE_DETAIL(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_DETAIL }) });
  }

  /** Earliest expiry first (FEFO), as the API orders them. */
  getBatches(medicineId: string) {
    return this.http.get<PagedResponse<RawBatch[]>>(BASE_API.INVENTORY.MEDICINE_BATCHES(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_BATCHES }) })
      .pipe(map(res => ({ ...res, data: (res.data ?? []).map(toBatch) })));
  }

  getHistory(medicineId: string) {
    return this.http.get<PagedResponse<InventoryHistoryEntry[]>>(BASE_API.INVENTORY.MEDICINE_HISTORY(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_HISTORY }) });
  }

  getZones() {
    return this.http.get<PagedResponse<InventoryZone[]>>(BASE_API.INVENTORY.WAREHOUSE_ZONES, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.WAREHOUSE_ZONES }) });
  }
  // #endregion

  // #region Batch operations
  receiveStock(batchId: string, payload: ReceiveStockPayload) {
    return this.http.post<PagedResponse<RawBatch | null>>(BASE_API.INVENTORY.BATCH_RECEIVE(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_RECEIVE }) });
  }

  adjustQuantity(batchId: string, payload: AdjustStockPayload) {
    return this.http.post<PagedResponse<RawBatch | null>>(BASE_API.INVENTORY.BATCH_ADJUST(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_ADJUST }) });
  }

  transferBatch(batchId: string, payload: TransferStockPayload) {
    return this.http.post<PagedResponse<RawBatch | null>>(BASE_API.INVENTORY.BATCH_TRANSFER(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_TRANSFER }) });
  }

  disposeBatch(batchId: string, payload: DisposeStockPayload) {
    return this.http.post<PagedResponse<RawBatch | null>>(BASE_API.INVENTORY.BATCH_DISPOSE(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_DISPOSE }) });
  }
  // #endregion
}

function toBatch(raw: RawBatch): InventoryBatch {
  return { ...raw, status: normalizeBatchStatus(raw.status) };
}
