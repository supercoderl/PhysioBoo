import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { PatientFilter } from "../../shared/types/filter.types";
import { CreatePatientRequest, Patient, UpdatePatientRequest } from "../../shared/types/patient.types";

@Injectable({ providedIn: 'root' })
export class PatientService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PatientFilter>) {
        return this.http.post<PagedResponse<PaginationData<Patient>>>(BASE_API.PATIENT.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Patient | null>>(`${BASE_API.PATIENT.BASE}/${id}`);
    }

    create(params: CreatePatientRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.PATIENT.BASE, params);
    }

    update(id: string, params: UpdatePatientRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.PATIENT.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.PATIENT.BASE}/${id}`);
    }
}
