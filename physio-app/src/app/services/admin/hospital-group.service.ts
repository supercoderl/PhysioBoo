import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { HospitalGroupFilter } from "../../shared/types/filter";
import { HospitalGroup } from "../../shared/types/support";

@Injectable({ providedIn: 'root' })
export class HospitalGroupService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<HospitalGroupFilter>) {
        return this.http.post<PagedResponse<PaginationData<HospitalGroup>>>(BASE_API.HOSPITALGROUP.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<HospitalGroup | null>>(`${BASE_API.HOSPITALGROUP.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITALGROUP.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.HOSPITALGROUP.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOSPITALGROUP.BASE}/${id}`);
    }
}
