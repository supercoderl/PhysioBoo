import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { MedicineCategory } from "../../shared/types/clinical";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { MedicineCategoryFilter } from "../../shared/types/filter";

@Injectable({ providedIn: 'root' })
export class MedicineCategoryService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<MedicineCategoryFilter>) {
        return this.http.post<PagedResponse<PaginationData<MedicineCategory>>>(BASE_API.MEDICINECATEGORY.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<MedicineCategory | null>>(BASE_API.MEDICINECATEGORY.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICINECATEGORY.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICINECATEGORY.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICINECATEGORY.DELETE, {
            id, isHard
        });
    }
}