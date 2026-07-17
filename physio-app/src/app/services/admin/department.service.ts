import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { DepartmentFilter } from "../../shared/types/filter.types";
import { Department } from "../../shared/types/operation.types";

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<DepartmentFilter>) {
        return this.http.post<PagedResponse<PaginationData<Department>>>(BASE_API.DEPARTMENT.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Department | null>>(`${BASE_API.DEPARTMENT.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.DEPARTMENT.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.DEPARTMENT.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.DEPARTMENT.BASE}/${id}`);
    }
}
