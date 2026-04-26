import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { DepartmentFilter } from "../../shared/types/filter";
import { Department } from "../../shared/types/operation";

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<DepartmentFilter>) {
        return this.http.post<PagedResponse<PaginationData<Department>>>(BASE_API.DEPARTMENT.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<Department | null>>(BASE_API.DEPARTMENT.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.DEPARTMENT.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.DEPARTMENT.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.DEPARTMENT.DELETE, {
            id, isHard
        });
    }
}