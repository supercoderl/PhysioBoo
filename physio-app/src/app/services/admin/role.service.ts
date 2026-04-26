import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { RoleFilter } from "../../shared/types/filter";
import { Role } from "../../shared/types/role";

@Injectable({ providedIn: 'root' })
export class RoleService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<RoleFilter>) {
        return this.http.post<PagedResponse<PaginationData<Role>>>(BASE_API.ROLE.SEARCH, request);
    }

    create(params: { id: string; name: string; code: string; description?: string; color?: string; icon?: string; isSystemRole?: boolean }) {
        return this.http.post<PagedResponse<string>>(BASE_API.ROLE.CREATE, params);
    }

    assignPermission(params: { roleId: string; permissionId: string }) {
        return this.http.post<PagedResponse<string>>(BASE_API.ROLE.ASSIGN_PERMISSION, params);
    }
}
