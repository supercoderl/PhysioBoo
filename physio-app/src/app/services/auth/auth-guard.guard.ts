import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { Role } from '../../shared/enums/role';
import { AuthService } from './auth.service';

export const authGuardFn: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    return authService.role$.pipe(
        take(1),
        switchMap(role => role !== null ? of(role) : authService.getProfile().pipe(
            switchMap(() => authService.role$),
            take(1)
        )),
        map(roles => {
            if (!roles) return router.createUrlTree(['/auth/login']);
            const isStaff = roles.some(r => r != Role.SUPER_ADMIN && Object.values(Role).includes(r as Role));
            return isStaff ? true : router.createUrlTree(['/exception/403']);
        }),
        catchError(() => of(router.createUrlTree(['/auth/login'])))
    );
};