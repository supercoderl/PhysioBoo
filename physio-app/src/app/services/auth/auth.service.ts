import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { PagedResponse } from '../../shared/types/common';
import { UserProfile } from '../../shared/types/core';
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

    permissions$ = this.permissionsSubject.asObservable();
    public userInfo$ = this.userInfoSubject.asObservable();
    // #endregion

    constructor(
        private http: HttpClient,
    ) { }

    public isAuthenticated(): boolean {
        const status = LocalStorage.load('is_logged_in');
        return status === true || status === 'true';
    }

    login<T>(body: { identifier: string, password: string, otp: string }): Observable<PagedResponse<UserProfile>> {
        return this.http.post(BASE_API.LOGIN, body).pipe(
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
        LocalStorage.remove('is_logged_in');
    }

    getProfile() {
        return this.http.get<PagedResponse<UserProfile>>(BASE_API.PROFILE).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.userInfoSubject.next(res.data);
                    LocalStorage.save('is_logged_in', 'true');
                } else {
                    LocalStorage.remove('is_logged_in');
                }
            }),
            switchMap((res) => {
                if (!res.success || !res.data) return [res];
                return this.prefSrv.loadAll().pipe(
                    tap(() => this.themeSrv.hydrateFromCache()),
                    map(() => res),
                    catchError(() => {
                        this.themeSrv.hydrateFromCache();
                        return [res];
                    })
                );
            }),
            catchError((err) => {
                LocalStorage.remove('is_logged_in');
                return throwError(() => err);
            })
        );
    }

    loadPermissions() {
        this.http.get<any>(`/api/users/user-permission`).subscribe((permissions) => {
            this.permissionsSubject.next(permissions.value.permission_code);
        });
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
