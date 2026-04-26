import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { MenuItem } from "../../shared/types/menu";

@Injectable({ providedIn: 'root' })
export class MenuService {
    constructor(private http: HttpClient) { }

    search() {
        return this.http.post<PagedResponse<PaginationData<MenuItem>>>(BASE_API.ADMINMENU.SEARCH, {});
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<MenuItem | null>>(BASE_API.ADMINMENU.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMINMENU.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMINMENU.UPDATE, params);
    }

    delete(id: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMINMENU.DELETE, { id });
    }
}
