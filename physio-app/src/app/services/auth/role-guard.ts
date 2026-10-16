import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';

/** Roles of the signed-in user, loading the profile once if it isn't known yet. Errors mean "no session". */
export function currentRoles$(authService: AuthService): Observable<string[] | null> {
    return authService.role$.pipe(
        take(1),
        switchMap(roles => roles !== null ? of(roles) : authService.getProfile().pipe(
            switchMap(() => authService.role$),
            take(1)
        ))
    );
}

/** `/auth/login?returnUrl=…` so the user comes back to the page they asked for once signed in. */
export function loginUrlTree(router: Router, returnUrl: string): UrlTree {
    return router.createUrlTree(['/auth/login'], { queryParams: returnUrl && returnUrl !== '/' ? { returnUrl } : {} });
}

/**
 * Guard factory for an application area:
 * - no session            → login (with returnUrl)
 * - session, wrong role   → 403
 * - session, allowed role → pass
 * SSR always passes; the browser re-runs the guard after hydration with the real session.
 */
export function createRoleGuard(allow: (roles: string[]) => boolean): CanActivateFn {
    return (_route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!isPlatformBrowser(inject(PLATFORM_ID))) {
            return true;
        }

        return currentRoles$(authService).pipe(
            map(roles => {
                if (!roles) return loginUrlTree(router, state.url);
                return allow(roles) ? true : router.createUrlTree(['/exception/403']);
            }),
            catchError(() => of(loginUrlTree(router, state.url)))
        );
    };
}
