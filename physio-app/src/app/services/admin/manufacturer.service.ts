import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { BASE_API } from "../../shared/api/base";
import { ManufacturerFilter } from "../../shared/types/filter";
import { Manufacturer } from "../../shared/types/support";

@Injectable({ providedIn: 'root' })
export class ManufacturerService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ManufacturerFilter>) {
        return this.http.post<PagedResponse<PaginationData<Manufacturer>>>(BASE_API.MANUFACTURER.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<Manufacturer | null>>(BASE_API.MANUFACTURER.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MANUFACTURER.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MANUFACTURER.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.MANUFACTURER.DELETE, {
            id, isHard
        });
    }
}