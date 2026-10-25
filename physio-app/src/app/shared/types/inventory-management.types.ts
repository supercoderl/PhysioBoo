/**
 * Pharmacy inventory types — see docs/inventory-management-redesign.md.
 * Shapes mirror physio-server's `api/pharmacy/inventory` view models. Kept separate from the legacy
 * shared/types/inventory.ts (InventoryItem) and shared/types/stock.ts, which the Stock Take module still uses.
 */
import { BooBadgeTone } from '@physioboo/ui';

export type InventoryStockStatus = 'InStock' | 'LowStock' | 'OutOfStock';

/** Same order as the server's `BatchLifecycleStatus` enum, which is serialised as a number. */
export type BatchLifecycleStatus = 'Active' | 'Reserved' | 'Locked' | 'Disposed' | 'Expired';
const BATCH_STATUSES: readonly BatchLifecycleStatus[] = ['Active', 'Reserved', 'Locked', 'Disposed', 'Expired'];

export type BatchActionKind = 'receive' | 'adjust' | 'transfer' | 'dispose';

/**
 * Batch-level counts, not medicine counts: the server evaluates low stock, near expiry and expiry per batch.
 */
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

export interface InventoryMedicine {
    id: string;
    name: string;
    genericName: string | null;
    currentStock: number;
    safetyStock: number;
    reorderLevel: number;
    status: InventoryStockStatus;
    batchCount: number;
    soonestExpiryDate: string | null;
    isNearExpiry: boolean;
    storageLocation: string | null;
    category: string | null;
    barcode: string | null;
}

export interface InventoryMedicineDetail {
    id: string;
    name: string;
    genericName: string | null;
    manufacturer: string | null;
    category: string | null;
    currentStock: number;
    safetyStock: number;
    reorderLevel: number;
    status: InventoryStockStatus;
    unit: string | null;
    averageUnitCost: number;
    totalValue: number;
    storageLocations: string[];
}

export interface InventoryBatch {
    id: string;
    batchNo: string | null;
    medicineId: string;
    expiryDate: string | null;
    /** The server fills this from the batch's purchase date. */
    manufacturingDate: string | null;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    supplier: string | null;
    purchasePrice: number | null;
    storageLocation: string | null;
    status: BatchLifecycleStatus;
    isNearExpiry: boolean;
    isExpired: boolean;
}

export interface InventoryHistoryEntry {
    date: string;
    description: string;
    quantity: number;
    reference: string | null;
    actor: string;
}

export interface InventoryZone {
    id: string;
    name: string;
}

export interface InventorySearchQuery {
    search: string;
    categoryId: string | null;
    pageNumber: number;
    pageSize: number;
}

export interface ReceiveStockPayload {
    quantity: number;
    purchasePrice?: number | null;
    expiryDate?: string | null;
}

export interface AdjustStockPayload {
    newQuantity: number;
    reason: string;
}

export interface TransferStockPayload {
    toZoneId: string;
    quantity: number;
}

export interface DisposeStockPayload {
    quantity: number;
    reason: string;
}

/** What the batch action dialog hands back once its form is valid. */
export type BatchActionRequest =
    | { kind: 'receive'; payload: ReceiveStockPayload }
    | { kind: 'adjust'; payload: AdjustStockPayload }
    | { kind: 'transfer'; payload: TransferStockPayload }
    | { kind: 'dispose'; payload: DisposeStockPayload };

export function normalizeBatchStatus(value: number | string | null | undefined): BatchLifecycleStatus {
    if (typeof value === 'number') return BATCH_STATUSES[value] ?? 'Active';
    return BATCH_STATUSES.find(s => s.toLowerCase() === String(value ?? '').toLowerCase()) ?? 'Active';
}

export function stockStatusLabel(status: InventoryStockStatus): string {
    switch (status) {
        case 'OutOfStock': return 'Out of stock';
        case 'LowStock': return 'Low stock';
        default: return 'In stock';
    }
}

export function stockStatusTone(status: InventoryStockStatus): BooBadgeTone {
    switch (status) {
        case 'OutOfStock': return 'danger';
        case 'LowStock': return 'warning';
        default: return 'success';
    }
}

export function batchStatusTone(status: BatchLifecycleStatus): BooBadgeTone {
    switch (status) {
        case 'Active': return 'success';
        case 'Reserved': return 'primary';
        case 'Locked': return 'warning';
        case 'Expired': return 'danger';
        default: return 'neutral';
    }
}

/** Units that can be moved, written off or transferred: stock that is not already reserved. */
export function freeQuantity(batch: Pick<InventoryBatch, 'quantity' | 'reservedQuantity'>): number {
    return batch.quantity - batch.reservedQuantity;
}
