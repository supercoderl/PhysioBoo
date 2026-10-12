import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { HospitalFilter } from "../../shared/types/filter.types";
import { Hospital, SaveHospitalRequest } from "../../shared/types/support.types";

@Injectable({ providedIn: 'root' })
export class HospitalService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<HospitalFilter>) {
        return this.http.post<PagedResponse<PaginationData<Hospital>>>(BASE_API.HOSPITAL.SEARCH, request);
    }

    /** Hospitals (branches) of one tenant, sorted by name. Read-only view for the Super Admin tenant detail. */
    searchByGroup(hospitalGroupId: string, limit = 50): Observable<Hospital[]> {
        return this.search({
            pageNumber: 1,
            pageSize: limit,
            search: '',
            sort: '+name',
            filter: { start: '', end: '', hospitalGroupId, type: null, isActive: null, hasEmergencyServices: null }
        }).pipe(map(res => res.success ? res.data?.items ?? [] : []));
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Hospital | null>>(`${BASE_API.HOSPITAL.BASE}/${id}`);
    }

    create(params: SaveHospitalRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITAL.BASE, params);
    }

    update(id: string, params: SaveHospitalRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.HOSPITAL.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOSPITAL.BASE}/${id}`);
    }
}
