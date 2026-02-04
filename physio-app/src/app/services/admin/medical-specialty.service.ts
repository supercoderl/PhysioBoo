import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { MedicalSpecialty } from "../../shared/types/medical-staff";
import { BASE_API } from "../../shared/api/base";

@Injectable({ providedIn: 'root' })
export class MedicalSpecialtyService {
    constructor(private http: HttpClient) { }

    search(params: { pageNumber: number, pageSize: number }) {
        return this.http.post<PagedResponse<PaginationData<MedicalSpecialty[]>>>(BASE_API.MEDICALSPECIALTY.SEARCH, { params });
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.CREATE, params);
    }

    update(id: string, params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.CREATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICALSPECIALTY.DELETE, {
            id, isHard
        });
    }
}