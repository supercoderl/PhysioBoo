import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { ManufacturerFilter } from "../../shared/types/filter.types";
import { Manufacturer } from "../../shared/types/support.types";

@Injectable({ providedIn: 'root' })
export class ManufacturerService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ManufacturerFilter>) {
        return this.http.post<PagedResponse<PaginationData<Manufacturer>>>(BASE_API.MANUFACTURER.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Manufacturer | null>>(`${BASE_API.MANUFACTURER.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MANUFACTURER.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.MANUFACTURER.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.MANUFACTURER.BASE}/${id}`);
    }
}
