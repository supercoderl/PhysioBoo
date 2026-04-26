import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { Role } from '../../shared/enums/role';
import { AuthService } from './auth.service';

export const superadminGuardFn: CanActivateFn = () => {
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
        map(user => {
            if (!user) return router.createUrlTree(['/auth/login']);
            return user.roles?.some(code => code === Role[Role.SUPER_ADMIN]) ? true : router.createUrlTree(['/exception/403']);
        })
    );
};
