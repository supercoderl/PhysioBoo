import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { MedicalSpecialty } from "../../shared/types/medical-staff";
import { BASE_API } from "../../shared/api/base";
import { MedicalSpecialtyFilter } from "../../shared/types/filter";

@Injectable({ providedIn: 'root' })
export class MedicalSpecialtyService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<MedicalSpecialtyFilter>) {
        return this.http.post<PagedResponse<PaginationData<MedicalSpecialty>>>(BASE_API.MEDICALSPECIALTY.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<MedicalSpecialty | null>>(BASE_API.MEDICALSPECIALTY.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.DELETE, {
            id, isHard
        });
    }
}