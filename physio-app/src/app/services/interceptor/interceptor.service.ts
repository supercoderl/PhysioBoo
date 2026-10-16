import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, delay, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { BASE_API } from '../../shared/api/base';
import { SKIP_ERROR_TOAST } from '../../shared/contexts/option.context';
import { USER_ERROR_CODES } from '../../shared/errors/code.component';
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
    // 1. External absolute URLs and the app's own static assets bypass everything
    if (/^https?:\/\//i.test(request.url) || /^\/?assets\//i.test(request.url)) {
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
          // A guest never had a session: don't attempt a refresh. The profile request is the exception —
          // after a reload the access token may have expired while the refresh cookie is still valid.
          if (!this.authSrv.isAuthenticated() && !this.isProfileRequest(apiReq)) {
            return throwError(() => err);
          }
          return this.handle401Error(apiReq, next);
        }

        if (err.status === 304) {
          return throwError(() => err);
        }

        this.handleUnactiveUser(err);

        // API 403/404 stay on the current page (a single denied or missing lookup must not replace the
        // whole screen); page-level 403/404 are handled by the route guards and the `**` route.
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
          this.redirectToLogin(request);
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

  /**
   * Session expired mid-use: back to login, returning to the current page afterwards.
   * The profile request is left to its caller (route guards build the login redirect themselves),
   * and nothing happens when the user is already on an auth page, so this can't loop.
   */
  private redirectToLogin(request: HttpRequest<any>) {
    if (this.isProfileRequest(request)) return;

    const current = this.router.url;
    if (current.startsWith('/auth')) return;

    this.router.navigate(['/auth/login'], {
      queryParams: current && current !== '/' ? { returnUrl: current } : {}
    });
  }

  private isProfileRequest(request: HttpRequest<any>): boolean {
    return request.url.endsWith(BASE_API.PROFILE);
  }

  private lastToast = { message: '', at: 0 };

  private handleGlobalErrorToast(err: HttpErrorResponse) {
    if (err.status === 401) return;

    let message: string;
    if (err.status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (err.status === 0 || err.status >= 500) {
      // Never surface server internals (stack traces, URLs) to the user.
      message = 'An error occurred, please try again.';
    } else {
      // 4xx bodies are ResponseMessage: `errors` holds the domain/validation messages meant for the user.
      message = err.error?.message || err.error?.errors?.[0] || 'An error occurred, please try again.';
    }

    // Parallel requests failing the same way show one toast, not one per request.
    const now = Date.now();
    if (message === this.lastToast.message && now - this.lastToast.at < 3000) return;
    this.lastToast = { message, at: now };

    this.toastSrv.error(message);
  }
}
