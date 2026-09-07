/** Reused from physio-app/src/app/services/admin/department.service.ts — pure API-facing, no desktop coupling. Write/delete methods dropped (not used by Guest/Patient). */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { Department, DepartmentFilter } from "../../shared/types/facility.types";
import { createHttpContext } from "../../shared/contexts/option.context";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<DepartmentFilter>) {
        return this.http.post<PagedResponse<PaginationData<Department>>>(BASE_API.DEPARTMENT.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.DEPARTMENT.SEARCH })
        });
    }
}
