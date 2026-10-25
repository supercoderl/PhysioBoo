import { STOCK_TAKE_MAX_QTY, StockTakeItem } from "../../../../shared/types/stock-take.types";

/** What the user typed for one item and has not saved yet. `rev` changes on every keystroke so a save can tell stale edits apart. */
export interface CountEdit {
    qty: string;
    reason: string | null;
    notes: string;
    rev: number;
}

export type CountFilter = 'all' | 'todo' | 'differences';

/** One table row: the stored item merged with its unsaved edit. */
export interface CountRow {
    item: StockTakeItem;
    qtyText: string;
    reason: string | null;
    notes: string;
    /** Valid whole-number count, or null when empty or invalid. */
    qty: number | null;
    /** `qty - systemQty`; null until a valid count exists. */
    difference: number | null;
    error: string | null;
    dirty: boolean;
    counted: boolean;
    expired: boolean;
}

export interface CountingStats {
    total: number;
    counted: number;
    remaining: number;
    over: number;
    short: number;
}

export function parseCount(text: string): { qty: number | null; error: string | null } {
    const trimmed = text.trim();
    if (!trimmed) return { qty: null, error: null };
    if (!/^\d+$/.test(trimmed)) return { qty: null, error: 'Enter a whole number, 0 or more.' };
    const qty = Number(trimmed);
    if (qty > STOCK_TAKE_MAX_QTY) return { qty: null, error: 'That quantity is too large.' };
    return { qty, error: null };
}

export function isUuid(value: string | null): value is string {
    return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** True when the edit says the same as the stored item, so it needs no saving. */
export function sameAsStored(item: StockTakeItem, edit: Pick<CountEdit, 'qty' | 'reason' | 'notes'>): boolean {
    return edit.qty.trim() === (item.actualQty === null ? '' : String(item.actualQty))
        && (edit.reason ?? null) === (item.reason ?? null)
        && edit.notes === (item.notes ?? '');
}

export function buildRow(item: StockTakeItem, edit: CountEdit | undefined, today: string): CountRow {
    const qtyText = edit ? edit.qty : item.actualQty === null ? '' : String(item.actualQty);
    const parsed = parseCount(qtyText);
    const reason = edit ? edit.reason : item.reason;
    const notes = edit ? edit.notes : item.notes ?? '';

    let error = parsed.error;
    if (!error && edit && parsed.qty === null) {
        // A stored count cannot be cleared and a note or reason needs a count to belong to.
        error = item.isCounted ? 'A saved count cannot be cleared.' : 'Enter the counted quantity first.';
    }

    const counted = parsed.qty !== null || (!edit && item.isCounted);
    return {
        item,
        qtyText,
        reason,
        notes,
        qty: parsed.qty,
        difference: parsed.qty === null ? null : parsed.qty - item.systemQty,
        error,
        dirty: !!edit,
        counted,
        expired: !!item.expiryDate && item.expiryDate < today,
    };
}
