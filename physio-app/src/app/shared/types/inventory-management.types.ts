/**
 * Warehouse Management Command Center types — see docs/inventory-management-redesign.md.
 * Kept separate from the legacy shared/types/inventory.ts (InventoryItem) and shared/types/stock.ts
 * (StockItem/StockTakeSession), which the unrelated Stock Take module still uses.
 * WarehouseBatch is a superset of dispensing.ts's BatchOption — same fields, plus the extra
 * attributes a warehouse view needs (manufacturing date, reserved qty, supplier, cost, lock state).
 */

export type InventoryStockStatus = 'InStock' | 'LowStock' | 'OutOfStock';
export type WarehouseZoneType = 'Shelf' | 'Cabinet' | 'Refrigerator' | 'ControlledDrugSafe';
export type WarehouseActivityLevel = 'Low' | 'Medium' | 'High';

export type StockMovementType =
    | 'Purchase'
    | 'Receiving'
    | 'Transfer'
    | 'Dispense'
    | 'RetailSale'
    | 'Return'
    | 'Adjustment'
    | 'Disposal'
    | 'Expiry';

export type InventoryAlertType =
    | 'LowStock'
    | 'OutOfStock'
    | 'NearExpiry'
    | 'ExpiredBatch'
    | 'Overstock'
    | 'Discrepancy'
    | 'TemperatureExcursion'
    | 'ControlledDrug';

export type InventoryAlertSeverity = 'Info' | 'Warning' | 'High' | 'Critical';

export type BatchLifecycleStatus = 'Active' | 'Reserved' | 'Locked' | 'Disposed' | 'Expired';

export interface InventoryKpis {
    totalInventoryValue: number;
    totalMedicines: number;
    availableStock: number;
    reservedStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    nearExpiryCount: number;
    expiredCount: number;
    todayMovementsCount: number;
    pendingPurchaseOrders: number;
}

export interface InventoryMedicineCard {
    id: string;
    name: string;
    genericName: string;
    currentStock: number;
    safetyStock: number;
    reorderLevel: number;
    status: InventoryStockStatus;
    batchCount: number;
    soonestExpiryDate: string | null;
    isNearExpiry: boolean;
    storageLocation: string;
    category: string;
    barcode: string;
    isFavorite?: boolean;
    isRecentlyAccessed?: boolean;
}

export interface InventoryQuickCategory {
    label: string;
    value: string;
    icon: string;
}

export interface WarehouseBatch {
    id: string;
    batchNo: string;
    medicineId: string;
    expiryDate: string;
    manufacturingDate: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    supplier: string;
    purchasePrice: number;
    storageLocation: string;
    status: BatchLifecycleStatus;
    isNearExpiry: boolean;
    isExpired: boolean;
}

export interface InventoryMedicineDetail {
    id: string;
    name: string;
    genericName: string;
    manufacturer: string;
    category: string;
    currentStock: number;
    safetyStock: number;
    reorderLevel: number;
    status: InventoryStockStatus;
    unit: string;
    averageUnitCost: number;
    totalValue: number;
    storageLocations: string[];
}

export interface WarehouseZone {
    id: string;
    name: string;
    type: WarehouseZoneType;
    capacityPercent: number;
    activityLevel: WarehouseActivityLevel;
    hasExpiringStock: boolean;
    isEmpty: boolean;
    isOverstocked: boolean;
}

export interface StockInsight {
    id: string;
    message: string;
    detail?: string | null;
    icon: string;
    tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    trend?: number[] | null;
}

export interface StockMovementEvent {
    id: string;
    type: StockMovementType;
    medicineId: string;
    medicineName: string;
    batchNo?: string | null;
    quantity: number;
    warehouseZone: string;
    performedBy: string;
    occurredAt: string;
    reference?: string | null;
}

export interface InventoryAlert {
    id: string;
    type: InventoryAlertType;
    severity: InventoryAlertSeverity;
    medicineId?: string | null;
    medicineName?: string | null;
    message: string;
    recommendation?: string | null;
    acknowledged: boolean;
    createdAt: string;
}

export interface InventoryHistoryEntry {
    date: string;
    description: string;
    quantity: number;
    reference: string;
    actor: string;
}

export function alertSeverityRank(severity: InventoryAlertSeverity): number {
    switch (severity) {
        case 'Critical': return 4;
        case 'High': return 3;
        case 'Warning': return 2;
        case 'Info': return 1;
        default: return 0;
    }
}
