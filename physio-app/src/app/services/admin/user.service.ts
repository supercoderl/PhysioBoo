import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { User } from "../../shared/types/core.types";
import { UserFilter } from "../../shared/types/filter.types";
import { AssignRoleRequest } from "../../shared/types/permission.types";
import { UserSession } from "../../shared/types/session.types";
import { MyAccount, UpdateMyAccountRequest } from "../../shared/types/account.types";

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
        return this.http.post<PagedResponse<string>>(`${BASE_API.USER.BASE}/${params.userId}/roles/${params.roleId}`, {});
    }

    /** Returns 204 No Content on success; failures come back as an HTTP error with a ResponseMessage body. */
    changePassword(oldPassword: string, newPassword: string) {
        return this.http.patch<void>(BASE_API.USER.CHANGE_PASSWORD, { oldPassword, newPassword });
    }

    getMyAccount() {
        return this.http.get<PagedResponse<MyAccount | null>>(BASE_API.USER.MY_ACCOUNT);
    }

    updateMyAccount(params: UpdateMyAccountRequest) {
        return this.http.put<PagedResponse<MyAccount | null>>(BASE_API.USER.MY_ACCOUNT, params);
    }

    getSessions() {
        return this.http.get<PagedResponse<UserSession[]>>(BASE_API.USER.SESSIONS);
    }

    revokeSession(sessionId: string) {
        return this.http.delete<PagedResponse<string>>(BASE_API.USER.SESSION(sessionId));
    }

    revokeOtherSessions() {
        return this.http.post<PagedResponse<boolean>>(BASE_API.USER.SESSIONS_REVOKE_OTHERS, {});
    }

    removeRole(params: AssignRoleRequest) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.USER.BASE}/${params.userId}/roles/${params.roleId}`);
    }
}
