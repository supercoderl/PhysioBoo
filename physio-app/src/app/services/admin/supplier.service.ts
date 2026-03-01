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

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<Supplier | null>>(BASE_API.SUPPLIER.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.SUPPLIER.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.SUPPLIER.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.SUPPLIER.DELETE, {
            id, isHard
        });
    }
}