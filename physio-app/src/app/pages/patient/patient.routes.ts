import { Routes } from '@angular/router';

/**
 * Patient area, guarded by `patientGuardFn` in app.routes.ts. Unknown `/patient/...` URLs fall through
 * to the app-level `**` (404 page).
 *
 * Profile and Security reuse the account/security settings pages: both only call the signed-in user's
 * own endpoints (`/api/users/me/account`, `/me/sessions`, `/change-password`, `/me/preferences`).
 * Appointments are not routed yet: `/api/appointments/*` requires the staff permission
 * `scheduling:appointment:read`, and there is no patient-scoped endpoint.
 */
export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./patient.component').then(m => m.PatientComponent),
        data: { breadcrumb: ['my health'] },
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () => import('./overview/overview.component').then(m => m.PatientOverviewComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('../admin/system/setting/account/account.component').then(m => m.SettingAccountComponent),
                data: { breadcrumb: ['profile'] }
            },
            {
                path: 'security',
                loadComponent: () => import('../admin/system/setting/security/security.component').then(m => m.SecurityComponent),
                data: { breadcrumb: ['security'] }
            }
        ]
    }
];
