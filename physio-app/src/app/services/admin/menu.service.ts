import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { MenuItem } from "../../shared/types/menu";

@Injectable({ providedIn: 'root' })
export class MenuService {
    constructor(private http: HttpClient) { }

    search() {
        return this.http.post<PagedResponse<PaginationData<MenuItem>>>(BASE_API.ADMINMENU.SEARCH, {
            pageSize: 100,
            pageNumber: 1
        });
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<MenuItem | null>>(`${BASE_API.ADMINMENU.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMINMENU.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.ADMINMENU.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.ADMINMENU.BASE}/${id}`);
    }
}
