import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { User } from "../../shared/types/core";
import { UserFilter } from "../../shared/types/filter";
import { AssignRoleRequest } from "../../shared/types/permission";

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<UserFilter>) {
        return this.http.post<PagedResponse<PaginationData<User>>>(BASE_API.USER.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<User | null>>(`${BASE_API.USER.BASE}/${id}`);
    }

    register(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.USER.REGISTER, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.USER.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.USER.BASE}/${id}`);
    }

    assignRole(params: AssignRoleRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.USER.ASSIGN_ROLE, params);
    }

    removeRole(params: AssignRoleRequest) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.USER.BASE}/${params.userId}/roles/${params.roleId}`);
    }
}
