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

    search_by_id(id: string) {
        return this.http.get<PagedResponse<MedicineCategory | null>>(`${BASE_API.MEDICINECATEGORY.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICINECATEGORY.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.MEDICINECATEGORY.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.MEDICINECATEGORY.BASE}/${id}`);
    }
}
