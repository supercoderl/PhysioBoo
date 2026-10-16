import { canReturnTo, homeRouteFor, isPatient, isStaff, isSuperAdmin } from './role.utils';

describe('role.utils', () => {
    const patient = ['PATIENT'];
    const doctor = ['DOCTOR'];
    const admin = ['ADMIN'];
    const superAdmin = ['SUPER_ADMIN'];

    describe('area checks', () => {
        it('PATIENT is not staff', () => {
            expect(isStaff(patient)).toBeFalse();
            expect(isPatient(patient)).toBeTrue();
        });

        it('SUPER_ADMIN alone is not staff, but is super admin', () => {
            expect(isStaff(superAdmin)).toBeFalse();
            expect(isSuperAdmin(superAdmin)).toBeTrue();
        });

        it('ADMIN and DOCTOR are staff, not super admin', () => {
            expect(isStaff(admin)).toBeTrue();
            expect(isStaff(doctor)).toBeTrue();
            expect(isSuperAdmin(admin)).toBeFalse();
        });

        it('unknown or missing roles grant nothing', () => {
            expect(isStaff(['SOMETHING'])).toBeFalse();
            expect(isStaff(null)).toBeFalse();
            expect(isPatient(undefined)).toBeFalse();
        });
    });

    describe('homeRouteFor', () => {
        it('sends each role to its own area', () => {
            expect(homeRouteFor(patient)).toBe('/patient');
            expect(homeRouteFor(admin)).toBe('/admin');
            expect(homeRouteFor(doctor)).toBe('/admin');
            expect(homeRouteFor(superAdmin)).toBe('/superadmin');
            expect(homeRouteFor(null)).toBe('/');
        });

        it('prefers the most privileged area for multi-role users', () => {
            expect(homeRouteFor(['PATIENT', 'DOCTOR'])).toBe('/admin');
            expect(homeRouteFor(['ADMIN', 'SUPER_ADMIN'])).toBe('/superadmin');
        });
    });

    describe('canReturnTo', () => {
        it('allows a role back into its own area', () => {
            expect(canReturnTo('/patient/profile', patient)).toBeTrue();
            expect(canReturnTo('/admin/crm/patient?page=2', admin)).toBeTrue();
            expect(canReturnTo('/superadmin/users', superAdmin)).toBeTrue();
        });

        it('refuses cross-role destinations', () => {
            expect(canReturnTo('/admin/overview', patient)).toBeFalse();
            expect(canReturnTo('/superadmin', admin)).toBeFalse();
            expect(canReturnTo('/patient', admin)).toBeFalse();
            expect(canReturnTo('/admin', superAdmin)).toBeFalse();
        });

        it('does not confuse prefixes', () => {
            expect(canReturnTo('/administrator', patient)).toBeTrue();
            expect(canReturnTo('/patients-guide', admin)).toBeTrue();
        });

        it('allows public pages for anyone', () => {
            expect(canReturnTo('/blog', patient)).toBeTrue();
            expect(canReturnTo('/', admin)).toBeTrue();
        });

        it('rejects auth/exception pages and external or malformed URLs', () => {
            expect(canReturnTo('/auth/login', patient)).toBeFalse();
            expect(canReturnTo('/exception/403', patient)).toBeFalse();
            expect(canReturnTo('//evil.example', patient)).toBeFalse();
            expect(canReturnTo('https://evil.example', patient)).toBeFalse();
            expect(canReturnTo('/\\evil.example', patient)).toBeFalse();
            expect(canReturnTo('/javascript:alert(1)', patient)).toBeFalse();
            expect(canReturnTo('', patient)).toBeFalse();
            expect(canReturnTo(null, patient)).toBeFalse();
        });
    });
});
