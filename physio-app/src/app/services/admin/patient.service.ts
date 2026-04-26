import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { PatientFilter } from "../../shared/types/filter";
import { Patient } from "../../shared/types/patient";

@Injectable({ providedIn: 'root' })
export class PatientService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PatientFilter>) {
        return this.http.post<PagedResponse<PaginationData<Patient>>>(BASE_API.PATIENT.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<Patient | null>>(BASE_API.PATIENT.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.PATIENT.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.PATIENT.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.PATIENT.DELETE, { id, isHard });
    }
}
