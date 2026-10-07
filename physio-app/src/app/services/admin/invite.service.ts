import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { CreateInviteRequest, TenantInvite } from "../../shared/types/invite.types";

@Injectable({ providedIn: 'root' })
export class InviteService {
    constructor(private http: HttpClient) { }

    getPending() {
        return this.http.get<PagedResponse<TenantInvite[]>>(BASE_API.INVITE.BASE);
    }

    create(params: CreateInviteRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.INVITE.BASE, params);
    }

    revoke(inviteId: string) {
        return this.http.delete<PagedResponse<string>>(BASE_API.INVITE.DETAIL(inviteId));
    }
}
