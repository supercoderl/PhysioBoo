import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, switchMap, take } from 'rxjs';
import { Role } from '../../shared/enums/role';
import { AuthService } from './auth.service';

const STAFF_ROLES = [
    Role[Role.SUPER_ADMIN],
    Role[Role.ADMIN],
    Role[Role.NURSE],
    Role[Role.DOCTOR],
    Role[Role.PHAMACIST],
    Role[Role.CASHIER],
    Role[Role.LAB_TECHNICIAN],
    Role[Role.RADIOLOGIST],
    Role[Role.RECEPTIONIST],
    Role[Role.ACCOUNTANT],
    Role[Role.INVENTORY_MANAGER],
    Role[Role.IT_SUPPORT],
];

export const authGuardFn: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/auth/login']);
    }

    return authService.userInfo$.pipe(
        take(1),
        switchMap(user => user ? of(user) : authService.getProfile().pipe(
            switchMap(() => authService.userInfo$),
            take(1)
        )),
        map(user => {
            if (!user) return router.createUrlTree(['/auth/login']);
            const isStaff = user.roles?.some(r => STAFF_ROLES.includes(r));
            return isStaff ? true : router.createUrlTree(['/exception/403']);
        })
    );
};