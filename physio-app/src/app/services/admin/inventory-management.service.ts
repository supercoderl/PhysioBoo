import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
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
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class InventoryManagementService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // Methods
  getKpis() {
    return this.httpSrv.getOr<InventoryKpis>(BASE_API.INVENTORY.KPIS, MOCK.kpis, LoadingKeys.INVENTORY.KPIS);
  }

  getQuickCategories() {
    return this.httpSrv.getOr<InventoryQuickCategory[]>('/api/medicine-categories/search', MOCK.quickCategories, LoadingKeys.INVENTORY.QUICK_CATEGORIES);
  }

  searchMedicines() {
    return this.httpSrv.getOr<PaginationData<InventoryMedicineCard>>(BASE_API.INVENTORY.MEDICINES_SEARCH, { ...PaginationDataWithInit<InventoryMedicineCard>(), items: MOCK.medicines(), totalCount: MOCK.medicines().length }, LoadingKeys.INVENTORY.MEDICINES_SEARCH);
  }

  lookupByBarcode(code: string) {
    const match = MOCK.medicines().find(m => m.barcode === code) ?? null;
    return this.httpSrv.getOr<InventoryMedicineCard | null>(BASE_API.INVENTORY.MEDICINE_BARCODE(code), match, LoadingKeys.INVENTORY.MEDICINE_BARCODE);
  }

  getMedicineDetail(medicineId: string) {
    return this.httpSrv.getOr<InventoryMedicineDetail>(BASE_API.INVENTORY.MEDICINE_DETAIL(medicineId), MOCK.medicineDetail(medicineId), LoadingKeys.INVENTORY.MEDICINE_DETAIL);
  }

  getBatches(medicineId: string, sort: 'FEFO' | 'FIFO' = 'FEFO') {
    const batches = MOCK.batches(medicineId).sort((a, b) =>
      sort === 'FEFO'
        ? new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        : new Date(a.manufacturingDate).getTime() - new Date(b.manufacturingDate).getTime());
    return this.httpSrv.getOr<WarehouseBatch[]>(BASE_API.INVENTORY.MEDICINE_BATCHES(medicineId), batches, LoadingKeys.INVENTORY.MEDICINE_BATCHES);
  }

  receiveStock(batchId: string, payload: { quantity: number; purchasePrice?: number; supplierId?: string; manufacturingDate?: string; expiryDate?: string }) {
    return this.httpSrv.postOr<WarehouseBatch | null>(BASE_API.INVENTORY.BATCH_RECEIVE(batchId), payload, null, LoadingKeys.INVENTORY.BATCH_RECEIVE);
  }

  transferBatch(batchId: string, payload: { toZoneId: string; quantity: number }) {
    return this.httpSrv.postOr<WarehouseBatch | null>(BASE_API.INVENTORY.BATCH_TRANSFER(batchId), payload, null, LoadingKeys.INVENTORY.BATCH_TRANSFER);
  }

  adjustQuantity(batchId: string, payload: { newQuantity: number; reason: string }) {
    return this.httpSrv.postOr<WarehouseBatch | null>(BASE_API.INVENTORY.BATCH_ADJUST(batchId), payload, null, LoadingKeys.INVENTORY.BATCH_ADJUST);
  }

  reserveBatch(batchId: string, payload: { quantity: number; reference: string }) {
    return this.httpSrv.postOr<WarehouseBatch | null>(BASE_API.INVENTORY.BATCH_RESERVE(batchId), payload, null, LoadingKeys.INVENTORY.BATCH_RESERVE);
  }

  lockBatch(batchId: string, reason: string) {
    return this.httpSrv.postOr<WarehouseBatch | null>(BASE_API.INVENTORY.BATCH_LOCK(batchId), { reason }, null, LoadingKeys.INVENTORY.BATCH_LOCK);
  }

  disposeBatch(batchId: string, payload: { reason: string; quantity: number }) {
    return this.httpSrv.postOr<WarehouseBatch | null>(BASE_API.INVENTORY.BATCH_DISPOSE(batchId), payload, null, LoadingKeys.INVENTORY.BATCH_DISPOSE);
  }

  printBarcode(batchId: string) {
    return this.httpSrv.getOr<{ barcodeImageUrl: string }>(BASE_API.INVENTORY.BATCH_BARCODE(batchId), { barcodeImageUrl: '' }, LoadingKeys.INVENTORY.BATCH_BARCODE);
  }

  getWarehouseZones() {
    return this.httpSrv.getOr<WarehouseZone[]>(BASE_API.INVENTORY.WAREHOUSE_ZONES, MOCK.zones(), LoadingKeys.INVENTORY.WAREHOUSE_ZONES);
  }

  getInsights(medicineId?: string) {
    return this.httpSrv.getOr<StockInsight[]>(`${BASE_API.INVENTORY.INTELLIGENCE}${medicineId ? '?medicineId=' + medicineId : ''}`, MOCK.insights(), LoadingKeys.INVENTORY.INTELLIGENCE);
  }

  getMovements() {
    return this.httpSrv.getOr<PaginationData<StockMovementEvent>>(BASE_API.INVENTORY.MOVEMENTS, { ...PaginationDataWithInit<StockMovementEvent>(), items: MOCK.movements(), totalCount: MOCK.movements().length }, LoadingKeys.INVENTORY.MOVEMENTS);
  }

  getAlerts(medicineId?: string) {
    let items = MOCK.alerts();
    if (medicineId) items = items.filter(a => a.medicineId === medicineId);
    return this.httpSrv.getOr<InventoryAlert[]>(BASE_API.INVENTORY.ALERTS, items, LoadingKeys.INVENTORY.ALERTS);
  }

  acknowledgeAlert(alertId: string, note?: string) {
    return this.httpSrv.postOr<{ alertId: string }>(BASE_API.INVENTORY.ALERT_ACKNOWLEDGE(alertId), { note }, { alertId }, LoadingKeys.INVENTORY.ALERT_ACKNOWLEDGE);
  }

  getHistory(medicineId: string, type: 'purchase' | 'dispensing' | 'supplier') {
    return this.httpSrv.getOr<PaginationData<InventoryHistoryEntry>>(`${BASE_API.INVENTORY.MEDICINE_HISTORY(medicineId)}?type=${type}`, { ...PaginationDataWithInit<InventoryHistoryEntry>(), items: MOCK.history(type), totalCount: MOCK.history(type).length }, LoadingKeys.INVENTORY.MEDICINE_HISTORY);
  }

  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = {
  kpis: <InventoryKpis>{
    totalInventoryValue: 184250.75,
    totalMedicines: 312,
    availableStock: 28640,
    reservedStock: 1840,
    lowStockCount: 14,
    outOfStockCount: 3,
    nearExpiryCount: 9,
    expiredCount: 2,
    todayMovementsCount: 47,
    pendingPurchaseOrders: 5,
  },

  quickCategories: <InventoryQuickCategory[]>[
    { label: 'All', value: '', icon: 'layout-grid' },
    { label: 'Tablet', value: 'Tablet', icon: 'pill' },
    { label: 'Syrup', value: 'Syrup', icon: 'flask-conical' },
    { label: 'Injection', value: 'Injection', icon: 'syringe' },
    { label: 'Capsule', value: 'Capsule', icon: 'pill' },
    { label: 'Controlled', value: 'Controlled', icon: 'shield' },
  ],

  medicines: (): InventoryMedicineCard[] => [
    { id: 'm-1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', currentStock: 150, safetyStock: 100, reorderLevel: 80, status: 'InStock', batchCount: 3, soonestExpiryDate: '12/2025', isNearExpiry: false, storageLocation: 'Shelf A-12', category: 'Tablet', barcode: '8901001', isFavorite: true, isRecentlyAccessed: true },
    { id: 'm-2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', currentStock: 80, safetyStock: 100, reorderLevel: 80, status: 'LowStock', batchCount: 2, soonestExpiryDate: '08/2025', isNearExpiry: true, storageLocation: 'Shelf A-13', category: 'Capsule', barcode: '8901002', isRecentlyAccessed: true },
    { id: 'm-3', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', currentStock: 200, safetyStock: 120, reorderLevel: 90, status: 'InStock', batchCount: 4, soonestExpiryDate: '03/2026', isNearExpiry: false, storageLocation: 'Shelf C-08', category: 'Tablet', barcode: '8901003' },
    { id: 'm-4', name: 'Cough Syrup', genericName: 'Dextromethorphan', currentStock: 0, safetyStock: 40, reorderLevel: 30, status: 'OutOfStock', batchCount: 0, soonestExpiryDate: null, isNearExpiry: false, storageLocation: 'Shelf D-02', category: 'Syrup', barcode: '8901004' },
    { id: 'm-5', name: 'Insulin Glargine', genericName: 'Insulin Glargine', currentStock: 25, safetyStock: 20, reorderLevel: 15, status: 'InStock', batchCount: 2, soonestExpiryDate: '11/2025', isNearExpiry: true, storageLocation: 'Cold Storage R2', category: 'Injection', barcode: '8901005', isFavorite: true },
    { id: 'm-6', name: 'Morphine Sulfate 10mg', genericName: 'Morphine', currentStock: 40, safetyStock: 30, reorderLevel: 20, status: 'InStock', batchCount: 1, soonestExpiryDate: '06/2026', isNearExpiry: false, storageLocation: 'Controlled Drug Safe', category: 'Controlled', barcode: '8901006' },
    { id: 'm-7', name: 'Metformin 500mg', genericName: 'Metformin HCl', currentStock: 120, safetyStock: 100, reorderLevel: 80, status: 'InStock', batchCount: 3, soonestExpiryDate: '04/2026', isNearExpiry: false, storageLocation: 'Shelf B-05', category: 'Tablet', barcode: '8901008' },
  ],

  medicineDetail: (medicineId: string): InventoryMedicineDetail => {
    const base = MOCK.medicines().find(m => m.id === medicineId) ?? MOCK.medicines()[0];
    return {
      id: base.id,
      name: base.name,
      genericName: base.genericName,
      manufacturer: 'MediLife',
      category: base.category,
      currentStock: base.currentStock,
      safetyStock: base.safetyStock,
      reorderLevel: base.reorderLevel,
      status: base.status,
      unit: 'Strip of 10',
      averageUnitCost: 2.4,
      totalValue: base.currentStock * 2.4,
      storageLocations: [base.storageLocation],
    };
  },

  batches: (medicineId: string): WarehouseBatch[] => [
    { id: 'b-1', batchNo: 'BT2024002', medicineId, expiryDate: '2025-08-15', manufacturingDate: '2024-02-15', quantity: 80, reservedQuantity: 10, availableQuantity: 70, supplier: 'MediLife', purchasePrice: 5.0, storageLocation: 'Shelf A-12', status: 'Active', isNearExpiry: true, isExpired: false },
    { id: 'b-2', batchNo: 'BT2024009', medicineId, expiryDate: '2026-01-20', manufacturingDate: '2024-07-20', quantity: 120, reservedQuantity: 0, availableQuantity: 120, supplier: 'GenPharm', purchasePrice: 4.6, storageLocation: 'Central Warehouse', status: 'Active', isNearExpiry: false, isExpired: false },
    { id: 'b-3', batchNo: 'BT2023991', medicineId, expiryDate: '2025-01-05', manufacturingDate: '2023-06-05', quantity: 15, reservedQuantity: 0, availableQuantity: 15, supplier: 'MediLife', purchasePrice: 5.0, storageLocation: 'Shelf A-13', status: 'Expired', isNearExpiry: false, isExpired: true },
  ],

  zones: (): WarehouseZone[] => [
    { id: 'z-1', name: 'Shelf A-12', type: 'Shelf', capacityPercent: 82, activityLevel: 'High', hasExpiringStock: true, isEmpty: false, isOverstocked: false },
    { id: 'z-2', name: 'Shelf A-13', type: 'Shelf', capacityPercent: 38, activityLevel: 'Medium', hasExpiringStock: true, isEmpty: false, isOverstocked: false },
    { id: 'z-3', name: 'Shelf B-05', type: 'Shelf', capacityPercent: 95, activityLevel: 'Low', hasExpiringStock: false, isEmpty: false, isOverstocked: true },
    { id: 'z-4', name: 'Shelf C-08', type: 'Shelf', capacityPercent: 60, activityLevel: 'Medium', hasExpiringStock: false, isEmpty: false, isOverstocked: false },
    { id: 'z-5', name: 'Shelf D-02', type: 'Cabinet', capacityPercent: 0, activityLevel: 'Low', hasExpiringStock: false, isEmpty: true, isOverstocked: false },
    { id: 'z-6', name: 'Cold Storage R2', type: 'Refrigerator', capacityPercent: 55, activityLevel: 'Medium', hasExpiringStock: true, isEmpty: false, isOverstocked: false },
    { id: 'z-7', name: 'Controlled Drug Safe', type: 'ControlledDrugSafe', capacityPercent: 40, activityLevel: 'Low', hasExpiringStock: false, isEmpty: false, isOverstocked: false },
    { id: 'z-8', name: 'Central Warehouse', type: 'Shelf', capacityPercent: 71, activityLevel: 'High', hasExpiringStock: false, isEmpty: false, isOverstocked: false },
  ],

  insights: (): StockInsight[] => [
    { id: 'i-1', message: 'Amoxicillin 250mg will last 18 days at current usage', detail: 'Reorder within 3 days to avoid a stockout.', icon: 'trending-down', tone: 'warning', trend: [120, 110, 95, 88, 80] },
    { id: 'i-2', message: 'Usage of Paracetamol 500mg increased 35% this week', detail: 'Likely seasonal demand — consider a temporary reorder bump.', icon: 'activity', tone: 'primary', trend: [60, 65, 78, 90, 105] },
    { id: 'i-3', message: 'High-value inventory sitting idle: Insulin Glargine', detail: 'No movement in 21 days — review storage allocation.', icon: 'package-search', tone: 'neutral', trend: null },
    { id: 'i-4', message: 'Overstock detected on Metformin 500mg', detail: 'Current stock is 150% of safety stock.', icon: 'trending-up', tone: 'danger', trend: [80, 95, 110, 130, 150] },
  ],

  movements: (): StockMovementEvent[] => [
    { id: 'mv-1', type: 'Dispense', medicineId: 'm-2', medicineName: 'Amoxicillin 250mg', batchNo: 'BT2024002', quantity: -21, warehouseZone: 'Shelf A-12', performedBy: 'Sarah Johnson', occurredAt: new Date(Date.now() - 12 * 60_000).toISOString(), reference: 'RX-2026-00451' },
    { id: 'mv-2', type: 'Receiving', medicineId: 'm-3', medicineName: 'Ibuprofen 400mg', batchNo: 'BT2024010', quantity: 200, warehouseZone: 'Shelf C-08', performedBy: 'Warehouse Bot', occurredAt: new Date(Date.now() - 45 * 60_000).toISOString(), reference: 'PO-2026-0091' },
    { id: 'mv-3', type: 'RetailSale', medicineId: 'm-1', medicineName: 'Paracetamol 500mg', batchNo: 'BT2024001', quantity: -12, warehouseZone: 'Shelf A-12', performedBy: 'Cashier 02', occurredAt: new Date(Date.now() - 70 * 60_000).toISOString(), reference: 'TXN-2026-7741' },
    { id: 'mv-4', type: 'Transfer', medicineId: 'm-5', medicineName: 'Insulin Glargine', batchNo: 'BT2024005', quantity: 10, warehouseZone: 'Cold Storage R2', performedBy: 'Nguyen Van A', occurredAt: new Date(Date.now() - 130 * 60_000).toISOString(), reference: 'TR-2026-0014' },
    { id: 'mv-5', type: 'Expiry', medicineId: 'm-2', medicineName: 'Amoxicillin 250mg', batchNo: 'BT2023991', quantity: -15, warehouseZone: 'Shelf A-13', performedBy: 'System', occurredAt: new Date(Date.now() - 200 * 60_000).toISOString(), reference: null },
    { id: 'mv-6', type: 'Adjustment', medicineId: 'm-7', medicineName: 'Metformin 500mg', batchNo: 'BT2024008', quantity: -3, warehouseZone: 'Shelf B-05', performedBy: 'Le Thi B', occurredAt: new Date(Date.now() - 260 * 60_000).toISOString(), reference: 'ADJ-2026-0007' },
  ],

  alerts: (): InventoryAlert[] => [
    { id: 'al-1', type: 'ExpiredBatch', severity: 'Critical', medicineId: 'm-2', medicineName: 'Amoxicillin 250mg', message: 'Batch BT2023991 expired on 05/01/2025 with 15 units still on shelf.', recommendation: 'Dispose immediately and adjust stock.', acknowledged: false, createdAt: new Date(Date.now() - 90 * 60_000).toISOString() },
    { id: 'al-2', type: 'ControlledDrug', severity: 'High', medicineId: 'm-6', medicineName: 'Morphine Sulfate 10mg', message: 'Controlled drug stock count due for daily reconciliation.', recommendation: 'Perform controlled drug count before shift end.', acknowledged: false, createdAt: new Date(Date.now() - 120 * 60_000).toISOString() },
    { id: 'al-3', type: 'LowStock', severity: 'Warning', medicineId: 'm-2', medicineName: 'Amoxicillin 250mg', message: 'Stock (80) is below reorder level (80).', recommendation: 'Reorder within 3 days.', acknowledged: false, createdAt: new Date(Date.now() - 150 * 60_000).toISOString() },
    { id: 'al-4', type: 'OutOfStock', severity: 'High', medicineId: 'm-4', medicineName: 'Cough Syrup', message: 'Stock depleted — 0 units available.', recommendation: 'Raise an emergency purchase order.', acknowledged: false, createdAt: new Date(Date.now() - 300 * 60_000).toISOString() },
    { id: 'al-5', type: 'Overstock', severity: 'Info', medicineId: 'm-7', medicineName: 'Metformin 500mg', message: 'Current stock is 150% of safety stock.', recommendation: 'Consider redistributing to other wards.', acknowledged: true, createdAt: new Date(Date.now() - 500 * 60_000).toISOString() },
  ],

  history: (type: 'purchase' | 'dispensing' | 'supplier'): InventoryHistoryEntry[] => {
    if (type === 'purchase') return [
      { date: new Date(Date.now() - 5 * 86_400_000).toISOString(), description: 'Purchase order received', quantity: 200, reference: 'PO-2026-0091', actor: 'Warehouse Bot' },
      { date: new Date(Date.now() - 32 * 86_400_000).toISOString(), description: 'Purchase order received', quantity: 150, reference: 'PO-2026-0058', actor: 'Warehouse Bot' },
    ];
    if (type === 'dispensing') return [
      { date: new Date(Date.now() - 1 * 86_400_000).toISOString(), description: 'Dispensed to patient', quantity: -21, reference: 'RX-2026-00451', actor: 'Sarah Johnson' },
      { date: new Date(Date.now() - 3 * 86_400_000).toISOString(), description: 'Dispensed to patient', quantity: -14, reference: 'RX-2026-00410', actor: 'Sarah Johnson' },
    ];
    return [
      { date: new Date(Date.now() - 32 * 86_400_000).toISOString(), description: 'Supplier delivery — MediLife', quantity: 150, reference: 'PO-2026-0058', actor: 'MediLife' },
      { date: new Date(Date.now() - 64 * 86_400_000).toISOString(), description: 'Supplier delivery — GenPharm', quantity: 120, reference: 'PO-2026-0021', actor: 'GenPharm' },
    ];
  },
};
