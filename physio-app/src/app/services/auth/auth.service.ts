import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, finalize, firstValueFrom, forkJoin, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { createHttpContext } from '../../shared/contexts/option.context';
import { PagedResponse } from '../../shared/types/common';
import { UserProfileBase, UserProfileSummary } from '../../shared/types/core.types';
import { LoadingKeys } from '../../shared/types/loading';
import { MenuItem } from '../../shared/types/menu.types';
import { MenuService } from '../admin/menu.service';
import { PreferenceService } from '../common/preference.service';
import { ThemeConfigService } from '../common/theme-config.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // #region Inputs, Outputs, Properties
    private permissionsSubject = new BehaviorSubject<string[] | null>(null);
    private profile$: Observable<PagedResponse<UserProfileSummary>> | null = null;
    private userInfoSubject = new BehaviorSubject<UserProfileBase | null>(null);
    private roleSubject = new BehaviorSubject<string[] | null>(null);
    private oauthService = inject(SocialAuthService);
    private prefSrv = inject(PreferenceService);
    private themeSrv = inject(ThemeConfigService);
    private menuSrv = inject(MenuService);
    private router = inject(Router);

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

    /**
     * User-initiated sign-out from any area. The local session is cleared before leaving, so the login
     * page's guest guard doesn't send the user straight back; the server-side logout runs afterwards.
     */
    signOut(): void {
        this.oauthService.signOut().catch(() => { });
        this.clearSession();
        this.router.navigate(['/auth/login']).then(() => {
            this.logout().subscribe({ error: () => { } });
        });
    }

    clearSession(): void {
        this.userInfoSubject.next(null);
        this.permissionsSubject.next(null);
        this.roleSubject.next(null);
        this.isAuthenticated.set(false);
        this.profile$ = null;
        this.menuSrv.clear();
    }

    getProfile(): Observable<PagedResponse<UserProfileSummary>> {
        if (this.profile$) return this.profile$;

        this.profile$ = this.http.get<PagedResponse<UserProfileSummary>>(BASE_API.PROFILE).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    const { roles, permissions, ...userInfo } = res.data;
                    this.userInfoSubject.next(userInfo);
                    this.roleSubject.next(roles);
                    this.permissionsSubject.next(permissions);
                    this.isAuthenticated.set(true);
                    this.loadPostLoginData();
                } else {
                    this.checkSession();
                }
            }),
            catchError((err) => {
                this.clearSession();
                return throwError(() => err);
            }),
            finalize(() => {
                this.profile$ = null;
            }),
            shareReplay(1)
        );

        return this.profile$;
    }

    /** Reflects an edit of the signed-in user's own details (Settings > Account) without reloading the session. */
    patchUserInfo(changes: Partial<UserProfileBase>): void {
        const current = this.userInfoSubject.getValue();
        if (current) this.userInfoSubject.next({ ...current, ...changes });
    }

    private loadPostLoginData(): void {
        // The theme is applied once the preferences arrive. Applying it earlier would read an empty cache,
        // fall back to light and strip the `dark` class that ThemeService.initTheme() set for first paint.
        forkJoin([
            this.prefSrv.loadAll(),
            this.menuSrv.getMine(),
        ]).pipe(
            catchError(() => of(null))
        ).subscribe((result) => {
            if (!result) {
                this.menuSrv.markLoaded();
                return;
            }
            const [, menuRes] = result;
            this.themeSrv.hydrateFromCache();
            this.cacheMenus(menuRes.success ? menuRes.data : []);
        });
    }

    private cacheMenus(items: MenuItem[]): void {
        this.menuSrv.publish(items);
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

    /** 204 on success; an invalid/expired token or a weak password comes back as an HTTP error. */
    resetPassword(token: string, newPassword: string): Observable<void> {
        return this.http.post<void>(BASE_API.RESETPASSWORD, { token, newPassword }, {
            context: createHttpContext({
                loadingKey: LoadingKeys.USER.RESET_PASSWORD,
                skipErrorToast: true
            })
        });
    }

    hasPermission(code: string): boolean {
        return (this.permissionsSubject.getValue() ?? []).includes(code);
    }

    hasAnyPermission(codes: string[]): boolean {
        const current = this.permissionsSubject.getValue() ?? [];
        return codes.some(c => current.includes(c));
    }
}
