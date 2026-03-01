import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { BASE_API } from "../../shared/api/base";
import { InsuranceCompany } from "../../shared/types/support";
import { InsuranceCompanyFilter } from "../../shared/types/filter";

@Injectable({ providedIn: 'root' })
export class InsuranceCompanyService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<InsuranceCompanyFilter>) {
        return this.http.post<PagedResponse<PaginationData<InsuranceCompany>>>(BASE_API.INSURANCECOMPANY.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<InsuranceCompany | null>>(BASE_API.INSURANCECOMPANY.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.INSURANCECOMPANY.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.INSURANCECOMPANY.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.INSURANCECOMPANY.DELETE, {
            id, isHard
        });
    }
}