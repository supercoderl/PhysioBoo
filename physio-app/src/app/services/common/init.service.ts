import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';
import { AppConfig, PagedResponse } from '../../shared/types/common';
import { LocalStorage } from '../../shared/utils/storage';
import { MenuCache, MenuItem } from '../../shared/types/menu';
import { BASE_API } from '../../shared/api/base';

@Injectable({ providedIn: 'root' })
export class InitService {
    private http = inject(HttpClient);

    private config: AppConfig | null = null;
    private menus: MenuItem[] = [];

    private readonly CACHE_KEY = "config_data";
    private readonly MENU_CACHE_KEY = "menu_data";

    /**
     * This main function will be called at APP_INITIALIZER
     * Using Promise.all to load in parallel for faster app startup
    **/
    async load(): Promise<void> {
        await Promise.all([
            this.loadConfig(),
            this.loadMenu()
        ]);
    }

    private async loadConfig(): Promise<void> {
        try {
            const cache = LocalStorage.load<AppConfig>(this.CACHE_KEY);
            const cachedVersion = cache?.version;

            let headers = new HttpHeaders();
            if (cachedVersion) {
                headers = headers.set('If-None-Match', `"${cachedVersion}"`);
            }

            const versionResp = await firstValueFrom(
                this.http.post(BASE_API.VERSION, null, {
                    observe: 'response',
                    headers
                }).pipe(
                    catchError(err => {
                        if (err.status === 304) {
                            return of(err); 
                        }
                        return throwError(() => err);
                    })
                )
            );

            if (versionResp.status === 304) {
                this.config = cache!;
                return;
            }

            const res = await firstValueFrom(
                this.http.post<PagedResponse<AppConfig>>(BASE_API.CONFIG, null, {
                    headers: { 'X-Global-Loading': 'true' }
                })
            );

            if(res?.success) {
                const newConfig = res.data;
                this.config = newConfig;
                LocalStorage.save(this.CACHE_KEY, newConfig);
            } else {
                this.config = this.getDefaultConfig();
            }
        } catch (err) {
            console.error(err);
            this.config = this.getDefaultConfig();
        }
    }

    private async loadMenu(): Promise<void> {
        try {
            const cache = LocalStorage.load<MenuCache>(this.MENU_CACHE_KEY);
            const cachedVersion = cache?.version;

            let headers = new HttpHeaders();
            if (cachedVersion) {
                headers = headers.set('If-None-Match', `"${cachedVersion}"`);
            }

            const request$ = this.http.post<PagedResponse<MenuCache>>(BASE_API.MENU, {
                observe: 'response',
                headers
            }).pipe(
                catchError(err => {
                    if (err.status === 304) {
                        return of(err);
                    }
                    return throwError(() => err);
                })
            );

            const res = await firstValueFrom(request$);
            if (res.success) {
                const newMenuData = res.data; 
                this.menus = newMenuData.items; 
                LocalStorage.save(this.MENU_CACHE_KEY, newMenuData);
            } else {
                this.menus = []; 
            }

        } catch (err) {
            console.error("Load Menu Error", err);
            const cache = LocalStorage.load<MenuCache>(this.MENU_CACHE_KEY);
            if (cache) {
                this.menus = cache.items;
            } else {
                this.menus = [];
            }
        }
    }

    private getDefaultConfig(): AppConfig {
        return {
            version: '1.0.0',
            features: {},
            registrationRoles: []
        };
    }

    getConfig(): AppConfig | null {
        return this.config;
    }

    getMenus(): MenuItem[] {
        return this.menus;
    }
}