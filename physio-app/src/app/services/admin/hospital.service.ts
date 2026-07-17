import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { HospitalFilter } from "../../shared/types/filter.types";
import { Hospital } from "../../shared/types/support.types";

@Injectable({ providedIn: 'root' })
export class HospitalService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<HospitalFilter>) {
        return this.http.post<PagedResponse<PaginationData<Hospital>>>(BASE_API.HOSPITAL.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Hospital | null>>(`${BASE_API.HOSPITAL.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITAL.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.HOSPITAL.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOSPITAL.BASE}/${id}`);
    }
}
