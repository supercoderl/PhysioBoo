export type AuditAction = 'None' | 'Create' | 'Update' | 'Delete' | 'SoftDelete';

/** One row of `Sys_AuditLog`, written by the server for every tracked change. */
export interface AuditLog {
    id: string;
    userId: string | null;
    userEmail: string | null;
    action: AuditAction | string;
    tableName: string;
    primaryKey: string;
    /** JSON text of the column values before the change. */
    oldValues: string | null;
    /** JSON text of the column values after the change. */
    newValues: string | null;
    /** JSON text: array of the columns the change touched. */
    affectedColumns: string | null;
    dateOccurred: string;
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string | null;
}

export interface AuditLogQuery {
    search?: string;
    pageNumber: number;
    pageSize: number;
    tableName?: string;
    action?: string;
    /** ISO timestamps. */
    dateFrom?: string;
    dateTo?: string;
}

export interface AuditLogChange {
    column: string;
    before: string | null;
    after: string | null;
}

export interface BlockIpRequest {
    ipAddress: string;
    reason: string;
    durationMinutes: number;
}
