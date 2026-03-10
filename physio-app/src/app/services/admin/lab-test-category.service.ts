import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, shareReplay } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { Lookup, PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LabTestCategoryFilter } from "../../shared/types/filter";
import { LabTestCategory } from "../../shared/types/laboratory-imaging";

@Injectable({ providedIn: 'root' })
export class LabTestCategoryService {
    private labTestCategories$?: Observable<any[]>;

    constructor(private http: HttpClient) { }

    search(request: PagedRequest<LabTestCategoryFilter>) {
        return this.http.post<PagedResponse<PaginationData<LabTestCategory>>>(BASE_API.LABTESTCATEGORY.SEARCH, request);
    }

    lookup(): Observable<any[]> {
        if (!this.labTestCategories$) {
            this.labTestCategories$ = this.http.post<PagedResponse<PaginationData<Lookup>>>(BASE_API.LABTESTCATEGORY.LOOKUP, null).pipe(
                map(res => {
                    if (res.success && res.data?.items) {
                        return res.data.items.map((item: any) => ({
                            value: item.id,
                            label: item.name
                        }));
                    }
                    return [];
                }),
                shareReplay(1)
            );
        }
        return this.labTestCategories$;
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<LabTestCategory | null>>(BASE_API.LABTESTCATEGORY.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTESTCATEGORY.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTESTCATEGORY.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.LABTESTCATEGORY.DELETE, {
            id, isHard
        });
    }
}