import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, map, Observable } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { RoleFilter } from "../../shared/types/filter.types";
import { AssignPermissionsRequest, CreateRoleRequest, RevokePermissionRequest } from "../../shared/types/permission.types";
import { RoleStats } from "../../shared/types/platform.types";
import { Role } from "../../shared/types/role.types";

@Injectable({ providedIn: 'root' })
export class RoleService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<RoleFilter>) {
        return this.http.post<PagedResponse<PaginationData<Role>>>(BASE_API.ROLE.SEARCH, request);
    }

    /**
     * Placeholder until `GET /api/roles/stats` exists (see docs/superadmin-redesign.md §17):
     * reads `totalCount` from single-row searches instead of counting the visible page.
     */
    getStats(): Observable<RoleStats> {
        const count = (isActive: boolean | null, isSystemRole: boolean | null) => this.search({
            pageNumber: 1,
            pageSize: 1,
            search: '',
            sort: 'createdAt:desc',
            filter: { start: '', end: '', isActive, isSystemRole }
        }).pipe(map(res => res.success ? res.data?.totalCount ?? 0 : 0));

        return forkJoin({
            total: count(null, null),
            active: count(true, null),
            system: count(null, true)
        });
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

    assignPermissions(params: AssignPermissionsRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.ROLE.ASSIGN_PERMISSION, params);
    }

    removePermission(params: RevokePermissionRequest) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.ROLE.BASE}/${params.roleId}/permissions/${params.permissionId}`);
    }
}
