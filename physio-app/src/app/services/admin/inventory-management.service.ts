import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import {
  InventoryAlert,
  InventoryHistoryEntry,
  InventoryKpis,
  InventoryMedicineCard,
  InventoryMedicineDetail,
  InventoryQuickCategory,
  StockInsight,
  StockMovementEvent,
  WarehouseBatch,
  WarehouseZone,
} from "../../shared/types/inventory-management.types";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class InventoryManagementService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // Methods
  getKpis() {
    return this.http.get<PagedResponse<InventoryKpis>>(BASE_API.INVENTORY.KPIS, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.KPIS }) });
  }

  getQuickCategories() {
    return this.http.get<PagedResponse<InventoryQuickCategory[]>>('/api/medicine-categories/search', { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.QUICK_CATEGORIES }) });
  }

  searchMedicines() {
    return this.http.get<PagedResponse<PaginationData<InventoryMedicineCard>>>(BASE_API.INVENTORY.MEDICINES_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINES_SEARCH }) });
  }

  lookupByBarcode(code: string) {
    return this.http.get<PagedResponse<InventoryMedicineCard | null>>(BASE_API.INVENTORY.MEDICINE_BARCODE(code), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_BARCODE }) });
  }

  getMedicineDetail(medicineId: string) {
    return this.http.get<PagedResponse<InventoryMedicineDetail>>(BASE_API.INVENTORY.MEDICINE_DETAIL(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_DETAIL }) });
  }

  getBatches(medicineId: string, sort: 'FEFO' | 'FIFO' = 'FEFO') {
    return this.http.get<PagedResponse<WarehouseBatch[]>>(BASE_API.INVENTORY.MEDICINE_BATCHES(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_BATCHES }) });
  }

  receiveStock(batchId: string, payload: { quantity: number; purchasePrice?: number; supplierId?: string; manufacturingDate?: string; expiryDate?: string }) {
    return this.http.post<PagedResponse<WarehouseBatch | null>>(BASE_API.INVENTORY.BATCH_RECEIVE(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_RECEIVE }) });
  }

  transferBatch(batchId: string, payload: { toZoneId: string; quantity: number }) {
    return this.http.post<PagedResponse<WarehouseBatch | null>>(BASE_API.INVENTORY.BATCH_TRANSFER(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_TRANSFER }) });
  }

  adjustQuantity(batchId: string, payload: { newQuantity: number; reason: string }) {
    return this.http.post<PagedResponse<WarehouseBatch | null>>(BASE_API.INVENTORY.BATCH_ADJUST(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_ADJUST }) });
  }

  reserveBatch(batchId: string, payload: { quantity: number; reference: string }) {
    return this.http.post<PagedResponse<WarehouseBatch | null>>(BASE_API.INVENTORY.BATCH_RESERVE(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_RESERVE }) });
  }

  lockBatch(batchId: string, reason: string) {
    return this.http.post<PagedResponse<WarehouseBatch | null>>(BASE_API.INVENTORY.BATCH_LOCK(batchId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_LOCK }) });
  }

  disposeBatch(batchId: string, payload: { reason: string; quantity: number }) {
    return this.http.post<PagedResponse<WarehouseBatch | null>>(BASE_API.INVENTORY.BATCH_DISPOSE(batchId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_DISPOSE }) });
  }

  printBarcode(batchId: string) {
    return this.http.get<PagedResponse<{ barcodeImageUrl: string }>>(BASE_API.INVENTORY.BATCH_BARCODE(batchId), { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.BATCH_BARCODE }) });
  }

  getWarehouseZones() {
    return this.http.get<PagedResponse<WarehouseZone[]>>(BASE_API.INVENTORY.WAREHOUSE_ZONES, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.WAREHOUSE_ZONES }) });
  }

  getInsights(medicineId?: string) {
    return this.http.get<PagedResponse<StockInsight[]>>(`${BASE_API.INVENTORY.INTELLIGENCE}${medicineId ? '?medicineId=' + medicineId : ''}`, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.INTELLIGENCE }) });
  }

  getMovements() {
    return this.http.get<PagedResponse<PaginationData<StockMovementEvent>>>(BASE_API.INVENTORY.MOVEMENTS, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MOVEMENTS }) });
  }

  getAlerts(medicineId?: string) {
    return this.http.get<PagedResponse<InventoryAlert[]>>(BASE_API.INVENTORY.ALERTS, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.ALERTS }) });
  }

  acknowledgeAlert(alertId: string, note?: string) {
    return this.http.post<PagedResponse<{ alertId: string }>>(BASE_API.INVENTORY.ALERT_ACKNOWLEDGE(alertId), { note }, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.ALERT_ACKNOWLEDGE }) });
  }

  getHistory(medicineId: string, type: 'purchase' | 'dispensing' | 'supplier') {
    return this.http.get<PagedResponse<PaginationData<InventoryHistoryEntry>>>(`${BASE_API.INVENTORY.MEDICINE_HISTORY(medicineId)}?type=${type}`, { context: createHttpContext({ loadingKey: LoadingKeys.INVENTORY.MEDICINE_HISTORY }) });
  }

  // #endregion
}
