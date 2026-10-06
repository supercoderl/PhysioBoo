import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { Admission, CreateAdmissionRequest, DischargeAdmissionRequest, UpdateAdmissionRequest } from "../../shared/types/admission.types";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { AdmissionFilter } from "../../shared/types/filter.types";

@Injectable({ providedIn: 'root' })
export class AdmissionService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<AdmissionFilter>) {
        return this.http.post<PagedResponse<PaginationData<Admission>>>(BASE_API.ADMISSION.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Admission | null>>(`${BASE_API.ADMISSION.BASE}/${id}`);
    }

    create(params: CreateAdmissionRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMISSION.BASE, params);
    }

    update(id: string, params: UpdateAdmissionRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.ADMISSION.BASE}/${id}`, params);
    }

    discharge(id: string, params: DischargeAdmissionRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMISSION.DISCHARGE(id), params);
    }
}
