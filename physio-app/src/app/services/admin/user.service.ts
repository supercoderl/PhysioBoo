import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { User } from "../../shared/types/core";
import { UserFilter } from "../../shared/types/filter";

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<UserFilter>) {
        return this.http.post<PagedResponse<PaginationData<User>>>(BASE_API.USER.SEARCH, request);
    }

    assignRole(params: { userId: string; roleId: string }) {
        return this.http.post<PagedResponse<string>>(BASE_API.USER.ASSIGN_ROLE, params);
    }
}
