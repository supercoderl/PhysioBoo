import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { SequenceTrackerFilter } from "../../shared/types/filter";
import { SequenceTracker } from "../../shared/types/system";

@Injectable({ providedIn: 'root' })
export class SequenceTrackerService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<SequenceTrackerFilter>) {
        return this.http.post<PagedResponse<PaginationData<SequenceTracker>>>(BASE_API.SEQUENCETRACKER.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<SequenceTracker | null>>(BASE_API.SEQUENCETRACKER.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.SEQUENCETRACKER.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.SEQUENCETRACKER.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.SEQUENCETRACKER.DELETE, {
            id, isHard
        });
    }
}