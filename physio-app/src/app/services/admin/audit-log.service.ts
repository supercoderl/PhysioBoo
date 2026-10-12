import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { AuditLog, AuditLogQuery } from "../../shared/types/audit-log.types";
import { PagedResponse, PaginationData } from "../../shared/types/common";

/** Read-only view of the server-side audit trail (`api/audit-logs`). */
@Injectable({ providedIn: 'root' })
export class AuditLogService {
    private readonly http = inject(HttpClient);

    search(query: AuditLogQuery) {
        // Query-string endpoint: empty filters must be omitted, not sent as empty strings.
        const params: Record<string, string | number> = { pageNumber: query.pageNumber, pageSize: query.pageSize };
        if (query.search) params['search'] = query.search;
        if (query.tableName) params['tableName'] = query.tableName;
        if (query.action) params['action'] = query.action;
        if (query.dateFrom) params['dateFrom'] = query.dateFrom;
        if (query.dateTo) params['dateTo'] = query.dateTo;
        return this.http.get<PagedResponse<PaginationData<AuditLog>>>(BASE_API.AUDIT_LOG.SEARCH, { params });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<AuditLog | null>>(`${BASE_API.AUDIT_LOG.BASE}/${id}`);
    }
}
