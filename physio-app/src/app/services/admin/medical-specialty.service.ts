import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { MedicalSpecialtyFilter } from "../../shared/types/filter.types";
import { MedicalSpecialty } from "../../shared/types/medical-staff.types";

@Injectable({ providedIn: 'root' })
export class MedicalSpecialtyService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<MedicalSpecialtyFilter>) {
        return this.http.post<PagedResponse<PaginationData<MedicalSpecialty>>>(BASE_API.MEDICALSPECIALTY.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<MedicalSpecialty | null>>(`${BASE_API.MEDICALSPECIALTY.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.MEDICALSPECIALTY.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.MEDICALSPECIALTY.BASE}/${id}`);
    }
}
