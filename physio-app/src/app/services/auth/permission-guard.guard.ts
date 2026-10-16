import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of, switchMap, take } from "rxjs";
import { AuthService } from "./auth.service";
import { loginUrlTree } from "./role-guard";

export const permissionGuard = (code: string): CanActivateFn => {
    return (_route, state) => {
        const auth = inject(AuthService);
        const router = inject(Router);

        return auth.permissions$.pipe(
            take(1),
            switchMap(perms => perms !== null ? of(perms) : auth.getProfile().pipe(
                switchMap(() => auth.permissions$),
                take(1)
            )),
            map(perms => {
                if (perms === null) return loginUrlTree(router, state.url);
                if (perms.includes(code)) return true;
                return router.createUrlTree(['/exception/403']);
            }),
            catchError(() => of(loginUrlTree(router, state.url)))
        )
    }
}
