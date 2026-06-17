import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { PermissionFilter } from "../../shared/types/filter";
import { CreatePermissionRequest, Permission } from "../../shared/types/permission";

@Injectable({ providedIn: 'root' })
export class PermissionService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PermissionFilter>) {
        return this.http.post<PagedResponse<PaginationData<Permission>>>(BASE_API.PERMISSION.SEARCH, request);
    }

    create(params: CreatePermissionRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.PERMISSION.CREATE, params);
    }

    update(id: string, params: Partial<CreatePermissionRequest>) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.PERMISSION.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.PERMISSION.BASE}/${id}`);
    }
}
