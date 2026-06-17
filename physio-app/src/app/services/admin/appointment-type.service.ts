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

    search_by_id(id: string) {
        return this.http.get<PagedResponse<AppointmentType | null>>(`${BASE_API.APPOINTMENTTYPE.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.APPOINTMENTTYPE.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.APPOINTMENTTYPE.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.APPOINTMENTTYPE.BASE}/${id}`);
    }
}
