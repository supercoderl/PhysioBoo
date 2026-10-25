import { StockTake } from "../../../../shared/types/stock-take.types";

/** What the signed-in user may do; each flag maps to the permission the matching endpoint (or route) requires. */
export interface StockTakeAccess {
    /** `pharmacy:stock-take:create` */
    create: boolean;
    /** `pharmacy:stock-take:update` — edit, start, assign, save counts, complete, cancel */
    update: boolean;
    delete: boolean;
    approve: boolean;
    reject: boolean;
    export: boolean;
    /** `pharmacy:medicine-inventory:create` — the permission the counting route is guarded with. */
    openCounting: boolean;
}

export type StockTakeActionKey =
    | 'start' | 'count' | 'items' | 'edit' | 'assign' | 'complete'
    | 'differences' | 'approve' | 'reject' | 'cancel' | 'delete';

export const STOCK_TAKE_ACTION_META: Record<StockTakeActionKey, { label: string; icon: string; danger?: boolean }> = {
    start: { label: 'Start counting', icon: 'play' },
    count: { label: 'Continue counting', icon: 'square-pen' },
    items: { label: 'View items', icon: 'list-checks' },
    edit: { label: 'Edit draft', icon: 'pencil' },
    assign: { label: 'Assign counter', icon: 'user-plus' },
    complete: { label: 'Submit for approval', icon: 'circle-check' },
    differences: { label: 'View differences', icon: 'scale' },
    approve: { label: 'Approve & adjust stock', icon: 'check-circle' },
    reject: { label: 'Reject', icon: 'circle-x', danger: true },
    cancel: { label: 'Cancel session', icon: 'ban', danger: true },
    delete: { label: 'Delete draft', icon: 'trash', danger: true },
};

/**
 * The actions the lifecycle allows for a session, in display order, filtered by what the user may do.
 * Mirrors the status rules of the StockTake command handlers: Draft → Counting → PendingApproval → Approved | Rejected;
 * Rejected and Approved are final, and a session can be cancelled until it is Approved or Cancelled.
 */
export function stockTakeActions(item: StockTake, access: StockTakeAccess): StockTakeActionKey[] {
    const keys: StockTakeActionKey[] = [];
    const add = (allowed: boolean, key: StockTakeActionKey) => { if (allowed) keys.push(key); };

    switch (item.status) {
        case 'Draft':
            add(access.update, 'start');
            add(access.update, 'edit');
            add(access.update, 'assign');
            add(access.delete, 'delete');
            break;
        case 'Counting':
            add(access.openCounting, 'count');
            add(access.update, 'complete');
            add(access.update, 'assign');
            add(access.update, 'cancel');
            break;
        case 'PendingApproval':
            keys.push('differences');
            add(access.openCounting, 'items');
            add(access.approve, 'approve');
            add(access.reject, 'reject');
            add(access.update, 'cancel');
            break;
        case 'Rejected':
            keys.push('differences');
            add(access.openCounting, 'items');
            add(access.update, 'cancel');
            break;
        case 'Approved':
            keys.push('differences');
            add(access.openCounting, 'items');
            break;
        case 'Cancelled':
            add(access.openCounting, 'items');
            break;
    }
    return keys;
}

/** The one action a table row offers as a button; falls back to the first allowed action. */
export function primaryStockTakeAction(item: StockTake, available: StockTakeActionKey[]): StockTakeActionKey | null {
    const preferred: Record<StockTake['status'], StockTakeActionKey> = {
        Draft: 'start',
        Counting: 'count',
        PendingApproval: 'differences',
        Rejected: 'differences',
        Approved: 'differences',
        Cancelled: 'items',
    };
    return available.includes(preferred[item.status]) ? preferred[item.status] : (available[0] ?? null);
}
