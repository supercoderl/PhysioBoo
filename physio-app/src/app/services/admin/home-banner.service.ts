import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { BannerFilter } from "../../shared/types/filter.types";
import { Banner } from "../../shared/types/banner.types";

@Injectable({ providedIn: 'root' })
export class HomeBannerService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<BannerFilter>) {
        return this.http.post<PagedResponse<PaginationData<Banner>>>(BASE_API.HOME_BANNER.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Banner | null>>(`${BASE_API.HOME_BANNER.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOME_BANNER.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.HOME_BANNER.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOME_BANNER.BASE}/${id}`);
    }
}
