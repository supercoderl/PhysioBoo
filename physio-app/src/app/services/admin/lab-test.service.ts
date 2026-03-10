import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LabTestFilter } from "../../shared/types/filter";
import { LabTest } from "../../shared/types/laboratory-imaging";

@Injectable({ providedIn: 'root' })
export class LabTestService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<LabTestFilter>) {
        return this.http.post<PagedResponse<PaginationData<LabTest>>>(BASE_API.LABTEST.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<LabTest | null>>(BASE_API.LABTEST.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTEST.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTEST.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTEST.DELETE, {
            id, isHard
        });
    }
}