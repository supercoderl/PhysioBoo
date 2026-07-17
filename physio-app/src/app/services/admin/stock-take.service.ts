import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { Lookup, PagedRequest, PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import {
  AssignCounterPayload,
  CreateStockTakePayload,
  StockTake,
  StockTakeActivity,
  StockTakeCategoryNode,
  StockTakeCategoryType,
  StockTakeFilter,
  StockTakeItem,
  StockTakeKpis,
  StockTakeSummary,
} from "../../shared/types/stock-take.types";
import { LoadingKeys } from "../../shared/types/loading";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class StockTakeService {
  private readonly httpSrv = inject(HttpService);

  search(request: PagedRequest<StockTakeFilter>) {
    let items = MOCK.stockTakes();
    const f = request.filter;
    if (f?.warehouseId) items = items.filter(i => i.warehouseId === f.warehouseId);
    if (f?.departmentId) items = items.filter(i => i.departmentId === f.departmentId);
    if (f?.status) items = items.filter(i => i.status === f.status);
    if (request.search) {
      const q = request.search.toLowerCase();
      items = items.filter(i => i.code.toLowerCase().includes(q) || i.warehouseName.toLowerCase().includes(q));
    }
    const page = { ...PaginationDataWithInit<StockTake>(), items, totalCount: items.length, pageNumber: request.pageNumber ?? 1, pageSize: request.pageSize ?? 10 };
    return this.httpSrv.getOr<PaginationData<StockTake>>(BASE_API.STOCK_TAKE.SEARCH, page, LoadingKeys.STOCK_TAKE.SEARCH);
  }

  getById(id: string) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.getOr<StockTake | null>(BASE_API.STOCK_TAKE.DETAIL(id), match, LoadingKeys.STOCK_TAKE.DETAIL);
  }

  create(payload: CreateStockTakePayload) {
    return this.httpSrv.postOr<string>(BASE_API.STOCK_TAKE.BASE, payload, 'st-new', LoadingKeys.STOCK_TAKE.CREATE);
  }

  update(id: string, payload: CreateStockTakePayload) {
    return this.httpSrv.postOr<string>(BASE_API.STOCK_TAKE.DETAIL(id), payload, id, LoadingKeys.STOCK_TAKE.UPDATE);
  }

  delete(id: string) {
    return this.httpSrv.postOr<string>(BASE_API.STOCK_TAKE.DETAIL(id), {}, id, LoadingKeys.STOCK_TAKE.DELETE);
  }

  start(id: string) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.postOr<StockTake | null>(BASE_API.STOCK_TAKE.START(id), {}, match, LoadingKeys.STOCK_TAKE.START);
  }

  complete(id: string) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.postOr<StockTake | null>(BASE_API.STOCK_TAKE.COMPLETE(id), {}, match, LoadingKeys.STOCK_TAKE.COMPLETE);
  }

  approve(id: string, note?: string) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.postOr<StockTake | null>(BASE_API.STOCK_TAKE.APPROVE(id), { note }, match, LoadingKeys.STOCK_TAKE.APPROVE);
  }

  reject(id: string, reason: string) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.postOr<StockTake | null>(BASE_API.STOCK_TAKE.REJECT(id), { reason }, match, LoadingKeys.STOCK_TAKE.REJECT);
  }

  cancel(id: string, reason: string) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.postOr<StockTake | null>(BASE_API.STOCK_TAKE.CANCEL(id), { reason }, match, LoadingKeys.STOCK_TAKE.CANCEL);
  }

  assignCounter(id: string, payload: AssignCounterPayload) {
    const match = MOCK.stockTakes().find(s => s.id === id) ?? null;
    return this.httpSrv.postOr<StockTake | null>(BASE_API.STOCK_TAKE.ASSIGN(id), payload, match, LoadingKeys.STOCK_TAKE.ASSIGN);
  }

  getItems(id: string, categoryId?: string, search?: string) {
    let items = MOCK.items(id);
    if (categoryId) items = items.filter(i => i.categoryId === categoryId);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q) || i.barcode.includes(q));
    }
    return this.httpSrv.getOr<StockTakeItem[]>(BASE_API.STOCK_TAKE.ITEMS(id), items, LoadingKeys.STOCK_TAKE.ITEMS);
  }

  updateItems(id: string, items: Partial<StockTakeItem>[]) {
    return this.httpSrv.postOr<StockTakeItem[]>(BASE_API.STOCK_TAKE.ITEMS(id), { items }, items as StockTakeItem[], LoadingKeys.STOCK_TAKE.ITEMS_UPDATE);
  }

  getCategories(id: string) {
    return this.httpSrv.getOr<StockTakeCategoryNode[]>(BASE_API.STOCK_TAKE.CATEGORIES(id), MOCK.categories(id), LoadingKeys.STOCK_TAKE.CATEGORIES);
  }

  getSummary(id: string) {
    return this.httpSrv.getOr<StockTakeSummary>(BASE_API.STOCK_TAKE.SUMMARY(id), MOCK.summary(id), LoadingKeys.STOCK_TAKE.SUMMARY);
  }

  getHistory(id: string) {
    const items = MOCK.activities().filter(a => a.stockTakeId === id);
    return this.httpSrv.getOr<StockTakeActivity[]>(BASE_API.STOCK_TAKE.HISTORY(id), items, LoadingKeys.STOCK_TAKE.HISTORY);
  }

  getKpis() {
    return this.httpSrv.getOr<StockTakeKpis>(BASE_API.STOCK_TAKE.KPIS, MOCK.kpis, LoadingKeys.STOCK_TAKE.KPIS);
  }

  getRecentActivities(limit: number = 8) {
    return this.httpSrv.getOr<StockTakeActivity[]>(BASE_API.STOCK_TAKE.ACTIVITIES, MOCK.activities().slice(0, limit), LoadingKeys.STOCK_TAKE.ACTIVITIES);
  }

  exportExcel(filter: StockTakeFilter) {
    return this.httpSrv.getOr<{ fileUrl: string }>(BASE_API.STOCK_TAKE.EXPORT, { fileUrl: '' }, LoadingKeys.STOCK_TAKE.EXPORT);
  }

  print(id: string) {
    return this.httpSrv.postOr<{ printed: boolean }>(BASE_API.STOCK_TAKE.PRINT(id), {}, { printed: true }, LoadingKeys.STOCK_TAKE.PRINT);
  }

  getWarehouses() {
    return this.httpSrv.getOr<Lookup[]>('/api/warehouses', MOCK.warehouses, LoadingKeys.STOCK_TAKE.WAREHOUSES);
  }

  getUsers() {
    return this.httpSrv.getOr<Lookup[]>('/api/users', MOCK.users, LoadingKeys.STOCK_TAKE.USERS);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = {
  warehouses: <Lookup[]>[
    { id: 'wh-1', name: 'Central Pharmacy Warehouse' },
    { id: 'wh-2', name: 'Cold Chain Storage' },
    { id: 'wh-3', name: 'Emergency Ward Store' },
    { id: 'wh-4', name: 'Outpatient Dispensary' },
  ],

  users: <Lookup[]>[
    { id: 'u-1', name: 'John Pharmacist' },
    { id: 'u-2', name: 'Sarah Johnson' },
    { id: 'u-3', name: 'Nguyen Van A' },
    { id: 'u-4', name: 'Le Thi B' },
  ],

  kpis: <StockTakeKpis>{
    activeSessions: 6,
    pendingApproval: 2,
    completedThisMonth: 14,
    totalDifferenceValue: -1284.5,
    discrepancySessions: 4,
  },

  stockTakes: (): StockTake[] => [
    { id: 'st-1', code: 'ST-2026-0031', warehouseId: 'wh-1', warehouseName: 'Central Pharmacy Warehouse', departmentId: 'd-1', departmentName: 'Pharmacy', createdBy: 'John Pharmacist', assignedTo: 'Sarah Johnson', createdDate: '2026-06-25T08:00:00Z', scheduledDate: '2026-06-28T08:00:00Z', status: 'Counting', itemsCount: 240, completedPercent: 62, differenceValue: -186.4, lastUpdated: new Date(Date.now() - 20 * 60_000).toISOString() },
    { id: 'st-2', code: 'ST-2026-0030', warehouseId: 'wh-2', warehouseName: 'Cold Chain Storage', departmentId: 'd-2', departmentName: 'Immunology', createdBy: 'John Pharmacist', assignedTo: 'Nguyen Van A', createdDate: '2026-06-20T08:00:00Z', scheduledDate: '2026-06-22T08:00:00Z', status: 'PendingApproval', itemsCount: 58, completedPercent: 100, differenceValue: -412.0, lastUpdated: new Date(Date.now() - 3 * 60 * 60_000).toISOString() },
    { id: 'st-3', code: 'ST-2026-0029', warehouseId: 'wh-1', warehouseName: 'Central Pharmacy Warehouse', departmentId: 'd-1', departmentName: 'Pharmacy', createdBy: 'John Pharmacist', assignedTo: 'Le Thi B', createdDate: '2026-06-10T08:00:00Z', scheduledDate: '2026-06-12T08:00:00Z', status: 'Approved', itemsCount: 312, completedPercent: 100, differenceValue: 54.2, lastUpdated: new Date(Date.now() - 5 * 86_400_000).toISOString() },
    { id: 'st-4', code: 'ST-2026-0028', warehouseId: 'wh-3', warehouseName: 'Emergency Ward Store', departmentId: 'd-3', departmentName: 'Emergency', createdBy: 'Sarah Johnson', assignedTo: null, createdDate: '2026-06-08T08:00:00Z', scheduledDate: '2026-06-09T08:00:00Z', status: 'Draft', itemsCount: 96, completedPercent: 0, differenceValue: 0, lastUpdated: new Date(Date.now() - 6 * 86_400_000).toISOString() },
    { id: 'st-5', code: 'ST-2026-0027', warehouseId: 'wh-4', warehouseName: 'Outpatient Dispensary', departmentId: 'd-4', departmentName: 'Outpatient', createdBy: 'John Pharmacist', assignedTo: 'Sarah Johnson', createdDate: '2026-05-28T08:00:00Z', scheduledDate: '2026-05-30T08:00:00Z', status: 'Rejected', itemsCount: 130, completedPercent: 100, differenceValue: -940.75, lastUpdated: new Date(Date.now() - 12 * 86_400_000).toISOString(), rejectionReason: 'Discrepancy count too high — recount controlled drugs section.' },
    { id: 'st-6', code: 'ST-2026-0026', warehouseId: 'wh-2', warehouseName: 'Cold Chain Storage', departmentId: 'd-2', departmentName: 'Immunology', createdBy: 'Sarah Johnson', assignedTo: 'Nguyen Van A', createdDate: '2026-05-20T08:00:00Z', scheduledDate: '2026-05-21T08:00:00Z', status: 'Cancelled', itemsCount: 40, completedPercent: 10, differenceValue: 0, lastUpdated: new Date(Date.now() - 20 * 86_400_000).toISOString() },
  ],

  categories: (stockTakeId: string): StockTakeCategoryNode[] => [
    { id: 'c-1', name: 'Medicines', type: 'Medicine', icon: 'pill', itemCount: 140, countedCount: 92 },
    { id: 'c-2', name: 'Consumables', type: 'Consumable', icon: 'package', itemCount: 52, countedCount: 40 },
    { id: 'c-3', name: 'Medical Supplies', type: 'MedicalSupply', icon: 'stethoscope', itemCount: 34, countedCount: 12 },
    { id: 'c-4', name: 'Equipment', type: 'Equipment', icon: 'wrench', itemCount: 14, countedCount: 3 },
  ],

  items: (stockTakeId: string): StockTakeItem[] => {
    const rows: { name: string; code: string; category: StockTakeCategoryType; categoryId: string; sys: number; act: number | null; batch: string; exp: string | null; unit: string }[] = [
      { name: 'Amoxicillin 500mg', code: 'MED-001', category: 'Medicine', categoryId: 'c-1', sys: 500, act: 495, batch: 'BT2024001', exp: '2026-12-30', unit: 'Capsule' },
      { name: 'Paracetamol 500mg', code: 'MED-002', category: 'Medicine', categoryId: 'c-1', sys: 1000, act: 1000, batch: 'BT2024002', exp: '2027-06-30', unit: 'Tablet' },
      { name: 'Ibuprofen 400mg', code: 'MED-003', category: 'Medicine', categoryId: 'c-1', sys: 750, act: null, batch: 'BT2024003', exp: '2026-09-15', unit: 'Tablet' },
      { name: 'Insulin Glargine', code: 'MED-005', category: 'Medicine', categoryId: 'c-1', sys: 50, act: 48, batch: 'BT2024007', exp: '2026-08-28', unit: 'Vial' },
      { name: 'Surgical Gloves (M)', code: 'CON-011', category: 'Consumable', categoryId: 'c-2', sys: 800, act: 780, batch: 'BT2024101', exp: '2028-01-01', unit: 'Box' },
      { name: 'Syringe 5ml', code: 'CON-012', category: 'Consumable', categoryId: 'c-2', sys: 1200, act: null, batch: 'BT2024102', exp: '2028-03-15', unit: 'Piece' },
      { name: 'Gauze Bandage', code: 'SUP-021', category: 'MedicalSupply', categoryId: 'c-3', sys: 300, act: 300, batch: 'BT2024201', exp: null, unit: 'Roll' },
      { name: 'IV Cannula 20G', code: 'SUP-022', category: 'MedicalSupply', categoryId: 'c-3', sys: 400, act: null, batch: 'BT2024202', exp: '2027-11-01', unit: 'Piece' },
      { name: 'Digital Thermometer', code: 'EQP-031', category: 'Equipment', categoryId: 'c-4', sys: 25, act: 24, batch: '-', exp: null, unit: 'Unit' },
      { name: 'Pulse Oximeter', code: 'EQP-032', category: 'Equipment', categoryId: 'c-4', sys: 18, act: null, batch: '-', exp: null, unit: 'Unit' },
    ];
    return rows.map((r, idx) => {
      const actualQty = r.act;
      const difference = actualQty === null ? 0 : actualQty - r.sys;
      return {
        id: `${stockTakeId}-item-${idx + 1}`,
        barcode: `890100${idx + 1}`,
        itemCode: r.code,
        itemName: r.name,
        unit: r.unit,
        categoryType: r.category,
        categoryId: r.categoryId,
        batchNo: r.batch,
        expiryDate: r.exp,
        systemQty: r.sys,
        actualQty,
        difference,
        reason: difference !== 0 ? 'ReceivingMiscount' : null,
        notes: null,
        isCounted: actualQty !== null,
      };
    });
  },

  summary: (stockTakeId: string): StockTakeSummary => {
    const items = MOCK.items(stockTakeId);
    const counted = items.filter(i => i.isCounted);
    return {
      totalItems: items.length,
      countedItems: counted.length,
      remainingItems: items.length - counted.length,
      positiveDifferenceCount: items.filter(i => i.difference > 0).length,
      negativeDifferenceCount: items.filter(i => i.difference < 0).length,
      valueDifference: items.reduce((sum, i) => sum + i.difference * 4.2, 0),
      completionPercent: items.length ? Math.round((counted.length / items.length) * 100) : 0,
    };
  },

  activities: (): StockTakeActivity[] => [
    { id: 'act-1', stockTakeId: 'st-1', stockTakeCode: 'ST-2026-0031', type: 'ItemCounted', message: 'Counted 12 items in Medicines', actor: 'Sarah Johnson', occurredAt: new Date(Date.now() - 15 * 60_000).toISOString() },
    { id: 'act-2', stockTakeId: 'st-2', stockTakeCode: 'ST-2026-0030', type: 'Completed', message: 'Completed counting — submitted for approval', actor: 'Nguyen Van A', occurredAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString() },
    { id: 'act-3', stockTakeId: 'st-3', stockTakeCode: 'ST-2026-0029', type: 'Approved', message: 'Approved with minor variance', actor: 'John Pharmacist', occurredAt: new Date(Date.now() - 5 * 86_400_000).toISOString() },
    { id: 'act-4', stockTakeId: 'st-5', stockTakeCode: 'ST-2026-0027', type: 'Rejected', message: 'Rejected — recount required', actor: 'John Pharmacist', occurredAt: new Date(Date.now() - 12 * 86_400_000).toISOString() },
    { id: 'act-5', stockTakeId: 'st-1', stockTakeCode: 'ST-2026-0031', type: 'Assigned', message: 'Assigned to Sarah Johnson', actor: 'John Pharmacist', occurredAt: new Date(Date.now() - 2 * 86_400_000).toISOString() },
    { id: 'act-6', stockTakeId: 'st-4', stockTakeCode: 'ST-2026-0028', type: 'Created', message: 'Draft created for Emergency Ward Store', actor: 'Sarah Johnson', occurredAt: new Date(Date.now() - 6 * 86_400_000).toISOString() },
  ],
};
