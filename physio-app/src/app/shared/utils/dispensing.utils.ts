import { BooBadgeTone } from '@physioboo/ui';
import { ClinicalWarningSeverity } from '../types/prescription-rx.types';
import {
    BatchOption,
    DispenseItemStatus,
    DispensePriority,
    DispenseMedicationItem,
    DispenseQueueStatus,
    DispenseWorkspace,
} from '../types/dispensing.types';

export const DISPENSE_STATUS_OPTIONS: { label: string; value: DispenseQueueStatus }[] = [
    { label: 'Waiting', value: 'Waiting' },
    { label: 'Verifying', value: 'Verifying' },
    { label: 'Preparing', value: 'Preparing' },
    { label: 'Dispensing', value: 'Dispensing' },
    { label: 'On hold', value: 'OnHold' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
];

/** A closed session can no longer be worked on (the API rejects every command). */
export function isClosedStatus(status: DispenseQueueStatus): boolean {
    return status === 'Completed' || status === 'Cancelled';
}

export function dispenseStatusLabel(status: DispenseQueueStatus): string {
    return status === 'OnHold' ? 'On hold' : status;
}

export function dispenseStatusTone(status: DispenseQueueStatus): BooBadgeTone {
    switch (status) {
        case 'Verifying':
        case 'Preparing':
        case 'Dispensing': return 'primary';
        case 'OnHold': return 'warning';
        case 'Completed': return 'success';
        case 'Cancelled': return 'danger';
        default: return 'neutral';
    }
}

export function priorityTone(priority: DispensePriority): BooBadgeTone {
    return priority === 'Normal' ? 'neutral' : 'danger';
}

export function itemStatusLabel(status: DispenseItemStatus): string {
    switch (status) {
        case 'NotPicked': return 'Not picked';
        case 'OnHold': return 'On hold';
        default: return status;
    }
}

export function itemStatusTone(status: DispenseItemStatus): BooBadgeTone {
    switch (status) {
        case 'Picked':
        case 'Verified': return 'primary';
        case 'Dispensed': return 'success';
        case 'OnHold':
        case 'Replaced':
        case 'Reserved': return 'warning';
        default: return 'neutral';
    }
}

export function severityTone(severity: ClinicalWarningSeverity): BooBadgeTone {
    switch (severity) {
        case 'Critical':
        case 'High': return 'danger';
        case 'Medium': return 'warning';
        case 'Low': return 'neutral';
        default: return 'primary';
    }
}

export function hasUnacknowledgedCritical(item: DispenseMedicationItem): boolean {
    return item.warnings.some(w => w.severity === 'Critical' && !w.acknowledged);
}

/** Lines the API counts as resolved for completion: picked, verified, replaced or already dispensed. */
export function isLineReady(item: DispenseMedicationItem): boolean {
    return item.status === 'Picked' || item.status === 'Verified' || item.status === 'Replaced' || item.status === 'Dispensed';
}

export function selectedBatch(item: DispenseMedicationItem): BatchOption | undefined {
    return item.availableBatches.find(b => b.batchNo === item.batchNo);
}

/** Stock a line could still draw on: every batch that is not expired. */
export function usableStock(item: DispenseMedicationItem): number {
    return item.availableBatches.filter(b => !b.isExpired).reduce((sum, b) => sum + b.quantityAvailable, 0);
}

/** Mirrors the server's pre-completion checks; the server stays authoritative. */
export function completionBlockReason(workspace: DispenseWorkspace): string | null {
    if (workspace.items.some(hasUnacknowledgedCritical)) return 'Acknowledge all Critical clinical alerts before completing.';
    if (workspace.items.some(i => i.status === 'NotPicked')) return 'Pick or resolve every medication line before completing.';
    return null;
}

/** Null when valid. The API additionally limits the quantity to what remains on the prescription line. */
export function quantityError(value: unknown, prescribed: number): string | null {
    if (value === null || value === undefined || value === '') return 'Enter a quantity.';
    const qty = Number(value);
    if (!Number.isInteger(qty)) return 'Use a whole number.';
    if (qty < 0) return 'Quantity cannot be negative.';
    if (qty > prescribed) return `Cannot exceed the prescribed ${prescribed}.`;
    return null;
}

export function batchOptionLabel(batch: BatchOption): string {
    const expiry = batch.expiryDate ? ` · exp ${batch.expiryDate}` : '';
    const flag = batch.isExpired ? ' · expired' : batch.isNearExpiry ? ' · near expiry' : '';
    return `${batch.batchNo}${expiry} · ${batch.quantityAvailable} available${flag}`;
}
