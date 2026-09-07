/** Reused from physio-app/src/app/services/admin/doctor.service.ts — pure API-facing, no desktop coupling. Write/delete methods dropped (not used by Guest/Patient). */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { Doctor, DoctorFilter } from "../../shared/types/doctor.types";
import { createHttpContext } from "../../shared/contexts/option.context";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class DoctorService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<DoctorFilter>) {
        return this.http.post<PagedResponse<PaginationData<Doctor>>>(BASE_API.DOCTOR.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.DOCTOR.SEARCH })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<Doctor | null>>(`${BASE_API.DOCTOR.BASE}/${id}`, {
            context: createHttpContext({ loadingKey: LoadingKeys.DOCTOR.GET_BY_ID })
        });
    }
}
