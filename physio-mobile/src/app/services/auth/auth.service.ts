import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, switchMap, tap, throwError } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { createHttpContext } from '../../shared/contexts/option.context';
import { PagedResponse } from '../../shared/types/common';
import { UserProfileBase, UserProfileSummary } from '../../shared/types/core.types';
import { LoadingKeys } from '../../shared/types/loading';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    /** null = profile not fetched yet; [] = fetched, user genuinely has none. */
    private permissionsSubject = new BehaviorSubject<string[] | null>(null);
    private userInfoSubject = new BehaviorSubject<UserProfileBase | null>(null);
    private roleSubject = new BehaviorSubject<string[] | null>(null);
    private patientIdSubject = new BehaviorSubject<string | null>(null);
    private authenticatedSubject = new BehaviorSubject<boolean>(false);

    public permissions$ = this.permissionsSubject.asObservable();
    public userInfo$ = this.userInfoSubject.asObservable();
    public role$ = this.roleSubject.asObservable();
    /** The current user's own Patient.id, when they hold the PATIENT role — used for self-scoped record calls. */
    public patientId$ = this.patientIdSubject.asObservable();
    public isAuthenticated$ = this.authenticatedSubject.asObservable();

    constructor(private http: HttpClient) { }

    isAuthenticated(): boolean {
        return this.authenticatedSubject.getValue();
    }

    async checkSession(): Promise<void> {
        try {
            const res = await this.http.get<PagedResponse<boolean>>(BASE_API.USER.CHECK_AUTH).toPromise();
            this.authenticatedSubject.next(!!res?.data);
        } catch {
            this.authenticatedSubject.next(false);
        }
    }

    login(body: { identifier: string; password: string; otp?: string }): Observable<PagedResponse<UserProfileSummary>> {
        return this.http.post(BASE_API.LOGIN, body, {
            context: createHttpContext({ loadingKey: LoadingKeys.USER.LOGIN.CREDENTIAL })
        }).pipe(
            switchMap(() => this.getProfile()),
            catchError(err => throwError(() => err))
        );
    }

    register(body: any): Observable<PagedResponse<any>> {
        return this.http.post<PagedResponse<any>>(BASE_API.REGISTER, body, {
            context: createHttpContext({ loadingKey: LoadingKeys.USER.REGISTER })
        });
    }

    logout() {
        return this.http.post<PagedResponse<string>>(BASE_API.LOGOUT, null).pipe(
            finalize(() => this.clearSession())
        );
    }

    /** Clear local session state without making an HTTP call. Safe to call from the interceptor. */
    clearSession(): void {
        this.userInfoSubject.next(null);
        this.permissionsSubject.next(null);
        this.roleSubject.next(null);
        this.patientIdSubject.next(null);
        this.authenticatedSubject.next(false);
    }

    getProfile(): Observable<PagedResponse<UserProfileSummary>> {
        return this.http.get<PagedResponse<UserProfileSummary>>(BASE_API.PROFILE).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    const { roles, permissions, patient, ...userInfo } = res.data;
                    this.userInfoSubject.next(userInfo);
                    this.roleSubject.next(roles);
                    this.permissionsSubject.next(permissions);
                    this.patientIdSubject.next(patient?.id ?? null);
                    this.authenticatedSubject.next(true);
                } else {
                    this.checkSession();
                }
            }),
            catchError((err) => {
                this.clearSession();
                return throwError(() => err);
            })
        );
    }

    refreshToken() {
        return this.http.post<any>(BASE_API.REFRESHTOKEN, {});
    }

    forgotPassword(body: { identifier: string }): Observable<any> {
        return this.http.post(BASE_API.FORGOTPASSWORD, body);
    }

    resetPassword(body: { token: string; newPassword: string }): Observable<any> {
        return this.http.post(BASE_API.RESETPASSWORD, body);
    }

    hasPermission(code: string): boolean {
        return (this.permissionsSubject.getValue() ?? []).includes(code);
    }

    hasAnyPermission(codes: string[]): boolean {
        const current = this.permissionsSubject.getValue() ?? [];
        return codes.some(c => current.includes(c));
    }

    getPatientId(): string | null {
        return this.patientIdSubject.getValue();
    }
}
