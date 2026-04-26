import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { HospitalFilter } from "../../shared/types/filter";
import { Hospital } from "../../shared/types/support";

@Injectable({ providedIn: 'root' })
export class HospitalService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<HospitalFilter>) {
        return this.http.post<PagedResponse<PaginationData<Hospital>>>(BASE_API.HOSPITAL.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<Hospital | null>>(BASE_API.HOSPITAL.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITAL.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITAL.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITAL.DELETE, { id, isHard });
    }
}
