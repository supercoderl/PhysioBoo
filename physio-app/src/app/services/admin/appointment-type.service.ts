import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { BASE_API } from "../../shared/api/base";
import { AppointmentTypeFilter } from "../../shared/types/filter";
import { AppointmentType } from "../../shared/types/operation";

@Injectable({ providedIn: 'root' })
export class AppointmentTypeService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<AppointmentTypeFilter>) {
        return this.http.post<PagedResponse<PaginationData<AppointmentType>>>(BASE_API.APPOINTMENTTYPE.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<AppointmentType | null>>(BASE_API.APPOINTMENTTYPE.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.APPOINTMENTTYPE.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.APPOINTMENTTYPE.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.APPOINTMENTTYPE.DELETE, {
            id, isHard
        });
    }
}