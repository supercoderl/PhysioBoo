import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { RewardFilter } from "../../shared/types/filter.types";
import { CreateRewardRequest, Reward, UpdateRewardRequest } from "../../shared/types/reward.types";

@Injectable({ providedIn: 'root' })
export class RewardService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<RewardFilter>) {
        return this.http.post<PagedResponse<PaginationData<Reward>>>(BASE_API.REWARD.SEARCH, request);
    }

    create(params: CreateRewardRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.REWARD.BASE, params);
    }

    update(id: string, params: UpdateRewardRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.REWARD.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.REWARD.BASE}/${id}`);
    }
}
