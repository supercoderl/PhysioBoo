import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LabTestFilter } from "../../shared/types/filter.types";
import { LabTest } from "../../shared/types/laboratory-imaging.types";

@Injectable({ providedIn: 'root' })
export class LabTestService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<LabTestFilter>) {
        return this.http.post<PagedResponse<PaginationData<LabTest>>>(BASE_API.LABTEST.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<LabTest | null>>(`${BASE_API.LABTEST.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTEST.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.LABTEST.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.LABTEST.BASE}/${id}`);
    }
}
