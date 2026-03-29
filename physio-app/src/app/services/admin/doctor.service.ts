import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { DoctorFilter } from "../../shared/types/filter";
import { Doctor } from "../../shared/types/medical-staff";

@Injectable({ providedIn: 'root' })
export class DoctorService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<DoctorFilter>) {
        return this.http.post<PagedResponse<PaginationData<Doctor>>>(BASE_API.DOCTOR.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<Doctor | null>>(BASE_API.DOCTOR.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.DOCTOR.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.DOCTOR.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.DOCTOR.DELETE, {
            id, isHard
        });
    }
}