import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, firstValueFrom, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { createHttpContext } from '../../shared/contexts/option.context';
import { USER_DATA } from '../../shared/data/cache';
import { PagedResponse } from '../../shared/types/common';
import { UserProfile } from '../../shared/types/core.types';
import { LoadingKeys } from '../../shared/types/loading';
import { LocalStorage } from '../../shared/utils/storage';
import { PreferenceService } from '../common/preference.service';
import { ThemeConfigService } from '../common/theme-config.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // #region Inputs, Outputs, Properties
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    private userInfoSubject = new BehaviorSubject<UserProfile | null>(null);
    private oauthService = inject(SocialAuthService);
    private prefSrv = inject(PreferenceService);
    private themeSrv = inject(ThemeConfigService);

    isAuthenticated = signal(false);
    permissions$ = this.permissionsSubject.asObservable();
    public userInfo$ = this.userInfoSubject.asObservable();
    // #endregion

    constructor(
        private http: HttpClient,
    ) { }

    async checkSession(): Promise<void> {
        try {
            const res = await firstValueFrom(this.http.get<PagedResponse<boolean>>(BASE_API.USER.CHECK_AUTH));
            this.isAuthenticated.set(!!res.data);
        } catch {
            this.isAuthenticated.set(false);
        }
    }

    login<T>(body: { identifier: string, password: string, otp: string }): Observable<PagedResponse<UserProfile>> {
        return this.http.post(BASE_API.LOGIN, body, {
            context: createHttpContext({
                loadingKey: LoadingKeys.USER.LOGIN.CREDENTIAL
            })
        }).pipe(
            switchMap(() => this.getProfile()),
            catchError(err => {
                console.error('Login failed:', err);
                return throwError(() => err);
            })
        );
    }

    oauthLogin<T>(token: string, provider: string): Observable<PagedResponse<T>> {
        return this.http.post<PagedResponse<T>>(BASE_API.OAUTHLOGIN, {
            token,
            provider
        }).pipe(
            switchMap(res => {
                if (!res.success) {
                    return throwError(() => res);
                }
                return this.getProfile().pipe(
                    map(() => res)
                );
            })
        );
    }

    logout() {
        return this.http.post<PagedResponse<string>>(BASE_API.LOGOUT, null).pipe(
            finalize(() => this.clearSession())
        );
    }

    /** Clear local session state without making an HTTP call. Safe to call from interceptor. */
    clearSession(): void {
        this.userInfoSubject.next(null);
        this.permissionsSubject.next([]);
        this.isAuthenticated.set(false);
    }

    getProfile() {
        return this.http.get<PagedResponse<UserProfile>>(BASE_API.PROFILE).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.userInfoSubject.next(res.data);
                    this.isAuthenticated.set(true);
                } else {
                    this.checkSession();
                }
            }),
            switchMap((res) => {
                if (!res.success || !res.data) return [res];
                return forkJoin([
                    this.prefSrv.loadAll(),
                    // this.fetchPermissions(),
                ]).pipe(
                    tap(() => this.themeSrv.hydrateFromCache()),
                    map(() => res),
                    catchError(() => {
                        this.themeSrv.hydrateFromCache();
                        return [res];
                    })
                );
            }),
            catchError((err) => {
                this.clearSession();
                return throwError(() => err);
            })
        );
    }

    getUserData() {
        this.http.get(BASE_API.USER.GET_USER_DATA).subscribe({
            next: res => {
                LocalStorage.save(USER_DATA, res);
            }
        })
    }

    /** Fetches permission codes and caches them in permissionsSubject; used both standalone and as part of getProfile(). */
    private fetchPermissions() {
        return this.http.get<any>(`/api/users/user-permission`).pipe(
            tap((permissions) => this.permissionsSubject.next(permissions.value.permission_code)),
            catchError(() => {
                this.permissionsSubject.next([]);
                return of(null);
            })
        );
    }

    loadPermissions() {
        this.fetchPermissions().subscribe();
    }

    getPermissions() {
        return this.permissionsSubject.getValue();
    }

    refreshToken() {
        return this.http.post<any>(BASE_API.REFRESHTOKEN, {});
    }

    forgotPassword(body: any): Observable<any> {
        return this.http.post(BASE_API.FORGOTPASSWORD, body);
    }
}
