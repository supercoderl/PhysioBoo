/**
 * Adapted from physio-app/src/app/services/interceptor/interceptor.service.ts.
 * Reused as-is: base-URL rewrite, withCredentials cookie auth, the 401 -> refresh -> retry pipeline,
 * request queuing while a refresh is in flight, and the global error toast. Rewritten as a functional
 * HttpInterceptorFn (Angular 17 standalone style, matching this project's app.config.ts) instead of the
 * web app's class-based HTTP_INTERCEPTORS. Desktop-only behavior dropped: routing to /exception/403,
 * /exception/404, and /auth/verify-required (mobile has no such routes in this sub-project;
 * 403/404 are handled by the calling screen's own error/empty state instead).
 */
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BASE_API } from '../../shared/api/base';
import { SKIP_ERROR_TOAST } from '../../shared/contexts/option.context';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../common/toast.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const injector = inject(Injector);
    const router = inject(Router);
    const toastSrv = inject(ToastService);
    const baseUrl = environment.API_URL;

    if (/^https?:\/\//i.test(request.url)) {
        return next(request);
    }

    const apiReq = request.clone({
        url: `${baseUrl}${request.url.startsWith('/') ? '' : '/'}${request.url}`,
        withCredentials: true,
    });

    const isAuthLifecycleUrl = apiReq.url.endsWith(BASE_API.REFRESHTOKEN) || apiReq.url.endsWith(BASE_API.LOGOUT);
    if (isAuthLifecycleUrl) {
        return next(apiReq);
    }

    const authSrv = () => injector.get(AuthService);

    return next(apiReq).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                if (!authSrv().isAuthenticated()) {
                    return throwError(() => err);
                }
                return handle401(apiReq, next, authSrv, router);
            }

            if (err.status === 304) {
                return throwError(() => err);
            }

            const shouldSkipToast = request.context.get(SKIP_ERROR_TOAST);
            if (!shouldSkipToast && err.status !== 403) {
                const message = (err.error as any)?.message || err.message || 'An error occurred, please try again.';
                toastSrv.error(message);
            }

            return throwError(() => err);
        })
    );
};

function handle401(request: Parameters<HttpInterceptorFn>[0], next: Parameters<HttpInterceptorFn>[1], authSrv: () => AuthService, router: Router) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authSrv().refreshToken().pipe(
            switchMap((res: any) => {
                isRefreshing = false;
                refreshTokenSubject.next(res || true);
                return next(request);
            }),
            catchError((error) => {
                isRefreshing = false;
                refreshTokenSubject.next(false);
                authSrv().clearSession();
                router.navigate(['/auth/login']);
                return throwError(() => error);
            })
        );
    }

    return refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token) => {
            if (token === false) {
                return throwError(() => new Error('Session expired'));
            }
            return next(request);
        })
    );
}
