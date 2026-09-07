/**
 * Adapted from physio-app/src/app/services/auth/auth-guard.guard.ts.
 * Web's guard is staff-only (blocks PATIENT). Mobile's Foundation+Guest+Patient sub-project is the
 * mirror image: it protects the Patient shell and requires the PATIENT role (or another role this
 * mobile app already supports, see MOBILE_SUPPORTED_ROLES) — everything else redirects to a
 * "not available on mobile yet" notice rather than the desktop app's /exception/403.
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';
import { MOBILE_SUPPORTED_ROLES, Role } from '../../shared/enums/role';

export const authGuardFn: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.role$.pipe(
        take(1),
        switchMap(role => role !== null ? of(role) : authService.getProfile().pipe(
            switchMap(() => authService.role$),
            take(1)
        )),
        map(roles => {
            if (!roles) return router.createUrlTree(['/auth/login']);

            const isSupported = roles.some(r => MOBILE_SUPPORTED_ROLES.includes(r as Role));
            return isSupported ? true : router.createUrlTree(['/unsupported-role']);
        }),
        catchError(() => of(router.createUrlTree(['/auth/login'])))
    );
};
