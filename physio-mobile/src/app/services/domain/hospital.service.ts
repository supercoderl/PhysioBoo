/** Reused from physio-app/src/app/services/admin/hospital.service.ts — pure API-facing, no desktop coupling. Write/delete methods dropped (not used by Guest/Patient). */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { Hospital, HospitalFilter } from "../../shared/types/facility.types";
import { createHttpContext } from "../../shared/contexts/option.context";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class HospitalService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<HospitalFilter>) {
        return this.http.post<PagedResponse<PaginationData<Hospital>>>(BASE_API.HOSPITAL.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.HOSPITAL.SEARCH })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<Hospital | null>>(`${BASE_API.HOSPITAL.BASE}/${id}`, {
            context: createHttpContext({ loadingKey: LoadingKeys.HOSPITAL.GET_BY_ID })
        });
    }
}
