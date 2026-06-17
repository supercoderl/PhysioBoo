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
