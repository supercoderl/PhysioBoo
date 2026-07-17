import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { FeatureFilter } from "../../shared/types/filter.types";
import { Feature } from "../../shared/types/feature.types";

@Injectable({ providedIn: 'root' })
export class HomeFeatureService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<FeatureFilter>) {
        return this.http.post<PagedResponse<PaginationData<Feature>>>(BASE_API.HOME_FEATURE.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Feature | null>>(`${BASE_API.HOME_FEATURE.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOME_FEATURE.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.HOME_FEATURE.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOME_FEATURE.BASE}/${id}`);
    }
}
