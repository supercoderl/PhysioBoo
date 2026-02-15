import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, delay, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../auth/auth.service';
import { BASE_API } from '../../shared/api/base';
import { USER_ERROR_CODES } from '../../shared/errors/code.component';
import { ToastService } from '../common/toast.service';
import { SKIP_ERROR_TOAST } from '../../shared/tokens/http-context.tokens';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  private readonly baseUrl = environment.API_URL;

  constructor(
    private router: Router,
    private authSrv: AuthService,
    private toastSrv: ToastService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authSrv.isAuthenticated() != null) {

    }

    if (/^https?:\/\//i.test(request.url)) {
      return next.handle(request);
    }

    const apiReq = request.clone({
      url: `${this.baseUrl}${request.url.startsWith('/') ? '' : '/'}${request.url}`,
      withCredentials: true
    });

    return next.handle(apiReq).pipe(delay(environment.DELAY_TIMES), catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        if (request.url.includes(BASE_API.PROFILE)) {
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
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authSrv.refreshToken().pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.value.access_token);
          return next.handle(this.addToken(request, res.value.access_token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
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
