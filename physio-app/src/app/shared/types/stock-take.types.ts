/**
 * Stock Take (Inventory Counting) module types — see docs/stock-take-redesign.md.
 * Kept separate from the legacy shared/types/stock.ts (StockItem/StockTakeSession), which the
 * page being replaced here used to import.
 */

export type StockTakeStatus = 'Draft' | 'Counting' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Cancelled';

export type StockTakeCategoryType = 'Medicine' | 'Consumable' | 'MedicalSupply' | 'Equipment';

export type StockTakeActivityType =
    | 'Created'
    | 'Assigned'
    | 'Started'
    | 'ItemCounted'
    | 'Completed'
    | 'Approved'
    | 'Rejected'
    | 'Cancelled';

export interface StockTake {
    id: string;
    code: string;
    warehouseId: string;
    warehouseName: string;
    departmentId: string;
    departmentName: string;
    createdBy: string;
    assignedTo: string | null;
    createdDate: string;
    scheduledDate: string;
    status: StockTakeStatus;
    itemsCount: number;
    completedPercent: number;
    differenceValue: number;
    lastUpdated: string;
    notes?: string | null;
    rejectionReason?: string | null;
}

export interface StockTakeKpis {
    activeSessions: number;
    pendingApproval: number;
    completedThisMonth: number;
    totalDifferenceValue: number;
    discrepancySessions: number;
}

export interface StockTakeActivity {
    id: string;
    stockTakeId: string;
    stockTakeCode: string;
    type: StockTakeActivityType;
    message: string;
    actor: string;
    occurredAt: string;
}

export interface StockTakeItem {
    id: string;
    barcode: string;
    itemCode: string;
    itemName: string;
    unit: string;
    categoryType: StockTakeCategoryType;
    categoryId: string;
    batchNo: string;
    expiryDate: string | null;
    systemQty: number;
    actualQty: number | null;
    difference: number;
    reason: string | null;
    notes: string | null;
    isCounted: boolean;
}

export interface StockTakeCategoryNode {
    id: string;
    name: string;
    type: StockTakeCategoryType;
    icon: string;
    itemCount: number;
    countedCount: number;
}

export interface StockTakeSummary {
    totalItems: number;
    countedItems: number;
    remainingItems: number;
    positiveDifferenceCount: number;
    negativeDifferenceCount: number;
    valueDifference: number;
    completionPercent: number;
}

export interface StockTakeFilter {
    warehouseId?: string;
    departmentId?: string;
    status?: StockTakeStatus | '';
    dateFrom?: string | null;
    dateTo?: string | null;
}

export interface CreateStockTakePayload {
    warehouseId: string;
    departmentId: string;
    scheduledDate: string;
    assignedTo?: string | null;
    notes?: string | null;
}

export interface AssignCounterPayload {
    assignedTo: string;
    dueDate?: string | null;
}

export const STOCK_TAKE_REASONS: { label: string; value: string }[] = [
    { label: 'Damaged / Broken', value: 'Damaged' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Miscount at receiving', value: 'ReceivingMiscount' },
    { label: 'Theft / Loss', value: 'TheftOrLoss' },
    { label: 'Dispensing not recorded', value: 'UnrecordedDispensing' },
    { label: 'Other', value: 'Other' },
];

export function stockTakeStatusTone(status: StockTakeStatus): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
        case 'Draft': return 'neutral';
        case 'Counting': return 'primary';
        case 'PendingApproval': return 'warning';
        case 'Approved': return 'success';
        case 'Rejected': return 'danger';
        case 'Cancelled': return 'neutral';
        default: return 'neutral';
    }
}

export function stockTakeStatusLabel(status: StockTakeStatus): string {
    switch (status) {
        case 'PendingApproval': return 'Pending Approval';
        default: return status;
    }
}
