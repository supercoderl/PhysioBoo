import { HttpClient } from "@angular/common/http";
import { computed, Injectable, signal } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { MENU_CACHE_KEY } from "../../shared/data/cache";
import { PagedResponse, PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { MenuItem } from "../../shared/types/menu.types";
import { LocalStorage } from "../../shared/utils/storage";

const SUPERADMIN_ROUTE_PREFIX = '/superadmin';

@Injectable({ providedIn: 'root' })
export class MenuService {
    // #region Inputs, Outputs, Properties
    private readonly cached = LocalStorage.load<PaginationData<MenuItem>>(MENU_CACHE_KEY);

    /** Menu tree of the current user (all areas), hydrated from the local cache. */
    readonly mine = signal<MenuItem[]>(this.cached?.items ?? []);
    /** True once the menu is known (cached or fetched), so views can tell "loading" from "empty". */
    readonly loaded = signal(this.cached !== null);
    readonly adminMenus = computed(() => this.sortByOrder(this.mine().filter(m => !this.isSuperadmin(m))));
    readonly superadminMenus = computed(() => this.sortByOrder(this.mine().filter(m => this.isSuperadmin(m))));
    // #endregion

    constructor(private http: HttpClient) { }

    // #region Menu cache
    /** Stores the freshly loaded menu so every sidebar reacts to it and survives a refresh. */
    publish(items: MenuItem[]): void {
        const cache: PaginationData<MenuItem> = {
            ...PaginationDataWithInit<MenuItem>(),
            items,
            totalCount: items.length
        };
        LocalStorage.save(MENU_CACHE_KEY, cache);
        this.mine.set(items);
        this.loaded.set(true);
    }

    /** Marks the menu as known even when loading failed, so views stop showing a skeleton. */
    markLoaded(): void {
        this.loaded.set(true);
    }

    clear(): void {
        LocalStorage.remove(MENU_CACHE_KEY);
        this.mine.set([]);
        this.loaded.set(false);
    }

    private isSuperadmin(menu: MenuItem): boolean {
        return !!menu.route?.startsWith(SUPERADMIN_ROUTE_PREFIX);
    }

    private sortByOrder(items: MenuItem[]): MenuItem[] {
        return [...items].sort((a, b) => a.order - b.order);
    }
    // #endregion

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
