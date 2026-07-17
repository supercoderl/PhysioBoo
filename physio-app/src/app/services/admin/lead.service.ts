import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LeadFilter } from "../../shared/types/filter.types";
import { CreateLeadRequest, Lead, LeadStats, UpdateLeadRequest } from "../../shared/types/lead.types";

@Injectable({ providedIn: 'root' })
export class LeadService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<LeadFilter>) {
        return this.http.post<PagedResponse<PaginationData<Lead>>>(BASE_API.LEAD.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Lead | null>>(`${BASE_API.LEAD.BASE}/${id}`);
    }

    stats() {
        return this.http.get<PagedResponse<LeadStats>>(BASE_API.LEAD.STATS);
    }

    create(params: CreateLeadRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.LEAD.BASE, params);
    }

    update(id: string, params: UpdateLeadRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.LEAD.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.LEAD.BASE}/${id}`);
    }
}
