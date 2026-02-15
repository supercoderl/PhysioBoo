import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, lastValueFrom, of, throwError } from 'rxjs';
import { AppConfig, PagedResponse } from '../../shared/types/common';
import { LocalStorage } from '../../shared/utils/storage';
import { MenuCache, MenuItem } from '../../shared/types/menu';
import { BASE_API } from '../../shared/api/base';
import { AuthService } from '../auth/auth.service';
import { CONFIG_CACHE_KEY, MENU_CACHE_KEY } from '../../shared/data/cache';

@Injectable({ providedIn: 'root' })
export class InitService {
    private http = inject(HttpClient);
    private authSrv = inject(AuthService);

    private config: AppConfig | null = null;
    private menus: MenuItem[] = [];

    /**
     * This main function will be called at APP_INITIALIZER
     * Using Promise.all to load in parallel for faster app startup
    **/
    async load(): Promise<void> {
        await Promise.all([
            this.loadConfig(),
            this.loadMenu(),
            this.loadCurrentUser(),
        ]);
    }

    private async loadConfig(): Promise<void> {
        try {
            const cache = LocalStorage.load<AppConfig>(CONFIG_CACHE_KEY);
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

            if (res?.success) {
                const newConfig = res.data;
                this.config = newConfig;
                LocalStorage.save(CONFIG_CACHE_KEY, newConfig);
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
            const cache = LocalStorage.load<MenuCache>(MENU_CACHE_KEY);
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
                LocalStorage.save(MENU_CACHE_KEY, newMenuData);
            } else {
                this.menus = [];
            }

        } catch (err) {
            console.error("Load Menu Error", err);
            const cache = LocalStorage.load<MenuCache>(MENU_CACHE_KEY);
            if (cache) {
                this.menus = cache.items;
            } else {
                this.menus = [];
            }
        }
    }

    private async loadCurrentUser() {
        try {
            await lastValueFrom(this.authSrv.getProfile());
        } catch (error) {
            console.log('Người dùng chưa đăng nhập hoặc phiên đã hết hạn.');
        }
    }

    private getDefaultConfig(): AppConfig {
        return {
            version: '1.0.0',
            features: {},
            registrationRoles: [],
            languages: []
        };
    }

    getConfig(): AppConfig | null {
        return this.config;
    }

    getMenus(): MenuItem[] {
        return this.menus;
    }
}