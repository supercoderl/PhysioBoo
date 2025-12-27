import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard {
    constructor(
        private authService: AuthService, 
        private router: Router
    ) { }
    
    canActivate = (
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
        console.log(this.authService.isAuthenticated());
        if (this.authService.isAuthenticated() == false) {
            return this.router.createUrlTree(['/auth/login']);
        }
        return true;
    }
}