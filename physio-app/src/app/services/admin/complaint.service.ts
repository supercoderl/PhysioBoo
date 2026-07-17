import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { Complaint, ComplaintStats, CreateComplaintRequest, UpdateComplaintRequest } from "../../shared/types/complaint.types";
import { ComplaintFilter } from "../../shared/types/filter.types";

@Injectable({ providedIn: 'root' })
export class ComplaintService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ComplaintFilter>) {
        return this.http.post<PagedResponse<PaginationData<Complaint>>>(BASE_API.COMPLAINT.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Complaint | null>>(`${BASE_API.COMPLAINT.BASE}/${id}`);
    }

    stats() {
        return this.http.get<PagedResponse<ComplaintStats>>(BASE_API.COMPLAINT.STATS);
    }

    create(params: CreateComplaintRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.COMPLAINT.BASE, params);
    }

    update(id: string, params: UpdateComplaintRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.COMPLAINT.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.COMPLAINT.BASE}/${id}`);
    }
}
