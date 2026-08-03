import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map, of, switchMap, take } from "rxjs";
import { AuthService } from "./auth.service";

export const permissionGuard = (code: string): CanActivateFn => {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        return auth.permissions$.pipe(
            take(1),
            switchMap(perms => perms !== null ? of(perms) : auth.getProfile().pipe(
                switchMap(() => auth.permissions$),
                take(1)
            )),
            map(perms => {
                if ((perms ?? []).includes(code)) return true;
                return router.createUrlTree(['/exception/403']);
            })
        )
    }
}