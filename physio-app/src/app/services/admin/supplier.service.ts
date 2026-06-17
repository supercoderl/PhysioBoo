import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { SupplierFilter } from "../../shared/types/filter";
import { Supplier } from "../../shared/types/support";

@Injectable({ providedIn: 'root' })
export class SupplierService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<SupplierFilter>) {
        return this.http.post<PagedResponse<PaginationData<Supplier>>>(BASE_API.SUPPLIER.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Supplier | null>>(`${BASE_API.SUPPLIER.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.SUPPLIER.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.SUPPLIER.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.SUPPLIER.BASE}/${id}`);
    }
}
