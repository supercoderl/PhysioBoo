import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private http: HttpClient
    ) { }

    public isAuthenticated(): boolean {
        return true;
    }

    url = environment.API_URL;
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    permissions$ = this.permissionsSubject.asObservable();

    login(path: string, body: any): Observable<any> {
        return this.http.post(this.url + path, body);
    }

    logout(path: string) {
        window.location.replace('');
        return this.http.post(this.url + path, null);
    }

    loadPermissions() {
        this.http.get<any>(this.url + 'user-permission').subscribe((permissions) => {
            this.permissionsSubject.next(permissions.value.permission_code);
        });
    }

    getPermissions() {
        return this.permissionsSubject.getValue();
    }

    refreshToken() {
        return this.http.post<any>(this.url + "get-token", {});
    }

    forgotPassword(body: any): Observable<any> {
        return this.http.post(this.url + 'send-reset-password-email', body);
    }
}
