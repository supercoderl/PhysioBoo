/**
 * Stock Take (Inventory Counting) module types — see docs/stock-take-redesign.md.
 * Field names mirror the StockTake* view models of PhysioBoo.Application.ViewModels.StockTakes.
 */

export type StockTakeStatus = 'Draft' | 'Counting' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Cancelled';

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
    /** The API returns the creator's / counter's e-mail address. */
    createdByName: string;
    assignedToName: string | null;
    createdDate: string;
    /** `yyyy-MM-dd` */
    scheduledDate: string;
    status: StockTakeStatus;
    itemsCount: number;
    completedPercent: number;
    /** Sum of counted differences × batch purchase price. */
    differenceValue: number;
    lastUpdated: string;
    notes?: string | null;
    rejectionReason?: string | null;
}

export interface StockTakeKpis {
    /** Draft + Counting sessions. */
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

/** One batch of one medicine; `systemQty` is a snapshot taken when counting started. */
export interface StockTakeItem {
    id: string;
    barcode: string | null;
    itemCode: string;
    itemName: string;
    unit: string;
    categoryId: string;
    batchNo: string | null;
    expiryDate: string | null;
    systemQty: number;
    actualQty: number | null;
    /** `(actualQty ?? systemQty) - systemQty`, so 0 until the item is counted. */
    difference: number;
    reason: string | null;
    notes: string | null;
    isCounted: boolean;
}

export interface StockTakeCategoryNode {
    id: string;
    name: string;
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
    warehouseId?: string | null;
    departmentId?: string | null;
    status?: StockTakeStatus | '' | null;
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
}

/** Body item of `POST /api/stock-takes/{id}/items`; only counted rows can be sent. */
export interface StockTakeItemCountInput {
    itemId: string;
    actualQty: number;
    reason: string | null;
    notes: string | null;
}

export const STOCK_TAKE_STATUSES: { label: string; value: StockTakeStatus }[] = [
    { label: 'Draft', value: 'Draft' },
    { label: 'Counting', value: 'Counting' },
    { label: 'Pending approval', value: 'PendingApproval' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Cancelled', value: 'Cancelled' },
];

export const STOCK_TAKE_REASONS: { label: string; value: string }[] = [
    { label: 'Damaged / Broken', value: 'Damaged' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Miscount at receiving', value: 'ReceivingMiscount' },
    { label: 'Theft / Loss', value: 'TheftOrLoss' },
    { label: 'Dispensing not recorded', value: 'UnrecordedDispensing' },
    { label: 'Other', value: 'Other' },
];

export function stockTakeReasonLabel(value: string | null): string {
    return STOCK_TAKE_REASONS.find(r => r.value === value)?.label ?? value ?? '—';
}

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
        case 'PendingApproval': return 'Pending approval';
        default: return status;
    }
}

/** Largest count the API's `int` can store. */
export const STOCK_TAKE_MAX_QTY = 2_147_483_647;

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', signDisplay: 'exceptZero' });

/** Signed value difference at purchase cost, e.g. `+$12.50`, `-$3.00`, `$0.00`. */
export function formatStockTakeValue(value: number): string {
    return MONEY.format(value);
}
