import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { SKIP_ERROR_TOAST } from '../../shared/contexts/option.context';
import { SERVER_HAS_NOT_RESPONSED } from '../../shared/constants/error.constant';
import { CONFIG_CACHE_KEY } from '../../shared/data/cache';
import { AppConfig, PagedResponse } from '../../shared/types/common';
import { LocalStorage } from '../../shared/utils/storage';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class InitService {
    private http = inject(HttpClient);
    private authSrv = inject(AuthService);
    private loggerSrv = inject(LoggerService);

    private config: AppConfig | null = null;

    /**
     * This main function will be called at APP_INITIALIZER
     * Using Promise.all to load in parallel for faster app startup
    **/
    async load(): Promise<void> {
        try {
            const session = this.authSrv.checkSession();
            await Promise.all([
                session,
                this.loadConfig(session),
            ]);
        } catch (err) {
            console.log(this.loggerSrv.error(SERVER_HAS_NOT_RESPONSED, err));
        }
    }

    /**
     * `api/config` needs the system:config:read permission, so it is only requested once the session check says
     * someone is signed in: anonymous visitors of the public site would always get a 401 for it. The anonymous
     * version check still runs in parallel with the session check.
     */
    private async loadConfig(session: Promise<void>): Promise<void> {
        try {
            const cache = LocalStorage.load<AppConfig>(CONFIG_CACHE_KEY);
            const cachedVersion = cache?.version;

            let headers = new HttpHeaders();
            if (cachedVersion) {
                headers = headers.set('If-None-Match', `"${cachedVersion}"`);
            }

            const versionResp = await firstValueFrom(
                this.http.get(BASE_API.VERSION, {
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

            await session;
            if (!this.authSrv.isAuthenticated()) {
                this.config = cache ?? this.getDefaultConfig();
                return;
            }

            // A signed-in user without the permission (e.g. a patient) gets a 403: fall back quietly, no toast.
            const res = await firstValueFrom(
                this.http.get<PagedResponse<AppConfig>>(BASE_API.CONFIG, {
                    headers: { 'X-Global-Loading': 'true' },
                    context: new HttpContext().set(SKIP_ERROR_TOAST, true)
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
            this.config = this.getDefaultConfig();
            throwError;
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
}