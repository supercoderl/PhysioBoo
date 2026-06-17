import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { RoleFilter } from "../../shared/types/filter";
import { AssignPermissionRequest, CreateRoleRequest } from "../../shared/types/permission";
import { Role } from "../../shared/types/role";

@Injectable({ providedIn: 'root' })
export class RoleService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<RoleFilter>) {
        return this.http.post<PagedResponse<PaginationData<Role>>>(BASE_API.ROLE.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Role | null>>(`${BASE_API.ROLE.BASE}/${id}`);
    }

    /** Returns the list of permission IDs currently assigned to a role. */
    getPermissions(roleId: string) {
        return this.http.get<PagedResponse<string[]>>(`${BASE_API.ROLE.BASE}/${roleId}/permissions`);
    }

    create(params: CreateRoleRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.ROLE.CREATE, params);
    }

    update(id: string, params: Partial<CreateRoleRequest>) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.ROLE.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.ROLE.BASE}/${id}`);
    }

    assignPermission(params: AssignPermissionRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.ROLE.ASSIGN_PERMISSION, params);
    }

    removePermission(params: AssignPermissionRequest) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.ROLE.BASE}/${params.roleId}/permissions/${params.permissionId}`);
    }
}
