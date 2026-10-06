import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { MemberFilter, PointTransactionFilter } from "../../shared/types/filter.types";
import { AddPointsRequest, EnrollMemberRequest, Member, MemberStats, RedeemPointsRequest, UpdateMemberRequest } from "../../shared/types/member.types";
import { PointTransaction } from "../../shared/types/transaction.types";

@Injectable({ providedIn: 'root' })
export class MemberService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<MemberFilter>) {
        return this.http.post<PagedResponse<PaginationData<Member>>>(BASE_API.MEMBER.SEARCH, request);
    }

    stats() {
        return this.http.get<PagedResponse<MemberStats>>(BASE_API.MEMBER.STATS);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Member | null>>(`${BASE_API.MEMBER.BASE}/${id}`);
    }

    enroll(params: EnrollMemberRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEMBER.BASE, params);
    }

    update(id: string, params: UpdateMemberRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.MEMBER.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.MEMBER.BASE}/${id}`);
    }

    transactions(id: string, request: PagedRequest<PointTransactionFilter>) {
        return this.http.post<PagedResponse<PaginationData<PointTransaction>>>(BASE_API.MEMBER.TRANSACTIONS(id), request);
    }

    addPoints(id: string, params: AddPointsRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEMBER.ADD_POINTS(id), params);
    }

    redeemPoints(id: string, params: RedeemPointsRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEMBER.REDEEM_POINTS(id), params);
    }
}
