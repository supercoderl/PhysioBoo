import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, map, Observable } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { HospitalGroupFilter } from "../../shared/types/filter.types";
import { TenantStats } from "../../shared/types/platform.types";
import { HospitalGroup } from "../../shared/types/support.types";

@Injectable({ providedIn: 'root' })
export class HospitalGroupService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<HospitalGroupFilter>) {
        return this.http.post<PagedResponse<PaginationData<HospitalGroup>>>(BASE_API.HOSPITALGROUP.SEARCH, request);
    }

    /**
     * Placeholder until `GET /api/hospital-groups/stats` exists (see docs/superadmin-tenants-redesign.md §12):
     * reads `totalCount` from two single-row searches instead of counting the visible page.
     */
    getStats(): Observable<TenantStats> {
        const count = (isActive: boolean | null) => this.search({
            pageNumber: 1,
            pageSize: 1,
            search: '',
            sort: 'createdAt:desc',
            filter: { start: '', end: '', isActive }
        }).pipe(map(res => res.success ? res.data?.totalCount ?? 0 : 0));

        return forkJoin({ total: count(null), active: count(true) }).pipe(
            map(({ total, active }) => ({ total, active, inactive: Math.max(total - active, 0) }))
        );
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<HospitalGroup | null>>(`${BASE_API.HOSPITALGROUP.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITALGROUP.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<void>(`${BASE_API.HOSPITALGROUP.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOSPITALGROUP.BASE}/${id}`);
    }
}
