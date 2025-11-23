import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';
import { AppConfig, PagedResponse } from '../../shared/types/common';
import { LocalStorage } from '../../shared/utils/storage';

@Injectable({ providedIn: 'root' })
export class InitService {
    private http = inject(HttpClient);

    private config: AppConfig | null = null;
    private readonly CACHE_KEY = "config_data";

    async load(): Promise<void> {
        try {
            const cache = LocalStorage.load<AppConfig>(this.CACHE_KEY);
            const cachedVersion = cache?.version;

            let headers: any = {};
            if (cachedVersion) {
                headers['If-None-Match'] = `"${cachedVersion}"`;
            }

            const versionResp = await firstValueFrom(
                this.http.post('/api/config/version', null, {
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
                this.http.post<PagedResponse<AppConfig>>('/api/config', null, {
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
}