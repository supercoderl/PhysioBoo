import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { canReturnTo, homeRouteFor } from '../../shared/utils/role.utils';
import { AuthService } from './auth.service';
import { currentRoles$ } from './role-guard';

/**
 * Login page: a user who is already signed in goes straight to their area (or the allowed returnUrl)
 * instead of seeing the form again. Guests and expired sessions see the login page.
 */
export const guestGuardFn: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return true;
    }

    // Nothing suggests a session: skip the profile request for plain guests.
    if (!authService.isAuthenticated()) {
        return true;
    }

    return currentRoles$(authService).pipe(
        map(roles => {
            if (!roles) return true;
            const returnUrl = route.queryParamMap.get('returnUrl');
            return router.parseUrl(canReturnTo(returnUrl, roles) ? returnUrl : homeRouteFor(roles));
        }),
        catchError(() => of(true))
    );
};
