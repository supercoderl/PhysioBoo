import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { SKIP_ERROR_TOAST } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import {
    DashboardOverviewQuery,
    DashboardOverviewSnapshot,
} from "../../shared/types/dashboard-overview.types";

/**
 * Executive dashboard data (`/api/dashboard/*`, see docs/dashboard-redesign.md section 15).
 */
@Injectable({ providedIn: 'root' })
export class DashboardOverviewService {
    private readonly http = inject(HttpClient);

    getOverview(query?: DashboardOverviewQuery): Observable<PagedResponse<DashboardOverviewSnapshot>> {
        let params = new HttpParams();
        if (query?.date) params = params.set('date', query.date);
        if (query?.shift) params = params.set('shift', query.shift);
        // The page shows its own error state for the overview, so the global error toast is skipped.
        return this.http.get<PagedResponse<DashboardOverviewSnapshot>>(BASE_API.DASHBOARD.OVERVIEW, {
            params,
            context: new HttpContext().set(SKIP_ERROR_TOAST, true)
        });
    }

    dismissAlert(alertId: string, resolutionNote?: string): Observable<PagedResponse<string>> {
        return this.http.post<PagedResponse<string>>(BASE_API.DASHBOARD.ALERT_DISMISS(encodeURIComponent(alertId)), { resolutionNote: resolutionNote ?? null });
    }

    /** Downloads the day's figures as CSV (the server only produces CSV). */
    exportReport(request: { date: string; shift?: string }): Observable<Blob> {
        return this.http.post(BASE_API.DASHBOARD.EXPORT, request, { responseType: 'blob' }).pipe(
            tap(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `dashboard-${request.date}.csv`;
                link.click();
                URL.revokeObjectURL(url);
            })
        );
    }
}
