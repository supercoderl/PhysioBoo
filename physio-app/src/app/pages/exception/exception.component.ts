import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { BooButtonComponent } from '@physioboo/ui';
import { AuthService } from '../../services/auth/auth.service';
import { SharedModule } from '../../shared/shared-imports';
import { canReturnTo, homeRouteFor } from '../../shared/utils/role.utils';
import { EXCEPTION_CONTENT, ExceptionCode, ExceptionContent, isExceptionCode } from './exception-content';

type RetryState = 'default' | 'retrying' | 'failed';

/**
 * Full-page error inside the client layout (design: Error Pages / ErrorPage).
 *
 * - `/exception/:code` for 404, 403, 500, 503 and `network`; any other code shows 404.
 * - `/exception/401` never shows a page: it redirects to login.
 * - The `**` route renders this component directly (`data.code = '404'`) so the typed URL is kept.
 * - `?from=/path` is the page that failed. "Try again" re-navigates there; without it, it goes home.
 */
@Component({
  selector: 'app-exception',
  standalone: true,
  imports: [BooButtonComponent, SharedModule],
  templateUrl: './exception.component.html',
})
export class ExceptionComponent implements OnInit {
  code: ExceptionCode = '404';
  content: ExceptionContent = EXCEPTION_CONTENT['404'];
  state: RetryState = 'default';
  homeLink = '/';

  private roles: string[] | null = null;
  private from: string | null = null;
  private destroyed = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authSrv = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get busy(): boolean {
    return this.state === 'retrying';
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.destroyed = true);

    this.authSrv.role$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(roles => {
        this.roles = roles;
        this.homeLink = homeRouteFor(roles);
      });

    combineLatest([this.route.paramMap, this.route.queryParamMap, this.route.data])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query, data]) => {
        const code = params.get('code') ?? data['code'];
        this.from = query.get('from');

        // A visitor who isn't signed in gets the login page, not an error page.
        if (code === '401') {
          this.router.navigate(['/auth/login'], {
            queryParams: this.from ? { returnUrl: this.from } : {},
            replaceUrl: true,
          });
          return;
        }

        this.code = isExceptionCode(code) ? code : '404';
        this.content = EXCEPTION_CONTENT[this.code];
        this.state = 'default';
      });
  }

  /**
   * Re-runs the failed route (not a hard reload). When it loads, this component is destroyed and the
   * original page appears in place; when we're still here afterwards, the retry failed.
   */
  retry(): void {
    if (this.busy) return;
    this.state = 'retrying';

    // Offline: navigating would only fail again, so report it straight away (after the spinner shows).
    if (this.code === 'network' && this.isBrowser && !navigator.onLine) {
      const timer = setTimeout(() => this.onRetryDone(), 800);
      this.destroyRef.onDestroy(() => clearTimeout(timer));
      return;
    }

    const target = canReturnTo(this.from, this.roles) ? this.from : this.homeLink;
    this.router.navigateByUrl(target).then(() => this.onRetryDone(), () => this.onRetryDone());
  }

  private onRetryDone(): void {
    if (this.destroyed) return;
    this.state = 'failed';
  }
}
