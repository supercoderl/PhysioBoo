import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { InsuranceCompanyFilter } from "../../shared/types/filter.types";
import { InsuranceCompany } from "../../shared/types/support.types";

@Injectable({ providedIn: 'root' })
export class InsuranceCompanyService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<InsuranceCompanyFilter>) {
        return this.http.post<PagedResponse<PaginationData<InsuranceCompany>>>(BASE_API.INSURANCECOMPANY.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<InsuranceCompany | null>>(`${BASE_API.INSURANCECOMPANY.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.INSURANCECOMPANY.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.INSURANCECOMPANY.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.INSURANCECOMPANY.BASE}/${id}`);
    }
}
