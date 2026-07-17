import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { SequenceTrackerFilter } from "../../shared/types/filter.types";
import { SequenceTracker } from "../../shared/types/system.types";

@Injectable({ providedIn: 'root' })
export class SequenceTrackerService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<SequenceTrackerFilter>) {
        return this.http.post<PagedResponse<PaginationData<SequenceTracker>>>(BASE_API.SEQUENCETRACKER.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<SequenceTracker | null>>(`${BASE_API.SEQUENCETRACKER.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.SEQUENCETRACKER.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.SEQUENCETRACKER.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.SEQUENCETRACKER.BASE}/${id}`);
    }
}
