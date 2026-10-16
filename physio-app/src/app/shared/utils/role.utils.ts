import { Role } from "../enums/role";

/**
 * Role checks shared by the route guards, the login redirect and the layouts.
 * Roles always come from `/api/users/me` (server-side identity); never from client input.
 *
 * - Staff (tenant workspace `/admin`): any known role except SUPER_ADMIN and PATIENT.
 *   SUPER_ADMIN is a platform identity, so it only reaches `/admin` when it also holds a staff role.
 * - Super Admin (`/superadmin`): SUPER_ADMIN.
 * - Patient (`/patient`): PATIENT.
 */
export const STAFF_ROLES: readonly string[] = Object.values(Role)
    .filter(r => r !== Role.SUPER_ADMIN && r !== Role.PATIENT);

export const ROLE_HOME = {
    SUPER_ADMIN: '/superadmin',
    STAFF: '/admin',
    PATIENT: '/patient',
    GUEST: '/',
} as const;

export function isStaff(roles: readonly string[] | null | undefined): boolean {
    return (roles ?? []).some(r => STAFF_ROLES.includes(r));
}

export function isSuperAdmin(roles: readonly string[] | null | undefined): boolean {
    return (roles ?? []).includes(Role.SUPER_ADMIN);
}

export function isPatient(roles: readonly string[] | null | undefined): boolean {
    return (roles ?? []).includes(Role.PATIENT);
}

/** Landing route after login. A user holding several roles goes to the most privileged area. */
export function homeRouteFor(roles: readonly string[] | null | undefined): string {
    if (isSuperAdmin(roles)) return ROLE_HOME.SUPER_ADMIN;
    if (isStaff(roles)) return ROLE_HOME.STAFF;
    if (isPatient(roles)) return ROLE_HOME.PATIENT;
    return ROLE_HOME.GUEST;
}

/**
 * Whether a `returnUrl` may be honoured after login for these roles.
 * Only same-origin paths are accepted (no `//host` or `scheme:`), auth/exception pages are never
 * a destination, and protected areas require the matching role so login never lands on a 403.
 */
export function canReturnTo(url: string | null | undefined, roles: readonly string[] | null | undefined): url is string {
    if (!url || !url.startsWith('/') || url.startsWith('//') || url.includes('\\') || /^\/[^/?#]*:/.test(url)) {
        return false;
    }

    const path = url.split(/[?#]/)[0];
    const inArea = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

    if (inArea('/auth') || inArea('/exception')) return false;
    if (inArea(ROLE_HOME.SUPER_ADMIN)) return isSuperAdmin(roles);
    if (inArea(ROLE_HOME.STAFF)) return isStaff(roles);
    if (inArea(ROLE_HOME.PATIENT)) return isPatient(roles);
    return true;
}
