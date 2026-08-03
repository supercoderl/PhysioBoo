import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, firstValueFrom, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { createHttpContext } from '../../shared/contexts/option.context';
import { MENU_CACHE_KEY, USER_DATA } from '../../shared/data/cache';
import { PagedResponse, PaginationData, PaginationDataWithInit } from '../../shared/types/common';
import { UserProfileBase, UserProfileSummary } from '../../shared/types/core.types';
import { LoadingKeys } from '../../shared/types/loading';
import { MenuItem } from '../../shared/types/menu.types';
import { LocalStorage } from '../../shared/utils/storage';
import { MenuService } from '../admin/menu.service';
import { PreferenceService } from '../common/preference.service';
import { ThemeConfigService } from '../common/theme-config.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // #region Inputs, Outputs, Properties
    /** null = profile not fetched yet; [] = fetched, user genuinely has none. */
    private permissionsSubject = new BehaviorSubject<string[] | null>(null);
    private userInfoSubject = new BehaviorSubject<UserProfileBase | null>(null);
    private roleSubject = new BehaviorSubject<string[] | null>(null);
    private oauthService = inject(SocialAuthService);
    private prefSrv = inject(PreferenceService);
    private themeSrv = inject(ThemeConfigService);
    private menuSrv = inject(MenuService);

    isAuthenticated = signal(false);
    public permissions$ = this.permissionsSubject.asObservable();
    public userInfo$ = this.userInfoSubject.asObservable();
    public role$ = this.roleSubject.asObservable();
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

    login<T>(body: { identifier: string, password: string, otp: string }): Observable<PagedResponse<UserProfileSummary>> {
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
        this.permissionsSubject.next(null);
        this.roleSubject.next(null);
        this.isAuthenticated.set(false);
        LocalStorage.remove(MENU_CACHE_KEY);
    }

    getProfile() {
        return this.http.get<PagedResponse<UserProfileSummary>>(BASE_API.PROFILE).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    const { roles, permissions, ...userInfo } = res.data;
                    this.userInfoSubject.next(userInfo);
                    this.roleSubject.next(roles);
                    this.permissionsSubject.next(permissions);
                    this.isAuthenticated.set(true);
                } else {
                    this.checkSession();
                }
            }),
            switchMap((res) => {
                if (!res.success || !res.data) return [res];
                return forkJoin([
                    this.prefSrv.loadAll(),
                    this.menuSrv.getMine(),
                ]).pipe(
                    tap(([, menuRes]) => {
                        this.themeSrv.hydrateFromCache();
                        this.cacheMenus(menuRes.success ? menuRes.data : []);
                    }),
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

    private cacheMenus(items: MenuItem[]): void {
        const cache: PaginationData<MenuItem> = {
            ...PaginationDataWithInit<MenuItem>(),
            items,
            totalCount: items.length
        };
        LocalStorage.save(MENU_CACHE_KEY, cache);
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

    hasPermission(code: string): boolean {
        return (this.permissionsSubject.getValue() ?? []).includes(code);
    }

    hasAnyPermission(codes: string[]): boolean {
        const current = this.permissionsSubject.getValue() ?? [];
        return codes.some(c => current.includes(c));
    }
}
