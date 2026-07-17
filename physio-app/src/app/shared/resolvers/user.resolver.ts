import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { take } from "rxjs/operators";
import { AuthService } from "../../services/auth/auth.service";
import { UserProfile } from "../types/core.types";

export const userResolverFn: ResolveFn<UserProfile | null> = () => {
    const authService = inject(AuthService);
    return authService.userInfo$.pipe(take(1));
};
