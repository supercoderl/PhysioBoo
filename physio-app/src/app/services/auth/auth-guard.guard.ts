import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class authGuardGuard {
    constructor(private authService: AuthService, private router: Router) { }
    
    canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
        if (this.authService.isAuthenticated() == false) {
            this.router.navigate(['login']);
            return false;
        }
        return true;
    }
}