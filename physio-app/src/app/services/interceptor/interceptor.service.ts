import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, delay, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { BASE_API } from '../../shared/api/base';
import { USER_ERROR_CODES } from '../../shared/errors/code.component';
import { SKIP_ERROR_TOAST } from '../../shared/tokens/http-context.tokens';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../common/toast.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  private readonly baseUrl = environment.API_URL;
  private _authSrv?: AuthService;
  private get authSrv(): AuthService {
    return this._authSrv ??= this.injector.get(AuthService);
  }

  constructor(
    private router: Router,
    private toastSrv: ToastService,
    private injector: Injector
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. External absolute URLs bypass everything
    if (/^https?:\/\//i.test(request.url)) {
      return next.handle(request);
    }

    // 2. Always rewrite to absolute API URL (including the refresh request)
    const apiReq = request.clone({
      url: `${this.baseUrl}${request.url.startsWith('/') ? '' : '/'}${request.url}`,
      withCredentials: true
    });

    // 3. The refresh/logout requests skip the 401-retry pipeline so they can't recurse
    const isAuthLifecycleUrl =
      apiReq.url.endsWith(BASE_API.REFRESHTOKEN) ||
      apiReq.url.endsWith(BASE_API.LOGOUT);
    if (isAuthLifecycleUrl) {
      return next.handle(apiReq);
    }

    // 4. Normal requests run through catchError + refresh-retry
    return next.handle(apiReq).pipe(
      delay(environment.DELAY_TIMES),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // If user was never logged in, don't even attempt to refresh — short-circuit
          if (!this.authSrv.isAuthenticated()) {
            return throwError(() => err);
          }
          return this.handle401Error(apiReq, next);
        }

        if (err.status === 304) {
          return throwError(() => err);
        }

        this.handleUnactiveUser(err);

        switch (err.status) {
          case 403:
            this.router.navigate(['exception/403']);
            break;
          case 404:
            this.router.navigate(['exception/404']);
            break;
        }

        const shouldSkipToast = request.context.get(SKIP_ERROR_TOAST);
        if (!shouldSkipToast) {
          this.handleGlobalErrorToast(err);
        }

        return throwError(() => err);
      })
    );
  }

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authSrv.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res || true);
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Wake up any queued requests so they fail fast instead of hanging
          this.refreshTokenSubject.next(false);
          // Clear local session state synchronously (don't make another HTTP call)
          this.authSrv.clearSession();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token) => {
          if (token === false) {
            return throwError(() => new Error('Session expired'));
          }
          return next.handle(request);
        })
      );
    }
  }

  private handleUnactiveUser(err: HttpErrorResponse) {
    const apiError = err.error;

    if (apiError?.detailedErrors?.length) {
      const isUnactiveUser = apiError.detailedErrors.some(
        (x: { code: string }) => USER_ERROR_CODES.includes(x.code)
      );

      if (isUnactiveUser) {
        this.router.navigate(['auth', 'verify-required']);
      }
    }
  }

  private handleGlobalErrorToast(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) return;
    const message = err.error?.message || err.message || 'An error occurred, please try again.';

    this.toastSrv.error(message);
  }
}
