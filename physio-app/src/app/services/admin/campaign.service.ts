import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { CampaignFilter } from "../../shared/types/filter.types";
import { Campaign, CampaignStats, CreateCampaignRequest, UpdateCampaignRequest } from "../../shared/types/campaign.types";

@Injectable({ providedIn: 'root' })
export class CampaignService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<CampaignFilter>) {
        return this.http.post<PagedResponse<PaginationData<Campaign>>>(BASE_API.CAMPAIGN.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Campaign | null>>(`${BASE_API.CAMPAIGN.BASE}/${id}`);
    }

    stats() {
        return this.http.get<PagedResponse<CampaignStats>>(BASE_API.CAMPAIGN.STATS);
    }

    create(params: CreateCampaignRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.CAMPAIGN.BASE, params);
    }

    update(id: string, params: UpdateCampaignRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.CAMPAIGN.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.CAMPAIGN.BASE}/${id}`);
    }
}
