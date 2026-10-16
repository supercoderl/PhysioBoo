import { Injector, PLATFORM_ID, runInInjectionContext, signal } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, convertToParamMap, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { authGuardFn } from './auth-guard.guard';
import { AuthService } from './auth.service';
import { guestGuardFn } from './guest-guard.guard';
import { patientGuardFn } from './patient-guard.guard';
import { permissionGuard } from './permission-guard.guard';
import { superadminGuardFn } from './superadmin-guard.guard';

interface Session {
    /** null = not loaded yet; the guard then asks for the profile. */
    roles: string[] | null;
    /** What `/api/users/me` returns when asked: roles, or an error (no / expired session). */
    profile?: string[] | 'error';
    permissions?: string[];
    isAuthenticated?: boolean;
}

/** Router stand-in: guard results are compared as plain strings. */
const fakeRouter = {
    createUrlTree: (commands: string[], extras?: { queryParams?: Record<string, string> }) => {
        const query = new URLSearchParams(extras?.queryParams ?? {}).toString();
        return commands.join('/').replace('//', '/') + (query ? `?${query}` : '');
    },
    parseUrl: (url: string) => url,
};

async function runGuard(guard: CanActivateFn, session: Session, url: string, query: Record<string, string> = {}) {
    const roles$ = new BehaviorSubject<string[] | null>(session.roles);
    const perms$ = new BehaviorSubject<string[] | null>(session.roles ? session.permissions ?? [] : null);
    let profileCalls = 0;
    const auth = {
        role$: roles$.asObservable(),
        permissions$: perms$.asObservable(),
        isAuthenticated: signal(session.isAuthenticated ?? session.roles !== null),
        getProfile: () => {
            profileCalls++;
            if (session.profile === 'error' || session.profile === undefined) {
                return throwError(() => ({ status: 401 }));
            }
            roles$.next(session.profile);
            perms$.next(session.permissions ?? []);
            return of({ success: true });
        },
    };

    const injector = Injector.create({
        providers: [
            { provide: AuthService, useValue: auth },
            { provide: Router, useValue: fakeRouter },
            { provide: PLATFORM_ID, useValue: 'browser' },
        ],
    });

    const route = { queryParamMap: convertToParamMap(query) } as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    const result = runInInjectionContext(injector, () => guard(route, state));
    const value = isObservable(result) ? await firstValueFrom(result) : await result;
    return { value: value as unknown, profileCalls };
}

describe('route guards', () => {
    const guest: Session = { roles: null, profile: 'error', isAuthenticated: false };

    describe('patientGuardFn', () => {
        it('sends a guest to login and remembers the page', async () => {
            const { value } = await runGuard(patientGuardFn, guest, '/patient/profile');
            expect(value).toBe('/auth/login?returnUrl=%2Fpatient%2Fprofile');
        });

        it('lets a patient in, loading the profile on a fresh page load', async () => {
            const { value, profileCalls } = await runGuard(patientGuardFn, { roles: null, profile: ['PATIENT'] }, '/patient');
            expect(value).toBeTrue();
            expect(profileCalls).toBe(1);
        });

        it('refuses staff with 403', async () => {
            const { value } = await runGuard(patientGuardFn, { roles: ['DOCTOR'] }, '/patient');
            expect(value).toBe('/exception/403');
        });
    });

    describe('authGuardFn (/admin)', () => {
        it('refuses a patient with 403', async () => {
            const { value } = await runGuard(authGuardFn, { roles: ['PATIENT'] }, '/admin/overview/dashboard');
            expect(value).toBe('/exception/403');
        });

        it('refuses a SUPER_ADMIN without a staff role', async () => {
            const { value } = await runGuard(authGuardFn, { roles: ['SUPER_ADMIN'] }, '/admin');
            expect(value).toBe('/exception/403');
        });

        it('lets staff in', async () => {
            expect((await runGuard(authGuardFn, { roles: ['ADMIN'] }, '/admin')).value).toBeTrue();
            expect((await runGuard(authGuardFn, { roles: ['SUPER_ADMIN', 'ADMIN'] }, '/admin')).value).toBeTrue();
        });

        it('sends a guest to login', async () => {
            const { value } = await runGuard(authGuardFn, guest, '/admin/crm/patient');
            expect(value).toBe('/auth/login?returnUrl=%2Fadmin%2Fcrm%2Fpatient');
        });
    });

    describe('superadminGuardFn', () => {
        it('refuses ADMIN and PATIENT with 403', async () => {
            expect((await runGuard(superadminGuardFn, { roles: ['ADMIN'] }, '/superadmin')).value).toBe('/exception/403');
            expect((await runGuard(superadminGuardFn, { roles: ['PATIENT'] }, '/superadmin')).value).toBe('/exception/403');
        });

        it('lets SUPER_ADMIN in', async () => {
            expect((await runGuard(superadminGuardFn, { roles: ['SUPER_ADMIN'] }, '/superadmin')).value).toBeTrue();
        });
    });

    describe('permissionGuard', () => {
        const guard = permissionGuard('inpatient:bed:read');

        it('refuses staff without the permission with 403', async () => {
            const { value } = await runGuard(guard, { roles: ['NURSE'], permissions: ['crm:lead:read'] }, '/admin/inpatient/bed-map');
            expect(value).toBe('/exception/403');
        });

        it('passes staff holding the permission', async () => {
            const { value } = await runGuard(guard, { roles: ['NURSE'], permissions: ['inpatient:bed:read'] }, '/admin/inpatient/bed-map');
            expect(value).toBeTrue();
        });

        it('sends an expired session to login instead of failing the navigation', async () => {
            const { value } = await runGuard(guard, guest, '/admin/inpatient/bed-map');
            expect(value).toBe('/auth/login?returnUrl=%2Fadmin%2Finpatient%2Fbed-map');
        });
    });

    describe('guestGuardFn (/auth/login)', () => {
        it('shows the login page to a guest without asking for the profile', async () => {
            const { value, profileCalls } = await runGuard(guestGuardFn, guest, '/auth/login');
            expect(value).toBeTrue();
            expect(profileCalls).toBe(0);
        });

        it('sends a signed-in patient to the patient area', async () => {
            const { value } = await runGuard(guestGuardFn, { roles: ['PATIENT'] }, '/auth/login');
            expect(value).toBe('/patient');
        });

        it('ignores a returnUrl the role may not open', async () => {
            const { value } = await runGuard(guestGuardFn, { roles: ['PATIENT'] }, '/auth/login', { returnUrl: '/admin/system' });
            expect(value).toBe('/patient');
        });

        it('honours an allowed returnUrl', async () => {
            const { value } = await runGuard(guestGuardFn, { roles: ['PATIENT'] }, '/auth/login', { returnUrl: '/patient/security' });
            expect(value).toBe('/patient/security');
        });

        it('shows the login page when the remembered session has expired (no loop)', async () => {
            const { value } = await runGuard(guestGuardFn, { roles: null, profile: 'error', isAuthenticated: true }, '/auth/login');
            expect(value).toBeTrue();
        });
    });
});
