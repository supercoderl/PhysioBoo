import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { MenuItem } from "../../shared/types/menu.types";

@Injectable({ providedIn: 'root' })
export class MenuService {
    constructor(private http: HttpClient) { }

    search() {
        return this.http.post<PagedResponse<PaginationData<MenuItem>>>(BASE_API.ADMINMENU.SEARCH, {
            pageSize: 100,
            pageNumber: 1
        }, {
            context: createHttpContext({
                skipErrorToast: false,
                loadingKey: LoadingKeys.ADMIN_MENU.SEARCH
            })
        });
    }

    getMine() {
        return this.http.get<PagedResponse<MenuItem[]>>(BASE_API.ADMINMENU.MINE, {
            context: createHttpContext({
                skipErrorToast: true,
                loadingKey: LoadingKeys.ADMIN_MENU.SEARCH
            })
        });
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<MenuItem | null>>(`${BASE_API.ADMINMENU.BASE}/${id}`, {
            context: createHttpContext({
                skipErrorToast: false,
                loadingKey: LoadingKeys.ADMIN_MENU.SEARCH_BY_ID
            })
        });
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.ADMINMENU.BASE, params, {
            context: createHttpContext({
                skipErrorToast: false,
                loadingKey: LoadingKeys.ADMIN_MENU.CREATE
            })
        });
    }

    update(id: string, params: any) {
        return this.http.patch(`${BASE_API.ADMINMENU.BASE}/${id}`, params, {
            context: createHttpContext({
                skipErrorToast: false,
                loadingKey: LoadingKeys.ADMIN_MENU.UPDATE
            })
        });
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.ADMINMENU.BASE}/${id}`, {
            context: createHttpContext({
                skipErrorToast: false,
                loadingKey: LoadingKeys.ADMIN_MENU.DELETE
            })
        });
    }
}
