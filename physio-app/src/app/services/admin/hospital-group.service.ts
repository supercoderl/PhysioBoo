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

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<HospitalGroup | null>>(BASE_API.HOSPITALGROUP.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITALGROUP.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITALGROUP.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOSPITALGROUP.DELETE, { id, isHard });
    }
}
