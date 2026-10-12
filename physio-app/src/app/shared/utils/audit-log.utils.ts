import { BadgeTone } from "../../components/ui/status-badge.component";
import { AuditLog, AuditLogChange } from "../types/audit-log.types";

export function auditActionTone(action: string): BadgeTone {
    switch (action) {
        case 'Create': return 'success';
        case 'Update': return 'primary';
        case 'Delete': case 'SoftDelete': return 'danger';
        default: return 'neutral';
    }
}

function parseObject(json: string | null): Record<string, unknown> | null {
    if (!json) return null;
    try {
        const value = JSON.parse(json);
        return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
    } catch {
        return null;
    }
}

function parseColumns(json: string | null): string[] | null {
    if (!json) return null;
    try {
        const value = JSON.parse(json);
        return Array.isArray(value) ? value.map(String) : null;
    } catch {
        return null;
    }
}

function show(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/**
 * Column-by-column before/after of one audit entry. Uses `affectedColumns` when present,
 * otherwise every column found in the old or new values; unchanged columns are dropped for updates.
 */
export function auditChanges(log: Pick<AuditLog, 'action' | 'oldValues' | 'newValues' | 'affectedColumns'>): AuditLogChange[] {
    const before = parseObject(log.oldValues);
    const after = parseObject(log.newValues);
    const affected = parseColumns(log.affectedColumns);
    const columns = affected?.length
        ? affected
        : [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];

    return columns
        .map(column => ({ column, before: show(before?.[column]), after: show(after?.[column]) }))
        .filter(change => log.action !== 'Update' || change.before !== change.after);
}
